import pdfParse from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);

    if (data.text && data.text.trim().length > 50) {
      console.log(`✅ Extracted ${data.text.length} characters from PDF`);
      return data.text.trim();
    }

    throw new Error("Extracted PDF text is too short.");
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF. Try uploading DOCX instead.");
  }
}
