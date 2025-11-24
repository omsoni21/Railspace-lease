
'use server';

/**
 * @fileOverview An AI agent for predicting warehouse maintenance needs from sensor data.
 *
 * - predictMaintenance - A function that analyzes sensor data to predict maintenance.
 * - PredictMaintenanceInput - The input type for the predictMaintenance function.
 * - PredictMaintenanceOutput - The return type for the predictMaintenance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictMaintenanceInputSchema = z.object({
  warehouseId: z.string().describe('The ID of the warehouse.'),
  sensorData: z
    .string()
    .describe(
      'A string of recent sensor readings (e.g., temperature, humidity, vibration).'
    ),
});
export type PredictMaintenanceInput = z.infer<typeof PredictMaintenanceInputSchema>;

const PredictMaintenanceOutputSchema = z.object({
  maintenanceRequired: z
    .boolean()
    .describe('Whether maintenance is predicted to be required.'),
  urgency: z
    .enum(['Low', 'Medium', 'High', 'None'])
    .describe('The urgency of the maintenance if required.'),
  recommendation: z
    .string()
    .describe('A brief recommendation for the maintenance action needed.'),
});
export type PredictMaintenanceOutput = z.infer<typeof PredictMaintenanceOutputSchema>;

export async function predictMaintenance(
  input: PredictMaintenanceInput
): Promise<PredictMaintenanceOutput> {
  return predictMaintenanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictMaintenancePrompt',
  input: { schema: PredictMaintenanceInputSchema },
  output: { schema: PredictMaintenanceOutputSchema },
  prompt: `You are an AI expert in predictive maintenance for industrial warehouses. Your task is to analyze sensor data and predict if maintenance is required.

Analyze the following data for warehouse {{{warehouseId}}}:
- Sensor Data: {{{sensorData}}}

Look for anomalies or trends that suggest a potential failure (e.g., rising temperature, excessive vibration, high humidity).

- If a potential issue is identified, set maintenanceRequired to true, determine the urgency (High, Medium, Low), and provide a clear recommendation (e.g., "Inspect HVAC system," "Check conveyor belt motor").
- If the data looks normal, set maintenanceRequired to false, urgency to None, and recommendation to "All systems operating normally."`,
});

const predictMaintenanceFlow = ai.defineFlow(
  {
    name: 'predictMaintenanceFlow',
    inputSchema: PredictMaintenanceInputSchema,
    outputSchema: PredictMaintenanceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
