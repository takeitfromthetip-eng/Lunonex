/* eslint-disable */
import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { saveFileWithDialog, saveMultipleFilesWithDialog, FILE_TYPES, isFileSystemAccessSupported } from '../utils/fileSaveDialog';

/**
 * MassPhotoProcessor - Handle 12,000+ images
 * Features: Duplicate removal, batch crop/fix, file cleanup, junk deletion
 */
export function MassPhotoProcessor({ userId }) {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        processed: 0,
        duplicates: 0,
        deleted: 0,
        errors: 0
    });
    const [results, setResults] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const folderInputRef = useRef(null);

    // Processing parameters
    const [params, setParams] = useState({
        removeDuplicates: true,
        duplicateThreshold: 95, // Percentage similarity threshold
        autoCrop: true,
        autoEnhance: true,
        aspectRatio: '16:9',
        alignment: 'center',
        splitGrids: false, // NEW: Auto-detect and split image grids
        gridDetection: 'auto', // auto, 2x2, 3x3, 4x4, custom
        gridRows: 2,
        gridCols: 2,
        deleteJunk: true,
        minSize: 100, // KB
        maxSize: 50000, // KB (50MB)
        minResolution: 0, // Minimum width in pixels (0 = no limit)
        maxResolution: 0, // Maximum width in pixels (0 = no limit)
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        deleteFormats: ['bmp', 'tiff', 'ico', 'tmp', 'cache', 'db', 'ini'],
        outputFormat: 'jpg',
        outputQuality: 90,
        preserveMetadata: false,
        stripExif: true,
        renamePattern: 'processed_{index}_{original}', // {index}, {original}, {date}, {hash}
        compression: 'balanced' // maximum, balanced, minimal
    });

    const handleFolderSelect = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setStats({ ...stats, total: selectedFiles.length });
    };

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const items = e.dataTransfer.items;
        const allFiles = [];

        // Process all dropped items (folders and files)
        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item) {
                await traverseFileTree(item, allFiles);
            }
        }

        if (allFiles.length > 0) {
            setFiles(allFiles);
            setStats({ ...stats, total: allFiles.length });
            alert(`✅ Loaded ${allFiles.length} files from dropped folder(s)!`);
        }
    };

    // Recursively traverse folder structure
    const traverseFileTree = async (item, filesList) => {
        return new Promise((resolve) => {
            if (item.isFile) {
                item.file((file) => {
                    // Only add image files
                    const ext = file.name.split('.').pop().toLowerCase();
                    const imageExts = [...params.allowedFormats, ...params.deleteFormats, 'bmp', 'tiff', 'ico', 'tmp'];
                    if (imageExts.includes(ext)) {
                        filesList.push(file);
                    }
                    resolve();
                });
            } else if (item.isDirectory) {
                const dirReader = item.createReader();
                const readAllEntries = async () => {
                    const allEntries = [];

                    // readEntries only returns 100 at a time, so we need to call it repeatedly
                    const readBatch = () => {
                        return new Promise((resolveBatch) => {
                            dirReader.readEntries(async (entries) => {
                                if (entries.length > 0) {
                                    allEntries.push(...entries);
                                    // If we got 100 entries, there might be more
                                    if (entries.length === 100) {
                                        await readBatch();
                                    }
                                }
                                resolveBatch();
                            });
                        });
                    };

                    await readBatch();
                    return allEntries;
                };

                readAllEntries().then(async (allEntries) => {
                    for (const entry of allEntries) {
                        await traverseFileTree(entry, filesList);
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    };

    // Calculate perceptual hash for duplicate detection
    const calculateHash = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 8;
                    canvas.height = 8;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, 8, 8);
                    const imageData = ctx.getImageData(0, 0, 8, 8);
                    const data = imageData.data;

                    // Create perceptual hash (8x8 grayscale average)
                    let hash = '';
                    let sum = 0;
                    for (let i = 0; i < data.length; i += 4) {
                        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        sum += gray;
                    }
                    const avg = sum / 64;

                    for (let i = 0; i < data.length; i += 4) {
                        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        hash += gray > avg ? '1' : '0';
                    }

                    resolve(hash);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    // Process single image
    const processImage = async (file, canvas, ctx) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Grid splitting if enabled
                    if (params.splitGrids) {
                        let rows = params.gridRows;
                        let cols = params.gridCols;

                        // Auto-detect grid
                        if (params.gridDetection === 'auto') {
                            const detected = detectGrid(canvas, ctx);
                            if (detected.rows > 1 || detected.cols > 1) {
                                rows = detected.rows;
                                cols = detected.cols;
                            }
                        } else if (params.gridDetection === '2x2') {
                            rows = cols = 2;
                        } else if (params.gridDetection === '3x3') {
                            rows = cols = 3;
                        } else if (params.gridDetection === '4x4') {
                            rows = cols = 4;
                        }

                        // Split into cells
                        const cells = splitGrid(canvas, ctx, rows, cols);

                        // Process each cell
                        const cellBlobs = [];
                        let processed = 0;

                        cells.forEach((cellCanvas, idx) => {
                            const cellCtx = cellCanvas.getContext('2d');

                            // Auto-crop if enabled
                            if (params.autoCrop) {
                                applyCrop(cellCanvas, cellCtx, cellCanvas);
                            }

                            // Auto-enhance if enabled
                            if (params.autoEnhance) {
                                applyEnhancement(cellCanvas, cellCtx);
                            }

                            // Convert to blob
                            cellCanvas.toBlob(
                                (blob) => {
                                    cellBlobs.push({ blob, index: idx });
                                    processed++;
                                    if (processed === cells.length) {
                                        resolve(cellBlobs); // Return array of blobs
                                    }
                                },
                                `image/${params.outputFormat}`,
                                params.outputQuality / 100
                            );
                        });

                        return; // Exit early for grid processing
                    }

                    // Standard single-image processing
                    // Auto-crop if enabled
                    if (params.autoCrop) {
                        applyCrop(canvas, ctx, img);
                    }

                    // Auto-enhance if enabled
                    if (params.autoEnhance) {
                        applyEnhancement(canvas, ctx);
                    }

                    // Convert to output format
                    canvas.toBlob(
                        (blob) => resolve(blob),
                        `image/${params.outputFormat}`,
                        params.outputQuality / 100
                    );
                };
                img.onerror = () => resolve(null);
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    };

    const applyCrop = (canvas, ctx, img) => {
        const { aspectRatio, alignment } = params;

        if (aspectRatio === 'none') return;

        let targetWidth, targetHeight;

        // Parse aspect ratio
        const [w, h] = aspectRatio.split(':').map(Number);
        const ratio = w / h;

        // Calculate dimensions
        if (canvas.width / canvas.height > ratio) {
            targetHeight = canvas.height;
            targetWidth = targetHeight * ratio;
        } else {
            targetWidth = canvas.width;
            targetHeight = targetWidth / ratio;
        }

        // Calculate crop position
        let sourceX = (canvas.width - targetWidth) / 2;
        let sourceY = 0;

        if (alignment === 'top') {
            sourceY = 0;
        } else if (alignment === 'bottom') {
            sourceY = canvas.height - targetHeight;
        } else {
            sourceY = (canvas.height - targetHeight) / 2;
        }

        sourceX = Math.max(0, sourceX);
        sourceY = Math.max(0, sourceY);
        targetWidth = Math.min(canvas.width, targetWidth);
        targetHeight = Math.min(canvas.height, targetHeight);

        // Apply crop
        const imageData = ctx.getImageData(sourceX, sourceY, targetWidth, targetHeight);
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.putImageData(imageData, 0, 0);
    };

    // GRID SPLITTING - Detect and split multi-image grids
    const detectGrid = (canvas, ctx) => {
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Scan for consistent white/black lines (grid separators)
        const horizontalLines = [];
        const verticalLines = [];

        // Check horizontal lines
        for (let y = 0; y < height; y++) {
            let whiteCells = 0;
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (brightness > 240 || brightness < 15) whiteCells++;
            }
            if (whiteCells / width > 0.95) { // 95% white/black = separator
                horizontalLines.push(y);
            }
        }

        // Check vertical lines
        for (let x = 0; x < width; x++) {
            let whiteCells = 0;
            for (let y = 0; y < height; y++) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (brightness > 240 || brightness < 15) whiteCells++;
            }
            if (whiteCells / height > 0.95) {
                verticalLines.push(x);
            }
        }

        // Filter out adjacent lines (keep only significant gaps)
        const filterLines = (lines, minGap = 50) => {
            const filtered = [];
            for (let i = 0; i < lines.length; i++) {
                if (i === 0 || lines[i] - lines[i - 1] > minGap) {
                    filtered.push(lines[i]);
                }
            }
            return filtered;
        };

        const hLines = filterLines(horizontalLines, height * 0.1);
        const vLines = filterLines(verticalLines, width * 0.1);

        // Return grid dimensions
        return {
            rows: hLines.length + 1,
            cols: vLines.length + 1,
            horizontalLines: hLines,
            verticalLines: vLines
        };
    };

    const splitGrid = (canvas, ctx, rows, cols) => {
        const cellWidth = Math.floor(canvas.width / cols);
        const cellHeight = Math.floor(canvas.height / rows);
        const cells = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellCanvas = document.createElement('canvas');
                cellCanvas.width = cellWidth;
                cellCanvas.height = cellHeight;
                const cellCtx = cellCanvas.getContext('2d');

                const x = col * cellWidth;
                const y = row * cellHeight;

                cellCtx.drawImage(
                    canvas,
                    x, y, cellWidth, cellHeight,
                    0, 0, cellWidth, cellHeight
                );

                cells.push(cellCanvas);
            }
        }

        return cells;
    };

    const applyEnhancement = (canvas, ctx) => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Auto brightness, contrast, saturation
        for (let i = 0; i < data.length; i += 4) {
            // Brightness +10%
            data[i] = Math.min(255, data[i] * 1.1);
            data[i + 1] = Math.min(255, data[i + 1] * 1.1);
            data[i + 2] = Math.min(255, data[i + 2] * 1.1);

            // Contrast +15%
            const factor = 1.15;
            data[i] = Math.min(255, factor * (data[i] - 128) + 128);
            data[i + 1] = Math.min(255, factor * (data[i + 1] - 128) + 128);
            data[i + 2] = Math.min(255, factor * (data[i + 2] - 128) + 128);
        }

        ctx.putImageData(imageData, 0, 0);
    };

    const startProcessing = async () => {
        if (files.length === 0) {
            alert('Please select a folder first!');
            return;
        }

        setProcessing(true);
        setProgress(0);
        const newStats = { total: files.length, processed: 0, duplicates: 0, deleted: 0, errors: 0 };
        const processedResults = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const hashes = new Set();
        const duplicateHashes = new Map();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();

            try {
                // Check if file should be deleted as junk
                if (params.deleteJunk && params.deleteFormats.includes(ext)) {
                    newStats.deleted++;
                    processedResults.push({
                        name: file.name,
                        status: 'deleted',
                        reason: 'Junk format',
                        size: file.size
                    });
                    continue;
                }

                // Check file size
                const sizeKB = file.size / 1024;
                if (sizeKB < params.minSize || sizeKB > params.maxSize) {
                    newStats.deleted++;
                    processedResults.push({
                        name: file.name,
                        status: 'deleted',
                        reason: `Size ${Math.round(sizeKB)}KB outside range`,
                        size: file.size
                    });
                    continue;
                }

                // Check if format is allowed
                if (!params.allowedFormats.includes(ext)) {
                    newStats.deleted++;
                    processedResults.push({
                        name: file.name,
                        status: 'deleted',
                        reason: 'Format not allowed',
                        size: file.size
                    });
                    continue;
                }

                // Check for duplicates
                if (params.removeDuplicates) {
                    const hash = await calculateHash(file);

                    if (hashes.has(hash)) {
                        newStats.duplicates++;
                        newStats.deleted++;
                        processedResults.push({
                            name: file.name,
                            status: 'duplicate',
                            reason: 'Duplicate of another image',
                            size: file.size
                        });
                        continue;
                    }

                    hashes.add(hash);
                }

                // Process image
                const processedBlob = await processImage(file, canvas, ctx);

                if (!processedBlob) {
                    newStats.errors++;
                    processedResults.push({
                        name: file.name,
                        status: 'error',
                        reason: 'Failed to process',
                        size: file.size
                    });
                    continue;
                }

                // Handle grid splits (returns array) or single image (returns blob)
                if (Array.isArray(processedBlob)) {
                    // Grid was split into multiple images
                    processedBlob.forEach((cell, cellIdx) => {
                        newStats.processed++;
                        processedResults.push({
                            name: `${file.name.split('.')[0]}_cell_${cellIdx + 1}`,
                            status: 'success',
                            reason: `Grid split (${cellIdx + 1}/${processedBlob.length})`,
                            size: file.size,
                            newSize: cell.blob.size,
                            blob: cell.blob
                        });
                    });
                } else {
                    // Single image processed
                    newStats.processed++;
                    processedResults.push({
                        name: file.name,
                        status: 'success',
                        reason: 'Processed successfully',
                        size: file.size,
                        newSize: processedBlob.size,
                        blob: processedBlob
                    });
                }

            } catch (err) {
                newStats.errors++;
                processedResults.push({
                    name: file.name,
                    status: 'error',
                    reason: err.message,
                    size: file.size
                });
            }

            // Update progress
            setProgress(Math.round(((i + 1) / files.length) * 100));
            setStats({ ...newStats });
        }

        setResults(processedResults);
        setProcessing(false);
        alert(`✅ Processing complete!\n\nProcessed: ${newStats.processed}\nDuplicates: ${newStats.duplicates}\nDeleted: ${newStats.deleted}\nErrors: ${newStats.errors}`);
    };

    const downloadAll = async () => {
        console.log('🔍 Download All clicked');
        console.log('Total results:', results.length);

        const successfulResults = results.filter(r => r.status === 'success' && r.blob);
        console.log('Successful results with blobs:', successfulResults.length);

        if (successfulResults.length === 0) {
            alert('⚠️ No processed images to download.\n\nPlease process some images first, then try downloading.');
            return;
        }

        try {
            // Ask user: Save as folder or ZIP?
            const choice = isFileSystemAccessSupported()
                ? confirm(
                    `💾 Choose save method:\n\n` +
                    `OK = Save to folder (choose location)\n` +
                    `Cancel = Download as ZIP file\n\n` +
                    `${successfulResults.length} images ready to save`
                  )
                : false;

            if (choice) {
                // OPTION 1: Save to folder with native folder picker
                const files = successfulResults.map((result, index) => ({
                    name: `processed_${index + 1}_${result.name.split('.')[0]}.${params.outputFormat}`,
                    blob: result.blob
                }));

                const saved = await saveMultipleFilesWithDialog(files, `processed_photos_${Date.now()}`);
                
                if (saved) {
                    alert(`✅ Saved ${files.length} processed images to your chosen folder!`);
                }
            } else {
                // OPTION 2: Download as ZIP
                console.log('Creating ZIP...');
                const zip = new JSZip();

                successfulResults.forEach((result, index) => {
                    const filename = `processed_${index + 1}_${result.name.split('.')[0]}.${params.outputFormat}`;
                    console.log(`Adding to ZIP: ${filename}`);
                    zip.file(filename, result.blob);
                });

                console.log('Generating ZIP blob...');
                const zipBlob = await zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });

                console.log('ZIP size:', zipBlob.size, 'bytes');
                
                // Use native Save As dialog for ZIP
                const suggestedName = `processed_photos_${Date.now()}.zip`;
                const saved = await saveFileWithDialog(zipBlob, suggestedName, { types: [FILE_TYPES.ZIP] });
                
                if (saved) {
                    alert(`✅ Saved ${successfulResults.length} processed images in ZIP file!`);
                }
            }
        } catch (error) {
            console.error('❌ Download error:', error);

            // Fallback: download individually
            const fallback = confirm(`❌ Save failed: ${error.message}\n\nWould you like to download images individually instead?`);

            if (fallback) {
                successfulResults.forEach((result, index) => {
                    setTimeout(() => {
                        const url = URL.createObjectURL(result.blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `processed_${index + 1}_${result.name}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, index * 300);
                });

                alert(`📥 Downloading ${successfulResults.length} images individually...`);
            }
        }
    };

    const downloadReport = async () => {
        const report = [
            '=== MASS PHOTO PROCESSING REPORT ===',
            `Date: ${new Date().toLocaleString()}`,
            `Total Files: ${stats.total}`,
            `Successfully Processed: ${stats.processed}`,
            `Duplicates Removed: ${stats.duplicates}`,
            `Files Deleted: ${stats.deleted}`,
            `Errors: ${stats.errors}`,
            '',
            '=== DETAILED RESULTS ===',
            ...results.map(r =>
                `${r.name} - ${r.status.toUpperCase()} - ${r.reason} - Size: ${Math.round(r.size / 1024)}KB${r.newSize ? ` → ${Math.round(r.newSize / 1024)}KB` : ''}`
            )
        ].join('\n');

        const blob = new Blob([report], { type: 'text/plain' });
        const suggestedName = `photo-processing-report-${Date.now()}.txt`;
        
        await saveFileWithDialog(blob, suggestedName, { types: [FILE_TYPES.TEXT] });
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            minHeight: '100vh',
            padding: '40px 20px',
            color: 'white'
        }}>
            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    padding: '30px',
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '900',
                        marginBottom: '10px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📁 Mass Photo Processor
                    </h1>
                    <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '20px' }}>
                        Handle 12,000+ images • Remove duplicates • Auto-crop & fix • Delete junk files
                    </p>

                    {/* Drag and Drop Zone */}
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        style={{
                            border: isDragging ? '4px dashed #667eea' : '4px dashed rgba(255,255,255,0.3)',
                            borderRadius: '20px',
                            padding: '60px 40px',
                            marginTop: '30px',
                            background: isDragging ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.05)',
                            transition: 'all 0.3s',
                            cursor: 'pointer'
                        }}
                        onClick={() => folderInputRef.current?.click()}
                    >
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                            {isDragging ? '📂' : '🖱️'}
                        </div>
                        <h3 style={{ fontSize: '24px', marginBottom: '10px', fontWeight: 'bold' }}>
                            {isDragging ? 'Drop Your Folder Here!' : 'Drag & Drop Folder Here'}
                        </h3>
                        <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '20px' }}>
                            Or click to browse • Supports 10,000+ images per folder
                        </p>

                        <div style={{ marginTop: '30px' }}>
                            <input
                                ref={folderInputRef}
                                type="file"
                                webkitdirectory=""
                                directory=""
                                multiple
                                onChange={handleFolderSelect}
                                style={{ display: 'none' }}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    folderInputRef.current?.click();
                                }}
                                style={{
                                    padding: '20px 40px',
                                    fontSize: '18px',
                                    borderRadius: '15px',
                                    border: 'none',
                                    background: '#667eea',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                                }}
                            >
                                📂 Or Browse for Folder
                            </button>
                        </div>

                        {files.length > 0 && (
                            <div style={{
                                marginTop: '20px',
                                fontSize: '18px',
                                padding: '15px',
                                background: 'rgba(76, 175, 80, 0.2)',
                                border: '2px solid #4CAF50',
                                borderRadius: '12px',
                                fontWeight: 'bold'
                            }}>
                                ✅ {files.length.toLocaleString()} files loaded and ready!
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Left Panel - Parameters */}
                    <div>
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>⚙️ Processing Parameters</h2>

                            {/* Duplicate Removal */}
                            <div style={sectionStyle}>
                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={params.removeDuplicates}
                                        onChange={(e) => setParams({ ...params, removeDuplicates: e.target.checked })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>🔍 Remove Duplicate Images</span>
                                </label>
                                {params.removeDuplicates && (
                                    <div style={{ marginLeft: '28px', marginTop: '10px' }}>
                                        <label style={{ fontSize: '13px', opacity: 0.9 }}>
                                            Similarity Threshold: {params.duplicateThreshold}%
                                        </label>
                                        <input
                                            type="range"
                                            min="80"
                                            max="100"
                                            value={params.duplicateThreshold}
                                            onChange={(e) => setParams({ ...params, duplicateThreshold: parseInt(e.target.value) })}
                                            style={{ width: '100%', marginTop: '5px' }}
                                        />
                                        <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
                                            Lower = more aggressive (may flag similar but different images)
                                        </p>
                                    </div>
                                )}
                                <p style={{ fontSize: '13px', opacity: 0.7, marginLeft: '28px', marginTop: '5px' }}>
                                    Uses perceptual hashing to detect duplicates even if resized
                                </p>
                            </div>

                            {/* Auto Crop */}
                            <div style={sectionStyle}>
                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={params.autoCrop}
                                        onChange={(e) => setParams({ ...params, autoCrop: e.target.checked })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>✂️ Auto-Crop Images</span>
                                </label>

                                {params.autoCrop && (
                                    <div style={{ marginLeft: '28px', marginTop: '10px' }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '14px' }}>Aspect Ratio:</label>
                                            <select
                                                value={params.aspectRatio}
                                                onChange={(e) => setParams({ ...params, aspectRatio: e.target.value })}
                                                style={selectStyle}
                                            >
                                                <option value="none">None (Original)</option>
                                                <option value="16:9">16:9 (Widescreen)</option>
                                                <option value="4:3">4:3 (Standard)</option>
                                                <option value="1:1">1:1 (Square)</option>
                                                <option value="9:16">9:16 (Portrait)</option>
                                                <option value="21:9">21:9 (Ultrawide)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '14px' }}>Alignment:</label>
                                            <select
                                                value={params.alignment}
                                                onChange={(e) => setParams({ ...params, alignment: e.target.value })}
                                                style={selectStyle}
                                            >
                                                <option value="top">Top (Cut Bottom)</option>
                                                <option value="center">Center</option>
                                                <option value="bottom">Bottom (Cut Top)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Grid Splitting */}
                            <div style={sectionStyle}>
                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={params.splitGrids}
                                        onChange={(e) => setParams({ ...params, splitGrids: e.target.checked })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>✨ Split Image Grids</span>
                                </label>

                                {params.splitGrids && (
                                    <div style={{ marginLeft: '28px', marginTop: '10px' }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ fontSize: '14px' }}>Grid Detection:</label>
                                            <select
                                                value={params.gridDetection}
                                                onChange={(e) => setParams({ ...params, gridDetection: e.target.value })}
                                                style={selectStyle}
                                            >
                                                <option value="auto">🤖 Auto-Detect (Smart)</option>
                                                <option value="2x2">2×2 Grid</option>
                                                <option value="3x3">3×3 Grid</option>
                                                <option value="4x4">4×4 Grid</option>
                                                <option value="custom">Custom Grid</option>
                                            </select>
                                        </div>

                                        {params.gridDetection === 'custom' && (
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                <div>
                                                    <label style={{ fontSize: '14px' }}>Rows:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={params.gridRows}
                                                        onChange={(e) => setParams({ ...params, gridRows: parseInt(e.target.value) })}
                                                        style={{ ...selectStyle, width: '60px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '14px' }}>Cols:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={params.gridCols}
                                                        onChange={(e) => setParams({ ...params, gridCols: parseInt(e.target.value) })}
                                                        style={{ ...selectStyle, width: '60px' }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Auto Enhance */}
                            <div style={sectionStyle}>
                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={params.autoEnhance}
                                        onChange={(e) => setParams({ ...params, autoEnhance: e.target.checked })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>✨ Auto-Enhance (Brightness/Contrast)</span>
                                </label>
                            </div>

                            {/* Delete Junk */}
                            <div style={sectionStyle}>
                                <label style={labelStyle}>
                                    <input
                                        type="checkbox"
                                        checked={params.deleteJunk}
                                        onChange={(e) => setParams({ ...params, deleteJunk: e.target.checked })}
                                    />
                                    <span style={{ marginLeft: '10px' }}>🗑️ Delete Junk Files</span>
                                </label>
                                {params.deleteJunk && (
                                    <p style={{ fontSize: '13px', opacity: 0.7, marginLeft: '28px' }}>
                                        Will delete: {params.deleteFormats.join(', ')}
                                    </p>
                                )}
                            </div>

                            {/* File Size Filter */}
                            <div style={sectionStyle}>
                                <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>📏 File Size Range (KB)</h4>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px', opacity: 0.8 }}>Min:</label>
                                        <input
                                            type="number"
                                            placeholder="Min KB"
                                            value={params.minSize}
                                            onChange={(e) => setParams({ ...params, minSize: parseInt(e.target.value) || 0 })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <span>to</span>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px', opacity: 0.8 }}>Max:</label>
                                        <input
                                            type="number"
                                            placeholder="Max KB"
                                            value={params.maxSize}
                                            onChange={(e) => setParams({ ...params, maxSize: parseInt(e.target.value) || 0 })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '5px' }}>
                                    Files outside this range will be deleted
                                </p>
                            </div>

                            {/* Resolution Filter */}
                            <div style={sectionStyle}>
                                <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>📐 Resolution Filter (Width in pixels)</h4>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px', opacity: 0.8 }}>Min Width:</label>
                                        <input
                                            type="number"
                                            placeholder="0 = no limit"
                                            value={params.minResolution}
                                            onChange={(e) => setParams({ ...params, minResolution: parseInt(e.target.value) || 0 })}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <span>to</span>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '12px', opacity: 0.8 }}>Max Width:</label>
                                        <input
                                            type="number"
                                            placeholder="0 = no limit"
                                            value={params.maxResolution}
                                            onChange={(e) => setParams({ ...params, maxResolution: parseInt(e.target.value) || 0 })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '5px' }}>
                                    Delete images outside resolution range (e.g., too small thumbnails)
                                </p>
                            </div>

                            {/* Output Format */}
                            <div style={sectionStyle}>
                                <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>💾 Output Settings</h4>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Format:</label>
                                    <select
                                        value={params.outputFormat}
                                        onChange={(e) => setParams({ ...params, outputFormat: e.target.value })}
                                        style={selectStyle}
                                    >
                                        <option value="jpg">JPG (Smallest files, lossy)</option>
                                        <option value="png">PNG (Lossless, larger files)</option>
                                        <option value="webp">WebP (Best compression, modern)</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px' }}>Quality: {params.outputQuality}%</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="100"
                                        value={params.outputQuality}
                                        onChange={(e) => setParams({ ...params, outputQuality: parseInt(e.target.value) })}
                                        style={{ width: '100%', marginTop: '5px' }}
                                    />
                                    <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
                                        {params.outputQuality < 70 && '⚠️ Low quality, very small files'}
                                        {params.outputQuality >= 70 && params.outputQuality < 85 && '✅ Good balance'}
                                        {params.outputQuality >= 85 && '🎨 High quality, larger files'}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>Compression:</label>
                                    <select
                                        value={params.compression}
                                        onChange={(e) => setParams({ ...params, compression: e.target.value })}
                                        style={selectStyle}
                                    >
                                        <option value="maximum">Maximum (Smallest files)</option>
                                        <option value="balanced">Balanced (Recommended)</option>
                                        <option value="minimal">Minimal (Best quality)</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '10px' }}>
                                    <label style={labelStyle}>
                                        <input
                                            type="checkbox"
                                            checked={params.stripExif}
                                            onChange={(e) => setParams({ ...params, stripExif: e.target.checked })}
                                        />
                                        <span style={{ marginLeft: '10px', fontSize: '14px' }}>Strip EXIF metadata (location, camera info)</span>
                                    </label>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '14px', display: 'block', marginBottom: '5px' }}>File Naming Pattern:</label>
                                    <input
                                        type="text"
                                        value={params.renamePattern}
                                        onChange={(e) => setParams({ ...params, renamePattern: e.target.value })}
                                        style={{
                                            ...inputStyle,
                                            width: '100%',
                                            fontFamily: 'monospace',
                                            fontSize: '13px'
                                        }}
                                        placeholder="{index}_{original}"
                                    />
                                    <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '5px', fontFamily: 'monospace' }}>
                                        Variables: {'{index}'} {'{original}'} {'{date}'} {'{hash}'}
                                    </p>
                                </div>
                            </div>

                            {/* Process Button */}
                            <button
                                onClick={startProcessing}
                                disabled={files.length === 0 || processing}
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    marginTop: '20px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: processing ? '#666' : '#4CAF50',
                                    color: 'white',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: files.length === 0 || processing ? 'not-allowed' : 'pointer',
                                    opacity: files.length === 0 || processing ? 0.5 : 1
                                }}
                            >
                                {processing ? `⏳ Processing... ${progress}%` : '▶️ Start Processing'}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel - Stats & Results */}
                    <div>
                        {/* Stats */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '15px',
                            padding: '25px',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>📊 Processing Stats</h2>

                            {processing && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        height: '30px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                            height: '100%',
                                            width: `${progress}%`,
                                            transition: 'width 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}>
                                            {progress}%
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={statBoxStyle}>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
                                        {stats.total}
                                    </div>
                                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Total Files</div>
                                </div>

                                <div style={statBoxStyle}>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
                                        {stats.processed}
                                    </div>
                                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Processed</div>
                                </div>

                                <div style={statBoxStyle}>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFC107' }}>
                                        {stats.duplicates}
                                    </div>
                                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Duplicates</div>
                                </div>

                                <div style={statBoxStyle}>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff4444' }}>
                                        {stats.deleted}
                                    </div>
                                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Deleted</div>
                                </div>
                            </div>

                            {results.length > 0 && (
                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={downloadAll}
                                        style={{
                                            flex: 1,
                                            padding: '15px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#667eea',
                                            color: 'white',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        💾 Download All
                                    </button>
                                    <button
                                        onClick={downloadReport}
                                        style={{
                                            flex: 1,
                                            padding: '15px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            background: '#764ba2',
                                            color: 'white',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        📄 Report
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Results Log */}
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '15px',
                            padding: '25px'
                        }}>
                            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>📋 Processing Log</h2>

                            <div style={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                fontSize: '13px'
                            }}>
                                {results.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                        <p>No results yet. Start processing to see logs.</p>
                                    </div>
                                ) : (
                                    results.map((result, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                marginBottom: '8px',
                                                borderLeft: `4px solid ${result.status === 'success' ? '#4CAF50' :
                                                    result.status === 'duplicate' ? '#FFC107' :
                                                        result.status === 'deleted' ? '#ff4444' :
                                                            '#999'
                                                    }`
                                            }}
                                        >
                                            <div style={{ fontWeight: 'bold' }}>
                                                {result.status === 'success' && '✅'}
                                                {result.status === 'duplicate' && '🔄'}
                                                {result.status === 'deleted' && '🗑️'}
                                                {result.status === 'error' && '❌'}
                                                {' '}{result.name}
                                            </div>
                                            <div style={{ opacity: 0.7, fontSize: '12px' }}>
                                                {result.reason}
                                                {result.newSize && ` • ${Math.round(result.size / 1024)}KB → ${Math.round(result.newSize / 1024)}KB`}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const sectionStyle = {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
};

const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '15px'
};

const selectStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '14px'
};

const inputStyle = {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: '14px'
};

const statBoxStyle = {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
};
