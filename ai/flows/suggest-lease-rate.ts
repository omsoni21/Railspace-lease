
'use server';

/**
 * @fileOverview An AI agent for suggesting lease rates based on historical data and asset characteristics.
 *
 * - suggestLeaseRate - A function that suggests comparable lease rates.
 * - SuggestLeaseRateInput - The input type for the suggestLeaseRate function.
 * - SuggestLeaseRateOutput - The return type for the suggestLeaseRate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLeaseRateInputSchema = z.object({
  assetType: z
    .string()
    .describe('The type of asset being leased (e.g., warehouse, parking, godown).'),
  location: z.string().describe('The location of the asset.'),
  size: z.number().describe('The size of the asset in square feet.'),
  historicalData: z
    .string()
    .describe(
      'Historical lease data for similar assets, including occupancy rates, lease rates and characteristics.'
    ),
  marketTrends: z.string().describe('Current market trends, competitor pricing (e.g., from MagicBricks), and economic indicators like inflation.'),
  assetCondition: z.string().describe('The condition of the asset (e.g., excellent, good, fair).'),
});
export type SuggestLeaseRateInput = z.infer<typeof SuggestLeaseRateInputSchema>;

const SuggestLeaseRateOutputSchema = z.object({
  suggestedLeaseRate: z
    .number()
    .describe('The suggested lease rate per square foot, per month.'),
  confidenceLevel: z
    .enum(['High', 'Medium', 'Low'])
    .describe('The confidence level in the suggested lease rate (High, Medium, or Low).'),
  rationale: z
    .string()
    .describe('The rationale behind the suggested lease rate, including factors considered.'),
});
export type SuggestLeaseRateOutput = z.infer<typeof SuggestLeaseRateOutputSchema>;

export async function suggestLeaseRate(input: SuggestLeaseRateInput): Promise<SuggestLeaseRateOutput> {
  return suggestLeaseRateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLeaseRatePrompt',
  input: {schema: SuggestLeaseRateInputSchema},
  output: {schema: SuggestLeaseRateOutputSchema},
  prompt: `You are a sophisticated Dynamic Pricing Engine for Indian Railways' commercial and industrial properties. Your primary function is to analyze multiple data points to recommend an optimal, competitive market lease rate.

  Analyze the following information to suggest a monthly lease rate per square foot:

  - Asset Type: {{{assetType}}}
  - Location: {{{location}}}
  - Size: {{{size}}} square feet
  - Asset Condition: {{{assetCondition}}}
  - Historical & Occupancy Data: {{{historicalData}}}
  - Market & Economic Trends (including competitor rates): {{{marketTrends}}}

  Based on a comprehensive analysis of this data, provide a suggested lease rate per square foot.
  
  Also, determine a confidence level (High, Medium, Low) for your suggestion. The confidence level should be based on the quality, consistency, and completeness of the provided data. For instance, if specific competitor data and economic indicators are provided, confidence should be higher.
  
  Finally, provide a clear and concise rationale for your suggestion. Explicitly reference how the various factors—especially competitor pricing, location, asset condition, and market trends—influenced your final recommended price.
  `,
});

const suggestLeaseRateFlow = ai.defineFlow(
  {
    name: 'suggestLeaseRateFlow',
    inputSchema: SuggestLeaseRateInputSchema,
    outputSchema: SuggestLeaseRateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
