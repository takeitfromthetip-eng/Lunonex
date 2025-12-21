/* eslint-disable */
import React, { useState } from 'react';

/**
 * UniversalFileManager - Save/Load ANY file from ANY tool
 * Works across all tools: photos, audio, videos, documents, projects
 */
export function UniversalFileManager({ onSave, onLoad, fileType = 'all' }) {
    const [showManager, setShowManager] = useState(false);
    const [savedFiles, setSavedFiles] = useState(() => {
        const saved = localStorage.getItem('universalFiles');
        return saved ? JSON.parse(saved) : [];
    });

    const saveFile = (name, data, type) => {
        const file = {
            id: Date.now(),
            name,
            type, // photo, audio, video, document, project, etc.
            data,
            savedAt: new Date().toISOString(),
            size: new Blob([JSON.stringify(data)]).size,
        };

        const updated = [...savedFiles, file];
        setSavedFiles(updated);
        localStorage.setItem('universalFiles', JSON.stringify(updated));

        if (onSave) onSave(file);
        return file;
    };

    const loadFile = (file) => {
        if (onLoad) onLoad(file);
        setShowManager(false);
    };

    const deleteFile = (id) => {
        const updated = savedFiles.filter(f => f.id !== id);
        setSavedFiles(updated);
        localStorage.setItem('universalFiles', JSON.stringify(updated));
    };

    const exportFile = (file) => {
        const blob = new Blob([JSON.stringify(file.data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file.name}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const importFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const imported = saveFile(file.name.replace('.json', ''), data, 'imported');
                alert(`✅ Imported: ${imported.name}`);
            } catch (err) {
                alert('❌ Failed to import file');
            }
        };
        reader.readAsText(file);
    };

    if (!showManager) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
            }}>
                <button
                    onClick={() => setShowManager(true)}
                    style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        color: '#fff',
                        fontSize: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    title="File Manager"
                >
                    💾
                </button>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                color: '#fff',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', margin: 0 }}>💾 File Manager</h2>
                    <button
                        onClick={() => setShowManager(false)}
                        style={{
                            background: 'rgba(255, 0, 0, 0.2)',
                            border: '1px solid #ff4444',
                            borderRadius: '6px',
                            color: '#ff4444',
                            padding: '8px 16px',
                            cursor: 'pointer',
                        }}
                    >
                        ✕ Close
                    </button>
                </div>

                {/* Import Button */}
                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="file"
                        accept=".json"
                        onChange={importFile}
                        style={{ display: 'none' }}
                        id="importFile"
                    />
                    <label
                        htmlFor="importFile"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: 'rgba(0, 255, 255, 0.2)',
                            border: '1px solid #0ff',
                            borderRadius: '8px',
                            color: '#0ff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        }}
                    >
                        📁 Import File
                    </label>
                </div>

                {/* Saved Files List */}
                <div style={{ display: 'grid', gap: '10px' }}>
                    {savedFiles.length === 0 ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                            No saved files yet. Use the save button in any tool to save your work here.
                        </p>
                    ) : (
                        savedFiles.map(file => (
                            <div
                                key={file.id}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                                        {file.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>
                                        {file.type} • {(file.size / 1024).toFixed(2)} KB • {new Date(file.savedAt).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => loadFile(file)}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'rgba(0, 255, 0, 0.2)',
                                            border: '1px solid #0f0',
                                            borderRadius: '6px',
                                            color: '#0f0',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                        }}
                                    >
                                        📂 Load
                                    </button>
                                    <button
                                        onClick={() => exportFile(file)}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'rgba(0, 255, 255, 0.2)',
                                            border: '1px solid #0ff',
                                            borderRadius: '6px',
                                            color: '#0ff',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                        }}
                                    >
                                        ⬇️ Export
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Delete "${file.name}"?`)) {
                                                deleteFile(file.id);
                                            }
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'rgba(255, 0, 0, 0.2)',
                                            border: '1px solid #f00',
                                            borderRadius: '6px',
                                            color: '#f00',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Global save function - call from anywhere
export const saveToFileManager = (name, data, type) => {
    const savedFiles = JSON.parse(localStorage.getItem('universalFiles') || '[]');
    const file = {
        id: Date.now(),
        name,
        type,
        data,
        savedAt: new Date().toISOString(),
        size: new Blob([JSON.stringify(data)]).size,
    };
    savedFiles.push(file);
    localStorage.setItem('universalFiles', JSON.stringify(savedFiles));
    return file;
};
