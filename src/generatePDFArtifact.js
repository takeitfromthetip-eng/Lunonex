import { createPDF, attachMetadata, exportPDF } from './tools/pdfEngine';

export async function generatePDFArtifact() {
  const doc = await createPDF({ template: 'legacy-drop', content: 'creator-milestone' });
  await attachMetadata(doc, { author: 'Jacob', ritual: true });
  await exportPDF(doc, { format: 'pdf', sealed: true });
}
