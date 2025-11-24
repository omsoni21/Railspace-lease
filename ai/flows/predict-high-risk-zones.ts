
'use server';

/**
 * @fileOverview An AI agent for predicting high-risk encroachment zones.
 *
 * - predictHighRiskZones - A function that analyzes historical data to predict high-risk zones.
 * - PredictHighRiskZonesInput - The input type for the predictHighRiskZones function.
 * - PredictHighRiskZonesOutput - The return type for the predictHighRiskZones function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictHighRiskZonesInputSchema = z.object({
  historicalData: z
    .string()
    .describe('A summary of historical encroachment incidents, including locations, types, and frequencies.'),
  landRecords: z
    .string()
    .describe('A summary of land record data, highlighting any discrepancies or legal disputes.'),
  satelliteAnalysis: z
    .string()
    .describe('A summary of recent satellite imagery analysis, noting any unusual activities or changes.')
});
export type PredictHighRiskZonesInput = z.infer<typeof PredictHighRiskZonesInputSchema>;

const HighRiskZoneSchema = z.object({
    location: z.string().describe('The specific location of the high-risk zone.'),
    riskLevel: z.enum(['High', 'Medium', 'Low']).describe('The predicted risk level of encroachment.'),
    reason: z.string().describe('The rationale behind the risk assessment.'),
});

const PredictHighRiskZonesOutputSchema = z.object({
  zones: z.array(HighRiskZoneSchema).describe('A list of predicted high-risk encroachment zones.'),
});
export type PredictHighRiskZonesOutput = z.infer<typeof PredictHighRiskZonesOutputSchema>;

export async function predictHighRiskZones(
  input: PredictHighRiskZonesInput
): Promise<PredictHighRiskZonesOutput> {
  return predictHighRiskZonesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictHighRiskZonesPrompt',
  input: { schema: PredictHighRiskZonesInputSchema },
  output: { schema: PredictHighRiskZonesOutputSchema },
  prompt: `You are an expert AI data analyst specializing in urban planning and risk assessment for railway land. Your task is to predict areas at high risk of future encroachment.

Analyze the following data sources:
- Historical Encroachment Data: {{{historicalData}}}
- Land Record Data: {{{landRecords}}}
- Satellite Image Analysis Summary: {{{satelliteAnalysis}}}

Based on your analysis, identify specific zones that are at a High, Medium, or Low risk of future encroachment. For each zone, provide the location, the assessed risk level, and a clear reason for your assessment. Look for patterns like proximity to informal settlements, repeated past incidents, or recent unexplained changes in land use from satellite data.
`,
});

const predictHighRiskZonesFlow = ai.defineFlow(
  {
    name: 'predictHighRiskZonesFlow',
    inputSchema: PredictHighRiskZonesInputSchema,
    outputSchema: PredictHighRiskZonesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
