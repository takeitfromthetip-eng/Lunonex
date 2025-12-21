/* eslint-disable */
/**
 * Face Detection and Grouping API
 * Uses AWS Rekognition or similar service to detect and group faces
 */

export async function POST(request) {
  try {
    const { images, userId } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({
        error: 'No images provided'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('AWS credentials not configured, returning mock data');
      return generateMockFaceGroups(images);
    }

    try {
      // Initialize AWS Rekognition
      const AWS = require('aws-sdk');
      const rekognition = new AWS.Rekognition({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });

      const faceGroups = await processImagesWithRekognition(rekognition, images);

      return new Response(JSON.stringify({
        success: true,
        groups: faceGroups,
        totalImages: images.length,
        totalGroups: faceGroups.length
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (awsError) {
      console.error('AWS Rekognition error:', awsError);
      // Fallback to mock data
      return generateMockFaceGroups(images);
    }

  } catch (error) {
    console.error('Face analysis error:', error);
    return new Response(JSON.stringify({
      error: 'Face analysis failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function processImagesWithRekognition(rekognition, images) {
  const faces = [];
  const similarityThreshold = 85; // 85% similarity to be considered same person

  // Step 1: Detect faces in all images
  for (const image of images) {
    try {
      // Convert base64 image to buffer
      const imageBuffer = Buffer.from(image.url.split(',')[1], 'base64');

      const params = {
        Image: {
          Bytes: imageBuffer
        },
        Attributes: ['ALL']
      };

      const result = await rekognition.detectFaces(params).promise();

      if (result.FaceDetails && result.FaceDetails.length > 0) {
        // Store face data with image reference
        result.FaceDetails.forEach((face, index) => {
          faces.push({
            imageName: image.name,
            imageUrl: image.url,
            faceIndex: index,
            boundingBox: face.BoundingBox,
            confidence: face.Confidence,
            emotions: face.Emotions,
            ageRange: face.AgeRange,
            gender: face.Gender
          });
        });
      }
    } catch (error) {
      console.error(`Error processing image ${image.name}:`, error);
    }
  }

  // Step 2: Group similar faces using AWS Rekognition's CompareFaces
  const groups = [];
  const assigned = new Set();

  for (let i = 0; i < faces.length; i++) {
    if (assigned.has(i)) continue;

    const group = {
      id: `group_${groups.length + 1}`,
      characterName: `Character_${String.fromCharCode(65 + groups.length)}`,
      faceCount: 1,
      confidence: faces[i].confidence,
      images: [{ name: faces[i].imageName, url: faces[i].imageUrl }],
      suggestedName: `Character_${String.fromCharCode(65 + groups.length)}`
    };

    assigned.add(i);

    // Compare with remaining faces
    for (let j = i + 1; j < faces.length; j++) {
      if (assigned.has(j)) continue;

      try {
        // Compare faces
        const sourceBuffer = Buffer.from(faces[i].imageUrl.split(',')[1], 'base64');
        const targetBuffer = Buffer.from(faces[j].imageUrl.split(',')[1], 'base64');

        const compareParams = {
          SourceImage: { Bytes: sourceBuffer },
          TargetImage: { Bytes: targetBuffer },
          SimilarityThreshold: similarityThreshold
        };

        const compareResult = await rekognition.compareFaces(compareParams).promise();

        if (compareResult.FaceMatches && compareResult.FaceMatches.length > 0) {
          // Faces match - add to group
          group.faceCount++;
          group.images.push({ name: faces[j].imageName, url: faces[j].imageUrl });
          assigned.add(j);
        }
      } catch (error) {
        console.error('Error comparing faces:', error);
      }
    }

    groups.push(group);
  }

  return groups;
}

function generateMockFaceGroups(images) {
  // AWS Rekognition not configured - return error
  return new Response(JSON.stringify({
    success: false,
    error: 'Face detection service not configured. Please add AWS Rekognition API keys.',
    groups: [],
    totalImages: images.length,
    totalGroups: 0
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
