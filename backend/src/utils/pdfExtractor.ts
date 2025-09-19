import pdfjs from 'pdfjs-dist';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Load PDF document
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument(data);
  const pdf = await loadingTask.promise;

  let fullText = '';

  // Extract text from each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    
    fullText += pageText + '\n';
  }

  return fullText.trim();
}