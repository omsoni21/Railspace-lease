
'use server';

/**
 * @fileOverview An AI agent for processing crowd-sourced encroachment reports.
 *
 * - processEncroachmentReport - A function that analyzes a user-submitted report.
 * - ProcessEncroachmentReportInput - The input type for the function.
 * - ProcessEncroachmentReportOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProcessEncroachmentReportInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of the potential encroachment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z.string().describe('The GPS coordinates or address of the report.'),
  description: z.string().describe('A description of the potential encroachment.'),
  isAnonymous: z.boolean().describe('Whether the submission is anonymous.'),
});
export type ProcessEncroachmentReportInput = z.infer<typeof ProcessEncroachmentReportInputSchema>;

const ProcessEncroachmentReportOutputSchema = z.object({
  isValidReport: z
    .boolean()
    .describe('Whether the report appears to be a valid case of encroachment.'),
  assessment: z
    .string()
    .describe('A brief summary of the AI\'s assessment of the report.'),
  rewardTier: z
    .enum(['Gold', 'Silver', 'Bronze', 'None'])
    .describe('The potential reward tier if the report is verified.'),
});
export type ProcessEncroachmentReportOutput = z.infer<typeof ProcessEncroachmentReportOutputSchema>;

export async function processEncroachmentReport(
  input: ProcessEncroachmentReportInput
): Promise<ProcessEncroachmentReportOutput> {
  return processEncroachmentReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processEncroachmentReportPrompt',
  input: { schema: ProcessEncroachmentReportInputSchema },
  output: { schema: ProcessEncroachmentReportOutputSchema },
  prompt: `You are an AI assistant for the Indian Railways Land Management System. Your task is to process crowd-sourced reports of potential land encroachment.

Analyze the provided information:
- Photo: {{media url=imageDataUri}}
- Location: {{{location}}}
- Description: {{{description}}}

Based on the image and description, determine if this is a valid report of encroachment (e.g., unauthorized structures, dumping, etc.).

- If it seems valid, set isValidReport to true, provide a brief assessment, and assign a potential reward tier (Gold for high-impact reports, Silver for moderate, Bronze for minor).
- If it does not seem like a valid report, set isValidReport to false, explain why, and set the reward tier to None.
- Anonymous status: {{{isAnonymous}}} - this does not affect validity, but is for record-keeping.`,
});

const processEncroachmentReportFlow = ai.defineFlow(
  {
    name: 'processEncroachmentReportFlow',
    inputSchema: ProcessEncroachmentReportInputSchema,
    outputSchema: ProcessEncroachmentReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
