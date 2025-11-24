"use server";

/**
 * @fileOverview An AI agent for assessing the risk of a lease application.
 *
 * - assessApplicationRisk - A function that analyzes applicant data to produce a risk score.
 */

import { ai } from "@/ai/genkit";
import {
  AssessApplicationRiskInput,
  AssessApplicationRiskInputSchema,
  AssessApplicationRiskOutput,
  AssessApplicationRiskOutputSchema,
} from "@/ai/schemas/assess-application-risk-schema";

// 👉 THIS is the function you will import in page.tsx
export async function assessApplicationRisk(
  input: AssessApplicationRiskInput
): Promise<AssessApplicationRiskOutput> {
  return assessApplicationRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: "assessApplicationRiskPrompt",
  input: { schema: AssessApplicationRiskInputSchema },
  output: { schema: AssessApplicationRiskOutputSchema },
  prompt: `You are an AI Risk Assessment Officer for Indian Railways. Your task is to evaluate a lease application and provide a risk assessment.

Analyze the applicant's data:
- Applicant Data: {{{applicantData}}}
- Asset Type: {{{assetType}}}
- Lease Value: ₹{{{leaseValue}}} per year

Follow this logic:
1.  Calculate a risk score from 0 to 100. Consider factors like credit score (higher is better), business stability, document verification status, and past defaults. High lease values on critical assets may increase risk.
2.  Based on the score, make a decision:
    - Score < 30: 'Auto-Approve'. The applicant is low-risk.
    - Score 30-70: 'Manual-Review'. The application has moderate risk factors that require human oversight.
    - Score > 70: 'Reject'. The applicant is high-risk.
3.  Provide a clear, concise reasoning for your decision, referencing the data provided. For manual reviews, specify what an officer should look into.
`,
});

const assessApplicationRiskFlow = ai.defineFlow(
  {
    name: "assessApplicationRiskFlow",
    inputSchema: AssessApplicationRiskInputSchema,
    outputSchema: AssessApplicationRiskOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
