/**
 * @fileOverview Schemas for the assessApplicationRisk flow.
 *
 * - AssessApplicationRiskInputSchema - The Zod schema for the input.
 * - AssessApplicationRiskInput - The TypeScript type for the input.
 * - AssessApplicationRiskOutputSchema - The Zod schema for the output.
 * - AssessApplicationRiskOutput - The TypeScript type for the output.
 */

import { z } from 'genkit';

export const AssessApplicationRiskInputSchema = z.object({
  applicantData: z
    .string()
    .describe(
      "A summary of the applicant's data, including credit score, business history, and document verification status."
    ),
  assetType: z
    .string()
    .describe('The type of asset they are applying for (e.g., Warehouse, Land).'),
  leaseValue: z.number().describe('The total annual value of the lease.'),
});
export type AssessApplicationRiskInput = z.infer<
  typeof AssessApplicationRiskInputSchema
>;

export const AssessApplicationRiskOutputSchema = z.object({
  riskScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A risk score from 0 (very low risk) to 100 (very high risk).'),
  decision: z
    .enum(['Auto-Approve', 'Manual-Review', 'Reject'])
    .describe('The recommended action based on the risk score.'),
  reasoning: z
    .string()
    .describe('A brief explanation for the assigned risk score and decision.'),
});
export type AssessApplicationRiskOutput = z.infer<
  typeof AssessApplicationRiskOutputSchema
>;
