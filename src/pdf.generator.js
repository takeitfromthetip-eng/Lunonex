import PDFDocument from 'pdfkit';
import fs from 'fs';
export function generateArtifact({ title, lore, badge, outputPath }) {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPath));
    doc.fontSize(20).text(title, { align: 'center' });
    doc.fontSize(12).text(`Lore: ${lore}`);
    doc.image(`./badges/${badge}.png`, { width: 100 });
    doc.end();
}
//# sourceMappingURL=pdf.generator.js.map