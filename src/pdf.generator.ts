import PDFDocument from 'pdfkit';
import fs from 'fs';

interface GenerateArtifactOptions {
  title: string;
  lore: string;
  badge: string;
  outputPath: string;
}

export function generateArtifact({ title, lore, badge, outputPath }: GenerateArtifactOptions): void {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(outputPath));

  doc.fontSize(20).text(title, { align: 'center' });
  doc.fontSize(12).text(`Lore: ${lore}`);
  doc.image(`./badges/${badge}.png`, { width: 100 });

  doc.end();
}
