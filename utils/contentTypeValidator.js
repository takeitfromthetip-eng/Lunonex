// Content-Type Validation for Uploads
// Prevents users from uploading malicious files disguised as videos

const ALLOWED_VIDEO_MIMES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
];

const ALLOWED_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

const MAGIC_NUMBERS = {
    mp4: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    webm: [0x1A, 0x45, 0xDF, 0xA3],
    png: [0x89, 0x50, 0x4E, 0x47],
    jpeg: [0xFF, 0xD8, 0xFF],
    gif: [0x47, 0x49, 0x46]
};

function checkMagicNumber(buffer, fileType) {
    const magicNumbers = MAGIC_NUMBERS[fileType];
    if (!magicNumbers) return false;
    
    for (let i = 0; i < magicNumbers.length; i++) {
        if (buffer[i] !== magicNumbers[i]) return false;
    }
    return true;
}

function validateContentType(file, expectedType = 'video') {
    const allowedMimes = expectedType === 'video' ? ALLOWED_VIDEO_MIMES : ALLOWED_IMAGE_MIMES;
    
    // Check MIME type
    if (!allowedMimes.includes(file.mimetype)) {
        return {
            valid: false,
            reason: 'invalid_mime_type',
            expected: allowedMimes,
            received: file.mimetype
        };
    }
    
    // Check file extension
    const ext = file.originalname.split('.').pop().toLowerCase();
    const validExtensions = expectedType === 'video' 
        ? ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!validExtensions.includes(ext)) {
        return {
            valid: false,
            reason: 'invalid_extension',
            expected: validExtensions,
            received: ext
        };
    }
    
    return { valid: true };
}

function validateFileSignature(buffer, filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    // Map extensions to magic number checks
    const checks = {
        'mp4': () => checkMagicNumber(buffer, 'mp4'),
        'webm': () => checkMagicNumber(buffer, 'webm'),
        'mkv': () => checkMagicNumber(buffer, 'webm'), // MKV uses EBML like WebM
        'png': () => checkMagicNumber(buffer, 'png'),
        'jpg': () => checkMagicNumber(buffer, 'jpeg'),
        'jpeg': () => checkMagicNumber(buffer, 'jpeg'),
        'gif': () => checkMagicNumber(buffer, 'gif')
    };
    
    const check = checks[ext];
    if (!check) return { valid: true, reason: 'unknown_format' };
    
    const isValid = check();
    return {
        valid: isValid,
        reason: isValid ? 'valid' : 'file_signature_mismatch',
        details: `File claims to be ${ext} but signature doesn't match`
    };
}

module.exports = {
    validateContentType,
    validateFileSignature,
    ALLOWED_VIDEO_MIMES,
    ALLOWED_IMAGE_MIMES
};
