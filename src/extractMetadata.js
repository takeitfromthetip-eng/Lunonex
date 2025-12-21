/**
 * AI-Powered Metadata Extraction
 * Uses OpenAI Vision API and GPT-4 to extract and tag media content
 */

export async function extractMetadata(file) {
  const type = detectType(file);
  const tags = await autoTag(file, type);
  return { type, tags, fileName: file.name };
}

function detectType(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (["mp3", "wav", "flac", "ogg", "m4a"].includes(ext)) return "audio";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
  if (["txt", "pdf", "docx", "doc", "md"].includes(ext)) return "text";
  if (["glb", "gltf", "obj", "fbx"].includes(ext)) return "3d";
  return "unknown";
}

async function autoTag(file, type) {
  // Try to use AI-powered tagging if available
  if (process.env.OPENAI_API_KEY) {
    try {
      return await aiPoweredTagging(file, type);
    } catch (error) {
      console.error('AI tagging error:', error);
      return fallbackTagging(file, type);
    }
  }

  return fallbackTagging(file, type);
}

async function aiPoweredTagging(file, type) {
  const tags = [`type-${type}`];

  // For images, use OpenAI Vision API
  if (type === 'image' && file.url) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and provide 5-10 relevant tags. Tags should describe: main subjects, style, mood, colors, and content type. Return only comma-separated tags, no explanations.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: file.url || file.preview
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiTags = data.choices[0].message.content
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);

        tags.push(...aiTags);
      }
    } catch (error) {
      console.error('Vision API error:', error);
    }
  }

  // For text content, analyze with GPT-4
  if (type === 'text' && file.content) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Analyze this text and provide 5-10 relevant tags describing the content, topics, and themes. Return only comma-separated tags:\n\n${file.content.substring(0, 2000)}`
            }
          ],
          max_tokens: 150
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiTags = data.choices[0].message.content
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);

        tags.push(...aiTags);
      }
    } catch (error) {
      console.error('GPT-4 tagging error:', error);
    }
  }

  // Add filename-based tags
  const filenameTags = extractFilenameKeywords(file.name);
  tags.push(...filenameTags);

  return [...new Set(tags)]; // Remove duplicates
}

function fallbackTagging(file, type) {
  const tags = [`type-${type}`];

  // Extract keywords from filename
  const filenameTags = extractFilenameKeywords(file.name);
  tags.push(...filenameTags);

  // Type-specific tags
  switch (type) {
    case 'image':
      tags.push('visual', 'media', 'picture');
      break;
    case 'video':
      tags.push('visual', 'media', 'motion', 'animated');
      break;
    case 'audio':
      tags.push('sound', 'media', 'audio-file');
      break;
    case '3d':
      tags.push('model', '3d-content', 'spatial');
      break;
    case 'text':
      tags.push('document', 'text-content');
      break;
  }

  return tags;
}

function extractFilenameKeywords(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Split by common separators
  const words = nameWithoutExt
    .split(/[-_\s.]+/)
    .map(word => word.toLowerCase())
    .filter(word => word.length > 2); // Filter short words

  return words;
}
