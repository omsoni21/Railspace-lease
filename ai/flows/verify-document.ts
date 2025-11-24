
'use server';

/**
 * @fileOverview An AI agent for verifying identity documents.
 *
 * - verifyDocument - A function that analyzes a document image for verification.
 * - VerifyDocumentInput - The input type for the verifyDocument function.
 * - VerifyDocumentOutput - The return type for the verifyDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VerifyDocumentInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of an identity document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentType: z.enum(['PAN', 'Aadhaar', 'GST Certificate']),
});
export type VerifyDocumentInput = z.infer<typeof VerifyDocumentInputSchema>;

const VerifyDocumentOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether the document is successfully verified.'),
  trustScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A confidence score (0-100) for the verification.'),
  extractedData: z
    .string()
    .describe(
      'Key data extracted from the document (e.g., Name, PAN Number, Aadhaar Number).'
    ),
  remarks: z.string().describe('Any remarks or reasons for the verification outcome.'),
});
export type VerifyDocumentOutput = z.infer<typeof VerifyDocumentOutputSchema>;

export async function verifyDocument(
  input: VerifyDocumentInput
): Promise<VerifyDocumentOutput> {
  return verifyDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyDocumentPrompt',
  input: { schema: VerifyDocumentInputSchema },
  output: { schema: VerifyDocumentOutputSchema },
  prompt: `You are an AI Document Verification Officer for Indian Railways. Your task is to analyze an uploaded identity document.

Analyze the provided image of a {{{documentType}}}: {{media url=imageDataUri}}

Follow this workflow:
1.  **OCR Extraction**: "Read" the text and key information from the document image.
2.  **Validation**: Check if the information is consistent and appears valid for the specified document type. For example, check the format of a PAN or Aadhaar number.
3.  **Trust Score Generation**: Assign a trust score from 0 to 100 based on the image clarity, data consistency, and apparent authenticity. A clear, valid document should get a score above 90. A blurry or inconsistent one should get a lower score.
4.  **Output Generation**:
    - Set 'isVerified' to true if the document appears authentic and all checks pass.
    - Populate 'extractedData' with the key information found (e.g., "Name: John Doe, PAN: ABCDE1234F").
    - Provide 'remarks' explaining your decision. If verification fails, state why (e.g., "Image is too blurry," "PAN format is incorrect").
`,
});

const verifyDocumentFlow = ai.defineFlow(
  {
    name: 'verifyDocumentFlow',
    inputSchema: VerifyDocumentInputSchema,
    outputSchema: VerifyDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
