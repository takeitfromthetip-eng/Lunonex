/* eslint-disable */
import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import './GeneralMediaSorter.css';

/**
 * GeneralMediaProcessor - Universal media organizer
 * Handles: Audio (mp3, flac, wav, m4a), Video (mp4, mkv, avi, mov), Documents (pdf, epub, txt)
 * Features: Duplicate detection, format conversion, batch processing, organization by type
 */
export function GeneralMediaSorter({ userId }) {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState({
        total: 0,
        processed: 0,
        duplicates: 0,
        converted: 0,
        organized: 0,
        errors: 0
    });
    const [results, setResults] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const folderInputRef = useRef(null);

    // Processing parameters
    const [params, setParams] = useState({
        removeDuplicates: true,
        organizeByType: true, // Sort into folders by media type
        convertAudio: false,
        audioFormat: 'mp3', // mp3, flac, wav, m4a
        audioBitrate: '192', // 128, 192, 256, 320
        convertVideo: false,
        videoFormat: 'mp4', // mp4, webm, mkv
        videoQuality: 'high', // low, medium, high, ultra
        deleteJunk: true,
        minSize: 10, // KB
        maxSize: 500000, // KB (500MB)
        allowedAudioFormats: ['mp3', 'flac', 'wav', 'm4a', 'aac', 'ogg', 'wma'],
        allowedVideoFormats: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv'],
        allowedDocFormats: ['pdf', 'epub', 'mobi', 'txt', 'doc', 'docx'],
        deleteFormats: ['tmp', 'cache', 'db', 'ini', 'thumbs.db', 'desktop.ini'],
        renamePattern: '{type}_{index}_{original}', // {type}, {index}, {original}, {date}, {hash}
        preserveMetadata: true
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
                    filesList.push(file);
                    resolve();
                });
            } else if (item.isDirectory) {
                const dirReader = item.createReader();
                dirReader.readEntries(async (entries) => {
                    for (let entry of entries) {
                        await traverseFileTree(entry, filesList);
                    }
                    resolve();
                });
            }
        });
    };

    // Calculate file hash for duplicate detection
    const calculateFileHash = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Detect media type from file extension
    const getMediaType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (params.allowedAudioFormats.includes(ext)) return 'audio';
        if (params.allowedVideoFormats.includes(ext)) return 'video';
        if (params.allowedDocFormats.includes(ext)) return 'document';
        if (params.deleteFormats.includes(ext)) return 'junk';
        return 'other';
    };

    // Format conversion (placeholder - actual conversion requires backend/FFmpeg)
    const convertFile = async (file, targetFormat) => {
        // Note: Real conversion needs FFmpeg or backend API
        // For now, we'll just return the original file with renamed extension
        console.log(`Would convert ${file.name} to ${targetFormat}`);
        return file;
    };

    // Process all files
    const processFiles = async () => {
        if (files.length === 0) {
            alert('⚠️ Please load files first!');
            return;
        }

        setProcessing(true);
        setProgress(0);
        const processedResults = [];
        const fileHashes = new Map();
        let duplicateCount = 0;
        let convertedCount = 0;
        let organizedCount = 0;
        let errorCount = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const mediaType = getMediaType(file.name);

                try {
                    // Skip junk files if enabled
                    if (params.deleteJunk && mediaType === 'junk') {
                        console.log(`Skipping junk file: ${file.name}`);
                        continue;
                    }

                    // Skip if file size out of range
                    const fileSizeKB = file.size / 1024;
                    if (fileSizeKB < params.minSize || (params.maxSize > 0 && fileSizeKB > params.maxSize)) {
                        console.log(`Skipping ${file.name}: size out of range (${fileSizeKB.toFixed(2)} KB)`);
                        continue;
                    }

                    // Duplicate detection
                    if (params.removeDuplicates) {
                        const hash = await calculateFileHash(file);
                        if (fileHashes.has(hash)) {
                            duplicateCount++;
                            console.log(`Duplicate found: ${file.name} (matches ${fileHashes.get(hash)})`);
                            continue;
                        }
                        fileHashes.set(hash, file.name);
                    }

                    let processedFile = file;
                    let converted = false;

                    // Audio conversion
                    if (params.convertAudio && mediaType === 'audio' && !file.name.endsWith(`.${params.audioFormat}`)) {
                        processedFile = await convertFile(file, params.audioFormat);
                        converted = true;
                        convertedCount++;
                    }

                    // Video conversion
                    if (params.convertVideo && mediaType === 'video' && !file.name.endsWith(`.${params.videoFormat}`)) {
                        processedFile = await convertFile(file, params.videoFormat);
                        converted = true;
                        convertedCount++;
                    }

                    // Organize by type
                    let organizationFolder = '';
                    if (params.organizeByType) {
                        organizationFolder = mediaType.charAt(0).toUpperCase() + mediaType.slice(1) + 's/';
                        organizedCount++;
                    }

                    // Generate new filename
                    const originalName = file.name.replace(/\.[^/.]+$/, '');
                    const extension = file.name.split('.').pop();
                    const newName = params.renamePattern
                        .replace('{type}', mediaType)
                        .replace('{index}', String(i + 1).padStart(4, '0'))
                        .replace('{original}', originalName)
                        .replace('{date}', new Date().toISOString().split('T')[0])
                        .replace('{hash}', (await calculateFileHash(file)).substring(0, 8));

                    processedResults.push({
                        original: file.name,
                        processed: organizationFolder + newName + '.' + extension,
                        type: mediaType,
                        size: fileSizeKB,
                        converted: converted,
                        file: processedFile
                    });

                } catch (err) {
                    console.error(`Error processing ${file.name}:`, err);
                    errorCount++;
                }

                // Update progress
                setProgress(Math.round(((i + 1) / files.length) * 100));
            }

            setResults(processedResults);
            setStats({
                total: files.length,
                processed: processedResults.length,
                duplicates: duplicateCount,
                converted: convertedCount,
                organized: organizedCount,
                errors: errorCount
            });

            alert(`✅ Processing complete!\n\nProcessed: ${processedResults.length}\nDuplicates removed: ${duplicateCount}\nConverted: ${convertedCount}\nOrganized: ${organizedCount}\nErrors: ${errorCount}`);

        } catch (error) {
            console.error('Processing error:', error);
            alert('❌ Error during processing: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    // Download all processed files as ZIP
    const downloadAll = async () => {
        if (results.length === 0) {
            alert('⚠️ No processed files to download!');
            return;
        }

        setProcessing(true);
        const zip = new JSZip();

        try {
            for (const result of results) {
                zip.file(result.processed, result.file);
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `media_organized_${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('✅ ZIP download started!');
        } catch (error) {
            console.error('ZIP creation error:', error);
            alert('❌ Error creating ZIP: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    // Clear all
    const clearAll = () => {
        setFiles([]);
        setResults([]);
        setProgress(0);
        setStats({
            total: 0,
            processed: 0,
            duplicates: 0,
            converted: 0,
            organized: 0,
            errors: 0
        });
    };

    return (
        <div className="general-media-sorter">
            <div className="sorter-header">
                <h2>🎬 General Media Processor</h2>
                <p>Organize, convert, and clean up ANY media: audio, video, documents</p>
            </div>

            {/* File Input Area */}
            <div 
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="drop-content">
                    <span className="drop-icon">📁</span>
                    <p>Drag & Drop folders here</p>
                    <p className="drop-subtitle">or click to browse</p>
                    <input
                        type="file"
                        ref={folderInputRef}
                        onChange={handleFolderSelect}
                        webkitdirectory="true"
                        directory="true"
                        multiple
                        style={{ display: 'none' }}
                    />
                    <button 
                        className="browse-btn"
                        onClick={() => folderInputRef.current?.click()}
                    >
                        Browse Folders
                    </button>
                </div>
                {files.length > 0 && (
                    <div className="files-loaded">
                        ✅ {files.length} files loaded
                    </div>
                )}
            </div>

            {/* Processing Options */}
            <div className="processing-options">
                <div className="options-section">
                    <h3>🔧 Processing Options</h3>
                    
                    <label className="option-row">
                        <input
                            type="checkbox"
                            checked={params.removeDuplicates}
                            onChange={(e) => setParams({...params, removeDuplicates: e.target.checked})}
                        />
                        <span>Remove Duplicates (by file hash)</span>
                    </label>

                    <label className="option-row">
                        <input
                            type="checkbox"
                            checked={params.organizeByType}
                            onChange={(e) => setParams({...params, organizeByType: e.target.checked})}
                        />
                        <span>Organize by Type (Audio/Video/Documents folders)</span>
                    </label>

                    <label className="option-row">
                        <input
                            type="checkbox"
                            checked={params.deleteJunk}
                            onChange={(e) => setParams({...params, deleteJunk: e.target.checked})}
                        />
                        <span>Delete Junk Files (.tmp, .cache, .db, .ini)</span>
                    </label>
                </div>

                <div className="options-section">
                    <h3>🎵 Audio Conversion</h3>
                    
                    <label className="option-row">
                        <input
                            type="checkbox"
                            checked={params.convertAudio}
                            onChange={(e) => setParams({...params, convertAudio: e.target.checked})}
                        />
                        <span>Convert Audio Files</span>
                    </label>

                    {params.convertAudio && (
                        <>
                            <label className="option-row">
                                <span>Format:</span>
                                <select 
                                    value={params.audioFormat}
                                    onChange={(e) => setParams({...params, audioFormat: e.target.value})}
                                >
                                    <option value="mp3">MP3</option>
                                    <option value="flac">FLAC</option>
                                    <option value="wav">WAV</option>
                                    <option value="m4a">M4A</option>
                                </select>
                            </label>

                            <label className="option-row">
                                <span>Bitrate:</span>
                                <select 
                                    value={params.audioBitrate}
                                    onChange={(e) => setParams({...params, audioBitrate: e.target.value})}
                                >
                                    <option value="128">128 kbps</option>
                                    <option value="192">192 kbps</option>
                                    <option value="256">256 kbps</option>
                                    <option value="320">320 kbps</option>
                                </select>
                            </label>
                        </>
                    )}
                </div>

                <div className="options-section">
                    <h3>🎥 Video Conversion</h3>
                    
                    <label className="option-row">
                        <input
                            type="checkbox"
                            checked={params.convertVideo}
                            onChange={(e) => setParams({...params, convertVideo: e.target.checked})}
                        />
                        <span>Convert Video Files</span>
                    </label>

                    {params.convertVideo && (
                        <>
                            <label className="option-row">
                                <span>Format:</span>
                                <select 
                                    value={params.videoFormat}
                                    onChange={(e) => setParams({...params, videoFormat: e.target.value})}
                                >
                                    <option value="mp4">MP4</option>
                                    <option value="webm">WebM</option>
                                    <option value="mkv">MKV</option>
                                </select>
                            </label>

                            <label className="option-row">
                                <span>Quality:</span>
                                <select 
                                    value={params.videoQuality}
                                    onChange={(e) => setParams({...params, videoQuality: e.target.value})}
                                >
                                    <option value="low">Low (fast, small)</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="ultra">Ultra (slow, large)</option>
                                </select>
                            </label>
                        </>
                    )}
                </div>

                <div className="options-section">
                    <h3>📏 File Size Filters</h3>
                    
                    <label className="option-row">
                        <span>Min Size (KB):</span>
                        <input
                            type="number"
                            value={params.minSize}
                            onChange={(e) => setParams({...params, minSize: parseInt(e.target.value) || 0})}
                            min="0"
                        />
                    </label>

                    <label className="option-row">
                        <span>Max Size (KB, 0 = unlimited):</span>
                        <input
                            type="number"
                            value={params.maxSize}
                            onChange={(e) => setParams({...params, maxSize: parseInt(e.target.value) || 0})}
                            min="0"
                        />
                    </label>
                </div>

                <div className="options-section">
                    <h3>📝 File Naming</h3>
                    
                    <label className="option-row">
                        <span>Pattern:</span>
                        <input
                            type="text"
                            value={params.renamePattern}
                            onChange={(e) => setParams({...params, renamePattern: e.target.value})}
                            placeholder="{type}_{index}_{original}"
                        />
                    </label>
                    <p className="hint">
                        Variables: {'{type}'}, {'{index}'}, {'{original}'}, {'{date}'}, {'{hash}'}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button 
                    className="process-btn"
                    onClick={processFiles}
                    disabled={processing || files.length === 0}
                >
                    {processing ? `⏳ Processing ${progress}%...` : '🚀 Process All Files'}
                </button>

                <button 
                    className="download-btn"
                    onClick={downloadAll}
                    disabled={processing || results.length === 0}
                >
                    📥 Download ZIP ({results.length} files)
                </button>

                <button 
                    className="clear-btn"
                    onClick={clearAll}
                    disabled={processing}
                >
                    🗑️ Clear All
                </button>
            </div>

            {/* Stats Display */}
            {stats.total > 0 && (
                <div className="stats-display">
                    <h3>📊 Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Total Files:</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Processed:</span>
                            <span className="stat-value">{stats.processed}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Duplicates Removed:</span>
                            <span className="stat-value">{stats.duplicates}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Converted:</span>
                            <span className="stat-value">{stats.converted}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Organized:</span>
                            <span className="stat-value">{stats.organized}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Errors:</span>
                            <span className="stat-value error">{stats.errors}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Preview */}
            {results.length > 0 && (
                <div className="results-preview">
                    <h3>📋 Processed Files Preview (first 50)</h3>
                    <div className="results-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Original Name</th>
                                    <th>New Name</th>
                                    <th>Type</th>
                                    <th>Size (KB)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.slice(0, 50).map((result, idx) => (
                                    <tr key={idx}>
                                        <td>{result.original}</td>
                                        <td>{result.processed}</td>
                                        <td>
                                            <span className={`type-badge ${result.type}`}>
                                                {result.type}
                                            </span>
                                        </td>
                                        <td>{result.size.toFixed(2)}</td>
                                        <td>
                                            {result.converted ? '🔄 Converted' : '✅ OK'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {results.length > 50 && (
                            <p className="table-note">
                                ... and {results.length - 50} more files
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Info Section */}
            <div className="info-section">
                <h3>ℹ️ How It Works</h3>
                <ul>
                    <li><strong>Duplicate Detection:</strong> Uses SHA-256 file hashing to find identical files</li>
                    <li><strong>Format Conversion:</strong> Convert audio (MP3, FLAC, WAV, M4A) and video (MP4, WebM, MKV)</li>
                    <li><strong>Organization:</strong> Automatically sorts files into Audio/, Video/, Documents/ folders</li>
                    <li><strong>Junk Removal:</strong> Deletes .tmp, .cache, .db, .ini, thumbs.db files</li>
                    <li><strong>Batch Processing:</strong> Handle thousands of files at once</li>
                    <li><strong>ZIP Download:</strong> Get all organized files in one convenient package</li>
                </ul>
                <p className="warning">
                    ⚠️ Note: Format conversion is currently client-side placeholder. 
                    For full conversion functionality, backend integration with FFmpeg is needed.
                </p>
            </div>
        </div>
    );
}
