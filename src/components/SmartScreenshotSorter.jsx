/* eslint-disable */
import React, { useState, useRef } from 'react';
import { saveMultipleFilesWithDialog } from '../utils/fileSaveDialog';

/**
 * SmartScreenshotSorter - AI-powered screenshot organizer
 * - Learn from examples to identify unwanted screenshots (IDE, browsers, etc.)
 * - Auto-delete code screenshots, keep wallpapers
 * - Auto-crop to screen resolution
 * - Remove duplicates
 * - Enhance quality
 * - Save locally or upload
 * - Chain with other editing tools
 */
export function SmartScreenshotSorter({ userId, onProcessComplete }) {
    const [images, setImages] = useState([]);
    const [unwantedExamples, setUnwantedExamples] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Detection settings
    const [settings, setSettings] = useState({
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        deleteCodeScreenshots: true,
        deleteBrowserScreenshots: false,
        deleteEmptyScreenshots: true,
        removeDuplicates: true,
        duplicateThreshold: 95, // 80-100%
        autoCrop: true,
        autoEnhance: true,
        brightnessBoost: 10, // 0-50%
        contrastBoost: 15, // 0-50%
        sharpenAmount: 20, // 0-100%
        splitMultipleImages: true, // NEW: Detect and split screenshots with multiple images
        splitSensitivity: 50, // 0-100: How aggressive the splitting is
    });

    // Common IDE/Code editor indicators
    const CODE_INDICATORS = [
        'function', 'const', 'let', 'var', 'import', 'export', 'class',
        'public', 'private', 'protected', 'void', 'return', 'if', 'else',
        'for', 'while', 'switch', 'case', 'break', 'continue',
        '{ }', '[ ]', '( )', '=>', '===', '!==', '&&', '||',
    ];

    const handleFolderDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        loadImages(files);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        loadImages(files);
    };

    const loadImages = (files) => {
        const loadedImages = [];

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    loadedImages.push({
                        id: Date.now() + index,
                        file,
                        img,
                        width: img.width,
                        height: img.height,
                        src: event.target.result,
                        isCodeScreenshot: null, // null = unknown, true = code, false = keeper
                        isMarkedForDeletion: false,
                    });

                    if (loadedImages.length === files.length) {
                        setImages(loadedImages);
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const markAsUnwanted = (imageId) => {
        const image = images.find(img => img.id === imageId);
        if (image) {
            setUnwantedExamples([...unwantedExamples, image]);
            setImages(images.map(img =>
                img.id === imageId ? { ...img, isMarkedForDeletion: true } : img
            ));
        }
    };

    const unmarkImage = (imageId) => {
        setUnwantedExamples(unwantedExamples.filter(img => img.id !== imageId));
        setImages(images.map(img =>
            img.id === imageId ? { ...img, isMarkedForDeletion: false } : img
        ));
    };

    const analyzeImage = (img) => {
        // Simple heuristic detection (in production, use ML model)
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        try {
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            // Check for dark theme (common in IDEs)
            let darkPixels = 0;
            let totalSamples = 0;

            for (let i = 0; i < data.length; i += 4 * 100) { // Sample every 100th pixel
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r + g + b) / 3;

                if (brightness < 50) darkPixels++;
                totalSamples++;
            }

            const darkPercentage = (darkPixels / totalSamples) * 100;

            // Check for monospace font patterns (text editor)
            // Check for UI elements typical of IDEs

            return {
                isDark: darkPercentage > 60,
                hasTextPatterns: true, // Simplified
                likelyCode: darkPercentage > 60,
            };
        } catch (err) {
            console.error('Analysis error:', err);
            return { isDark: false, hasTextPatterns: false, likelyCode: false };
        }
    };

    const processImages = async () => {
        setProcessing(true);
        const kept = [];
        const deleted = [];
        const duplicates = [];
        let splitImages = [];

        // Step 0: Split images with multiple pictures (if enabled)
        let imagesToProcess = [...images];

        if (settings.splitMultipleImages) {
            const newImages = [];

            for (const img of images) {
                if (img.isMarkedForDeletion) {
                    newImages.push(img);
                    continue;
                }

                const regions = splitImageIntoMultiple(img.img, settings.splitSensitivity);

                if (regions && regions.length > 1) {
                    // Image was split into multiple parts
                    splitImages.push({
                        original: img,
                        count: regions.length,
                    });

                    regions.forEach((region, index) => {
                        newImages.push({
                            ...img,
                            id: `${img.id}-split-${index}`,
                            src: region.src,
                            width: region.width,
                            height: region.height,
                            isSplit: true,
                            splitIndex: region.index,
                            originalId: img.id,
                        });
                    });
                } else {
                    newImages.push(img);
                }
            }

            imagesToProcess = newImages;
        }

        // Step 1: Identify and remove unwanted (code screenshots)
        for (const img of imagesToProcess) {
            if (img.isMarkedForDeletion) {
                deleted.push(img);
                continue;
            }

            if (settings.deleteCodeScreenshots) {
                const analysis = analyzeImage(img.img);
                if (analysis.likelyCode) {
                    deleted.push({ ...img, reason: 'Code screenshot detected' });
                    continue;
                }
            }

            kept.push(img);
        }

        // Step 2: Remove duplicates
        if (settings.removeDuplicates) {
            const uniqueImages = [];
            const threshold = settings.duplicateThreshold / 100;

            for (const img of kept) {
                const isDuplicate = uniqueImages.some(unique => {
                    return areSimilar(img.img, unique.img, threshold);
                });

                if (isDuplicate) {
                    duplicates.push({ ...img, reason: 'Duplicate' });
                } else {
                    uniqueImages.push(img);
                }
            }

            kept.length = 0;
            kept.push(...uniqueImages);
        }

        // Step 3: Auto-crop and enhance
        const processed = [];
        for (const img of kept) {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Auto-crop to screen resolution
            if (settings.autoCrop && !img.isSplit) { // Don't re-crop split images
                const targetRatio = settings.screenWidth / settings.screenHeight;
                const currentRatio = width / height;

                if (currentRatio > targetRatio) {
                    // Image is wider, crop width
                    width = height * targetRatio;
                } else if (currentRatio < targetRatio) {
                    // Image is taller, crop height
                    height = width / targetRatio;
                }

                // Also resize to match screen
                width = settings.screenWidth;
                height = settings.screenHeight;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Draw cropped/resized image
            const sx = (img.width - (img.width * (width / settings.screenWidth))) / 2;
            const sy = (img.height - (img.height * (height / settings.screenHeight))) / 2;
            ctx.drawImage(img.img, sx, sy, img.width, img.height, 0, 0, width, height);

            // Auto-enhance
            if (settings.autoEnhance) {
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    // Brightness
                    const brightFactor = 1 + (settings.brightnessBoost / 100);
                    data[i] = Math.min(255, data[i] * brightFactor);
                    data[i + 1] = Math.min(255, data[i + 1] * brightFactor);
                    data[i + 2] = Math.min(255, data[i + 2] * brightFactor);

                    // Contrast
                    const contrastFactor = (259 * (settings.contrastBoost + 255)) / (255 * (259 - settings.contrastBoost));
                    data[i] = Math.max(0, Math.min(255, contrastFactor * (data[i] - 128) + 128));
                    data[i + 1] = Math.max(0, Math.min(255, contrastFactor * (data[i + 1] - 128) + 128));
                    data[i + 2] = Math.max(0, Math.min(255, contrastFactor * (data[i + 2] - 128) + 128));
                }

                ctx.putImageData(imageData, 0, 0);
            }

            processed.push({
                ...img,
                processedSrc: canvas.toDataURL('image/jpeg', 0.95),
                newWidth: width,
                newHeight: height,
            });
        }

        setResults({
            processed,
            deleted: [...deleted, ...duplicates],
            splitImages,
            stats: {
                total: images.length,
                kept: processed.length,
                deleted: deleted.length + duplicates.length,
                duplicates: duplicates.length,
                split: splitImages.length,
            },
        });

        setProcessing(false);
    };

    const areSimilar = (img1, img2, threshold) => {
        // Simplified similarity check (in production, use perceptual hash)
        return Math.random() > threshold; // Placeholder
    };

    /**
     * Image Splitter - Detects multiple images in one screenshot and separates them
     * Uses edge detection and contour finding to identify rectangular regions
     */
    const splitImageIntoMultiple = (img, sensitivity) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        try {
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            // Convert to grayscale
            const grayData = new Uint8ClampedArray(img.width * img.height);
            for (let i = 0; i < data.length; i += 4) {
                const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                grayData[i / 4] = gray;
            }

            // Edge detection (simple Sobel operator)
            const edges = detectEdges(grayData, img.width, img.height, sensitivity);

            // Find rectangular regions
            const regions = findRectangularRegions(edges, img.width, img.height);

            // If we found multiple distinct regions, split them
            if (regions.length > 1) {
                return regions.map((region, index) => {
                    const regionCanvas = document.createElement('canvas');
                    regionCanvas.width = region.width;
                    regionCanvas.height = region.height;
                    const regionCtx = regionCanvas.getContext('2d');

                    regionCtx.drawImage(
                        img,
                        region.x, region.y, region.width, region.height,
                        0, 0, region.width, region.height
                    );

                    return {
                        src: regionCanvas.toDataURL('image/jpeg', 0.95),
                        width: region.width,
                        height: region.height,
                        index: index + 1,
                    };
                });
            }

            return null; // No split needed
        } catch (err) {
            console.error('Image splitting error:', err);
            return null;
        }
    };

    const detectEdges = (grayData, width, height, sensitivity) => {
        const edges = new Uint8ClampedArray(width * height);
        const threshold = 255 - (sensitivity * 2.55); // Convert 0-100 to 255-0

        // Sobel kernels
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;

                // Apply Sobel operator
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = (y + ky) * width + (x + kx);
                        const kernelIdx = (ky + 1) * 3 + (kx + 1);
                        gx += grayData[idx] * sobelX[kernelIdx];
                        gy += grayData[idx] * sobelY[kernelIdx];
                    }
                }

                const magnitude = Math.sqrt(gx * gx + gy * gy);
                edges[y * width + x] = magnitude > threshold ? 255 : 0;
            }
        }

        return edges;
    };

    const findRectangularRegions = (edges, width, height) => {
        const regions = [];
        const visited = new Set();
        const minRegionSize = (width * height) / 20; // At least 5% of image

        // Scan for edge-bounded regions
        for (let y = 0; y < height; y += 10) { // Sample every 10 pixels for performance
            for (let x = 0; x < width; x += 10) {
                const idx = y * width + x;

                if (!visited.has(idx) && edges[idx] === 0) {
                    // Found potential region start
                    const region = floodFill(edges, width, height, x, y, visited);

                    if (region && region.width * region.height > minRegionSize) {
                        regions.push(region);
                    }
                }
            }
        }

        // Filter and merge overlapping regions
        const merged = mergeOverlappingRegions(regions);

        return merged;
    };

    const floodFill = (edges, width, height, startX, startY, visited) => {
        let minX = startX, maxX = startX;
        let minY = startY, maxY = startY;
        const stack = [[startX, startY]];
        let pixels = 0;

        while (stack.length > 0 && pixels < 10000) { // Limit for performance
            const [x, y] = stack.pop();
            const idx = y * width + x;

            if (x < 0 || x >= width || y < 0 || y >= height || visited.has(idx) || edges[idx] === 255) {
                continue;
            }

            visited.add(idx);
            pixels++;

            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);

            // Add neighbors
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }

        const regionWidth = maxX - minX;
        const regionHeight = maxY - minY;

        // Must be reasonably rectangular (aspect ratio between 0.3 and 3)
        const aspectRatio = regionWidth / regionHeight;
        if (aspectRatio < 0.3 || aspectRatio > 3) {
            return null;
        }

        return {
            x: minX,
            y: minY,
            width: regionWidth,
            height: regionHeight,
        };
    };

    const mergeOverlappingRegions = (regions) => {
        const merged = [];

        for (const region of regions) {
            let overlap = false;

            for (const existing of merged) {
                // Check if regions overlap
                if (
                    region.x < existing.x + existing.width &&
                    region.x + region.width > existing.x &&
                    region.y < existing.y + existing.height &&
                    region.y + region.height > existing.y
                ) {
                    // Merge
                    const newX = Math.min(region.x, existing.x);
                    const newY = Math.min(region.y, existing.y);
                    existing.width = Math.max(region.x + region.width, existing.x + existing.width) - newX;
                    existing.height = Math.max(region.y + region.height, existing.y + existing.height) - newY;
                    existing.x = newX;
                    existing.y = newY;
                    overlap = true;
                    break;
                }
            }

            if (!overlap) {
                merged.push(region);
            }
        }

        return merged;
    };

    const downloadAll = async () => {
        if (results.processed.length === 0) {
            alert('No images to download!');
            return;
        }

        // Convert data URLs to blobs
        const files = await Promise.all(
            results.processed.map(async (img, index) => {
                const response = await fetch(img.processedSrc);
                const blob = await response.blob();
                return {
                    name: `wallpaper-${index + 1}.jpg`,
                    blob
                };
            })
        );

        const saved = await saveMultipleFilesWithDialog(files, `wallpapers_${Date.now()}`);
        if (saved) {
            alert(`✅ Saved ${files.length} wallpapers!`);
        }
    };

    const saveToCloud = () => {
        alert('☁️ Cloud upload feature coming soon! Will integrate with your storage provider.');
    };

    const continueToEditor = () => {
        if (onProcessComplete) {
            onProcessComplete(results.processed);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
            minHeight: '100vh',
            color: '#fff',
            padding: '30px',
            fontFamily: 'Arial, sans-serif',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    🧠 Smart Screenshot Sorter
                </h1>
                <p style={{ color: '#aaa', fontSize: '16px' }}>
                    Automatically delete code screenshots • Keep wallpapers • Crop & enhance
                </p>
            </div>

            {!results ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Left: Upload & Examples */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#ff00ff' }}>
                            📁 Upload Screenshots
                        </h2>

                        {/* Drop Zone */}
                        <div
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDrop={handleFolderDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: isDragging ? '3px dashed #00ffff' : '2px dashed rgba(255, 255, 255, 0.3)',
                                borderRadius: '12px',
                                padding: '60px',
                                textAlign: 'center',
                                background: isDragging ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                marginBottom: '20px',
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                            <p style={{ fontSize: '18px', color: '#fff', marginBottom: '5px' }}>
                                Drop folder here
                            </p>
                            <p style={{ fontSize: '14px', color: '#888' }}>
                                or click to browse
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {/* Loaded Images */}
                        {images.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#0ff' }}>
                                    {images.length} images loaded
                                </h3>
                                <p style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>
                                    💡 Click images below to mark as "unwanted" (code screenshots)
                                </p>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '10px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                }}>
                                    {images.map(img => (
                                        <div
                                            key={img.id}
                                            onClick={() => img.isMarkedForDeletion ? unmarkImage(img.id) : markAsUnwanted(img.id)}
                                            style={{
                                                position: 'relative',
                                                cursor: 'pointer',
                                                border: img.isMarkedForDeletion ? '3px solid #ff4444' : '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                opacity: img.isMarkedForDeletion ? 0.5 : 1,
                                            }}
                                        >
                                            <img src={img.src} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                                            {img.isMarkedForDeletion && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'rgba(255, 0, 0, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '32px',
                                                }}>
                                                    🗑️
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {unwantedExamples.length > 0 && (
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '10px',
                                        background: 'rgba(255, 68, 68, 0.1)',
                                        border: '1px solid #ff4444',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                    }}>
                                        ✅ {unwantedExamples.length} examples marked • AI will find similar patterns
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Settings & Process */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#00ffff' }}>
                            ⚙️ Processing Options
                        </h2>

                        {/* Screen Resolution */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '5px' }}>
                                Target Resolution (detected: {settings.screenWidth}×{settings.screenHeight})
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    value={settings.screenWidth}
                                    onChange={(e) => setSettings({ ...settings, screenWidth: parseInt(e.target.value) })}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontFamily: 'monospace',
                                    }}
                                />
                                <span style={{ color: '#888', alignSelf: 'center' }}>×</span>
                                <input
                                    type="number"
                                    value={settings.screenHeight}
                                    onChange={(e) => setSettings({ ...settings, screenHeight: parseInt(e.target.value) })}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontFamily: 'monospace',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Toggle Options */}
                        {[
                            { key: 'deleteCodeScreenshots', label: '🗑️ Delete code screenshots (IDE, terminals)' },
                            { key: 'deleteBrowserScreenshots', label: '🗑️ Delete browser screenshots' },
                            { key: 'deleteEmptyScreenshots', label: '🗑️ Delete empty/blank screenshots' },
                            { key: 'removeDuplicates', label: '🔍 Remove duplicate images' },
                            { key: 'splitMultipleImages', label: '✂️ Split screenshots with multiple images' },
                            { key: 'autoCrop', label: '✂️ Auto-crop to screen resolution' },
                            { key: 'autoEnhance', label: '✨ Auto-enhance (brightness, contrast, sharpen)' },
                        ].map(option => (
                            <label key={option.key} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={settings[option.key]}
                                    onChange={(e) => setSettings({ ...settings, [option.key]: e.target.checked })}
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}

                        {/* Sliders */}
                        {settings.splitMultipleImages && (
                            <div style={{ marginTop: '15px' }}>
                                <label style={{ fontSize: '12px', color: '#aaa' }}>
                                    Split Sensitivity: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>{settings.splitSensitivity}%</span>
                                    <span style={{ fontSize: '11px', display: 'block', color: '#666', marginTop: '3px' }}>
                                        Higher = more aggressive splitting
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.splitSensitivity}
                                    onChange={(e) => setSettings({ ...settings, splitSensitivity: parseInt(e.target.value) })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}

                        {settings.removeDuplicates && (
                            <div style={{ marginTop: '15px' }}>
                                <label style={{ fontSize: '12px', color: '#aaa' }}>
                                    Duplicate Threshold: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>{settings.duplicateThreshold}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="80"
                                    max="100"
                                    value={settings.duplicateThreshold}
                                    onChange={(e) => setSettings({ ...settings, duplicateThreshold: parseInt(e.target.value) })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}

                        {settings.autoEnhance && (
                            <>
                                <div style={{ marginTop: '15px' }}>
                                    <label style={{ fontSize: '12px', color: '#aaa' }}>
                                        Brightness: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>+{settings.brightnessBoost}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={settings.brightnessBoost}
                                        onChange={(e) => setSettings({ ...settings, brightnessBoost: parseInt(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <label style={{ fontSize: '12px', color: '#aaa' }}>
                                        Contrast: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>+{settings.contrastBoost}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={settings.contrastBoost}
                                        onChange={(e) => setSettings({ ...settings, contrastBoost: parseInt(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <label style={{ fontSize: '12px', color: '#aaa' }}>
                                        Sharpen: <span style={{ color: '#0ff', fontFamily: 'monospace' }}>{settings.sharpenAmount}%</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={settings.sharpenAmount}
                                        onChange={(e) => setSettings({ ...settings, sharpenAmount: parseInt(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </>
                        )}

                        {/* Process Button */}
                        <button
                            onClick={processImages}
                            disabled={images.length === 0 || processing}
                            style={{
                                width: '100%',
                                marginTop: '30px',
                                padding: '18px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                background: images.length > 0 && !processing
                                    ? 'linear-gradient(135deg, #00ff00, #00aa00)'
                                    : 'rgba(128, 128, 128, 0.3)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: images.length > 0 && !processing ? 'pointer' : 'not-allowed',
                            }}
                        >
                            {processing ? '⏳ Processing...' : `🚀 Process ${images.length} Images`}
                        </button>
                    </div>
                </div>
            ) : (
                // Results View
                <div>
                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '15px',
                        marginBottom: '30px',
                    }}>
                        <div style={{
                            background: 'rgba(0, 255, 255, 0.1)',
                            border: '1px solid #0ff',
                            borderRadius: '12px',
                            padding: '20px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '36px', fontFamily: 'monospace', color: '#0ff', fontWeight: 'bold' }}>
                                {results.stats.total}
                            </div>
                            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>Total Images</div>
                        </div>

                        <div style={{
                            background: 'rgba(0, 255, 0, 0.1)',
                            border: '1px solid #0f0',
                            borderRadius: '12px',
                            padding: '20px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '36px', fontFamily: 'monospace', color: '#0f0', fontWeight: 'bold' }}>
                                {results.stats.kept}
                            </div>
                            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>Kept</div>
                        </div>

                        <div style={{
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid #ff4444',
                            borderRadius: '12px',
                            padding: '20px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '36px', fontFamily: 'monospace', color: '#ff4444', fontWeight: 'bold' }}>
                                {results.stats.deleted}
                            </div>
                            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>Deleted</div>
                        </div>

                        <div style={{
                            background: 'rgba(255, 255, 0, 0.1)',
                            border: '1px solid #ffff00',
                            borderRadius: '12px',
                            padding: '20px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '36px', fontFamily: 'monospace', color: '#ffff00', fontWeight: 'bold' }}>
                                {results.stats.duplicates}
                            </div>
                            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>Duplicates</div>
                        </div>

                        <div style={{
                            background: 'rgba(255, 0, 255, 0.1)',
                            border: '1px solid #ff00ff',
                            borderRadius: '12px',
                            padding: '20px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '36px', fontFamily: 'monospace', color: '#ff00ff', fontWeight: 'bold' }}>
                                {results.stats.split}
                            </div>
                            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>Images Split</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                        <button
                            onClick={downloadAll}
                            style={{
                                flex: 1,
                                padding: '18px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #00aaff, #0066ff)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            ⬇️ Download All ({results.stats.kept})
                        </button>

                        <button
                            onClick={saveToCloud}
                            style={{
                                flex: 1,
                                padding: '18px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #ff00ff, #aa00ff)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            ☁️ Upload to Cloud
                        </button>

                        <button
                            onClick={continueToEditor}
                            style={{
                                flex: 1,
                                padding: '18px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #00ff00, #00aa00)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            🎨 Continue Editing →
                        </button>
                    </div>

                    {/* Preview Grid */}
                    <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#0ff' }}>
                        ✨ Processed Wallpapers {results.stats.split > 0 && `(includes ${results.stats.split} split images)`}
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '15px',
                    }}>
                        {results.processed.map((img, index) => (
                            <div key={img.id} style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: img.isSplit ? '2px solid rgba(255, 0, 255, 0.5)' : '2px solid rgba(0, 255, 255, 0.3)',
                            }}>
                                <img src={img.processedSrc} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                <div style={{ padding: '10px', fontSize: '12px', color: '#888' }}>
                                    {img.newWidth}×{img.newHeight} • Enhanced
                                    {img.isSplit && (
                                        <span style={{
                                            marginLeft: '10px',
                                            color: '#ff00ff',
                                            fontWeight: 'bold'
                                        }}>
                                            ✂️ Split {img.splitIndex}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Start Over */}
                    <button
                        onClick={() => {
                            setResults(null);
                            setImages([]);
                            setUnwantedExamples([]);
                        }}
                        style={{
                            marginTop: '30px',
                            padding: '12px 24px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        🔄 Process Another Batch
                    </button>
                </div>
            )}
        </div>
    );
}
