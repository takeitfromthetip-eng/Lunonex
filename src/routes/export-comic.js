/* eslint-disable */
import { verify } from 'jsonwebtoken';
import PDFDocument from 'pdfkit';

/**
 * Export comic book to PDF
 * Endpoint: POST /api/export-comic
 */
export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { title, pages, userId } = await request.json();

    if (!pages || pages.length === 0) {
      return new Response(JSON.stringify({ error: 'No pages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create PDF
    const doc = new PDFDocument({
      size: [612, 792], // US Letter size (8.5" x 11")
      margin: 0,
      info: {
        Title: title || 'Comic Book',
        Author: userId,
        Creator: 'ForTheWeebs Comic Creator',
        CreationDate: new Date()
      }
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Add cover page
    doc.fontSize(32)
      .font('Helvetica-Bold')
      .text(title || 'Comic Book', 50, 300, { align: 'center' });

    doc.fontSize(14)
      .font('Helvetica')
      .text(`Created by ${userId}`, 50, 350, { align: 'center' });

    doc.fontSize(10)
      .text(new Date().toLocaleDateString(), 50, 380, { align: 'center' });

    // Add each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];

      doc.addPage({
        size: [612, 792],
        margin: 20
      });

      // Add page number
      doc.fontSize(10)
        .font('Helvetica')
        .text(`Page ${i + 1}`, 20, 760, { align: 'left' });

      // Draw panels (simplified version - in production would render actual images)
      page.panels.forEach(panel => {
        const x = (panel.x / 100) * 572 + 20;
        const y = (panel.y / 100) * 732 + 20;
        const width = (panel.width / 100) * 572;
        const height = (panel.height / 100) * 732;

        // Draw panel border
        doc.rect(x, y, width, height).stroke();

        // If panel has image, add note (actual implementation would embed image)
        if (panel.image) {
          doc.fontSize(8)
            .text('[Image]', x + 5, y + 5);
        }

        // Add speech bubbles
        panel.bubbles.forEach(bubble => {
          const bx = x + (bubble.x / 100) * width;
          const by = y + (bubble.y / 100) * height;
          const bw = (bubble.width / 100) * width;
          const bh = (bubble.height / 100) * height;

          // Draw bubble
          if (bubble.type === 'thought') {
            doc.circle(bx + bw / 2, by + bh / 2, bw / 2).stroke();
          } else {
            doc.roundedRect(bx, by, bw, bh, 5).stroke();
          }

          // Add text
          doc.fontSize(8)
            .font('Helvetica')
            .text(bubble.text, bx + 2, by + 2, {
              width: bw - 4,
              height: bh - 4,
              align: 'center',
              valign: 'center'
            });
        });
      });
    }

    // Finalize PDF
    doc.end();

    // Wait for PDF to finish
    const pdfBuffer = await new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '-')}.pdf"`
      }
    });

  } catch (error) {
    console.error('Comic export error:', error);
    return new Response(
      JSON.stringify({ error: 'Export failed', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
