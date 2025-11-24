
'use server';

/**
 * @fileOverview An AI agent for detecting land encroachment from images.
 *
 * - detectEncroachment - A function that analyzes an image for encroachment.
 * - DetectEncroachmentInput - The input type for the detectEncroachment function.
 * - DetectEncroachmentOutput - The return type for the detectEncroachment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectEncroachmentInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a land parcel, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectEncroachmentInput = z.infer<typeof DetectEncroachmentInputSchema>;

const DetectEncroachmentOutputSchema = z.object({
  hasEncroachment: z
    .boolean()
    .describe('Whether or not unauthorized encroachment is detected in the image.'),
  details: z
    .string()
    .describe('A brief summary of the findings, including the type of encroachment if any.'),
});
export type DetectEncroachmentOutput = z.infer<typeof DetectEncroachmentOutputSchema>;

export async function detectEncroachment(
  input: DetectEncroachmentInput
): Promise<DetectEncroachmentOutput> {
  return detectEncroachmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectEncroachmentPrompt',
  input: { schema: DetectEncroachmentInputSchema },
  output: { schema: DetectEncroachmentOutputSchema },
  prompt: `You are an expert in analyzing satellite and drone imagery for land management. Your task is to detect unauthorized encroachments on railway land.

Analyze the provided image: {{media url=imageDataUri}}

Look for any signs of unauthorized construction, illegal dumping, informal settlements, or any other activity that indicates encroachment on what should be vacant land.

- If encroachment is detected, set hasEncroachment to true and provide details about the type of encroachment observed.
- If no encroachment is found, set hasEncroachment to false and state that the land appears clear.`,
});

const detectEncroachmentFlow = ai.defineFlow(
  {
    name: 'detectEncroachmentFlow',
    inputSchema: DetectEncroachmentInputSchema,
    outputSchema: DetectEncroachmentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
