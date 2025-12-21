/* eslint-disable */
/**
 * Audio Identification System
 * Identifies songs and audiobooks using ACRCloud and AudD APIs
 *
 * Features:
 * - Song recognition (Shazam-like)
 * - Audiobook identification
 * - Copyright detection
 * - Metadata extraction
 */

const ACRCLOUD_HOST = process.env.VITE_ACRCLOUD_HOST || 'identify-us-west-2.acrcloud.com';
const ACRCLOUD_ACCESS_KEY = process.env.VITE_ACRCLOUD_ACCESS_KEY;
const ACRCLOUD_ACCESS_SECRET = process.env.VITE_ACRCLOUD_ACCESS_SECRET;

const AUDD_API_KEY = process.env.VITE_AUDD_API_KEY;

/**
 * Identify audio file (song, audiobook, etc.)
 * @param {File|Blob} audioFile - Audio file to identify
 * @returns {Promise<Object>} Identification results
 */
export async function identifyAudio(audioFile) {
  try {
    console.log('🎵 Identifying audio...');

    // Try ACRCloud first (most accurate for songs)
    let result = await identifyWithACRCloud(audioFile);

    // Fallback to AudD if ACRCloud fails
    if (!result || !result.identified) {
      console.log('Trying AudD as fallback...');
      result = await identifyWithAudD(audioFile);
    }

    return {
      ...result,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Audio identification error:', error);
    return {
      identified: false,
      error: error.message,
    };
  }
}

/**
 * Identify using ACRCloud (best for music)
 */
async function identifyWithACRCloud(audioFile) {
  if (!ACRCLOUD_ACCESS_KEY || !ACRCLOUD_ACCESS_SECRET) {
    console.warn('ACRCloud not configured');
    return null;
  }

  try {
    // Convert audio to base64
    const audioBase64 = await fileToBase64(audioFile);

    // Create signature for ACRCloud
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await createACRCloudSignature(timestamp);

    // Send to ACRCloud API
    const formData = new FormData();
    formData.append('sample', audioFile);
    formData.append('access_key', ACRCLOUD_ACCESS_KEY);
    formData.append('data_type', 'audio');
    formData.append('signature_version', '1');
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);

    const response = await fetch(`https://${ACRCLOUD_HOST}/v1/identify`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.status.code === 0 && data.metadata?.music?.length > 0) {
      const track = data.metadata.music[0];

      return {
        identified: true,
        type: 'music',
        title: track.title,
        artist: track.artists?.[0]?.name || 'Unknown',
        album: track.album?.name,
        releaseDate: track.release_date,
        duration: track.duration_ms,
        isrc: track.external_ids?.isrc,
        label: track.label,
        genres: track.genres || [],
        copyrighted: true, // Commercial music is copyrighted
        source: 'ACRCloud',
        confidence: data.status.msg === 'Success' ? 0.95 : 0.7,
        raw: data,
      };
    }

    return { identified: false, source: 'ACRCloud' };

  } catch (error) {
    console.error('ACRCloud error:', error);
    return null;
  }
}

/**
 * Identify using AudD API (fallback)
 */
async function identifyWithAudD(audioFile) {
  if (!AUDD_API_KEY) {
    console.warn('AudD API not configured');
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('api_token', AUDD_API_KEY);
    formData.append('return', 'apple_music,spotify');

    const response = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.status === 'success' && data.result) {
      const track = data.result;

      return {
        identified: true,
        type: 'music',
        title: track.title,
        artist: track.artist,
        album: track.album,
        releaseDate: track.release_date,
        label: track.label,
        copyrighted: true,
        source: 'AudD',
        confidence: 0.85,
        spotify: track.spotify,
        appleMusic: track.apple_music,
        raw: data,
      };
    }

    return { identified: false, source: 'AudD' };

  } catch (error) {
    console.error('AudD error:', error);
    return null;
  }
}

/**
 * Check if audio is copyrighted commercial content
 * @param {Object} identification - Audio ID result
 * @returns {Object} Copyright status
 */
export function checkAudioCopyright(identification) {
  if (!identification || !identification.identified) {
    return {
      copyrighted: false,
      confidence: 0,
      message: 'Unknown audio - assumed original',
    };
  }

  // Commercial music is always copyrighted
  if (identification.type === 'music' && identification.label) {
    return {
      copyrighted: true,
      confidence: 0.95,
      owner: identification.label,
      message: `Commercial music by ${identification.artist} - copyrighted`,
      canUse: false,
      reason: 'Commercial music requires licensing',
    };
  }

  // Audiobooks are copyrighted
  if (identification.type === 'audiobook') {
    return {
      copyrighted: true,
      confidence: 0.90,
      message: 'Audiobook content - copyrighted',
      canUse: false,
      reason: 'Audiobooks require licensing',
    };
  }

  return {
    copyrighted: false,
    confidence: 0.5,
    message: 'Could not determine copyright status',
  };
}

/**
 * Batch identify multiple audio files
 */
export async function batchIdentifyAudio(audioFiles, progressCallback = null) {
  const results = [];

  for (let i = 0; i < audioFiles.length; i++) {
    const result = await identifyAudio(audioFiles[i]);
    results.push({
      filename: audioFiles[i].name,
      ...result,
    });

    if (progressCallback) {
      progressCallback({
        current: i + 1,
        total: audioFiles.length,
        percentage: Math.round(((i + 1) / audioFiles.length) * 100),
      });
    }

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return {
    total: audioFiles.length,
    identified: results.filter(r => r.identified).length,
    copyrighted: results.filter(r => r.copyrighted).length,
    results,
  };
}

/**
 * Create ACRCloud signature
 */
async function createACRCloudSignature(timestamp) {
  const stringToSign = `POST\n/v1/identify\n${ACRCLOUD_ACCESS_KEY}\naudio\n1\n${timestamp}`;

  // HMAC-SHA1 signature
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const key = encoder.encode(ACRCLOUD_ACCESS_SECRET);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Convert file to base64
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default {
  identifyAudio,
  checkAudioCopyright,
  batchIdentifyAudio,
};
