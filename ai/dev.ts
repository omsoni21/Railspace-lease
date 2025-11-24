
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-lease-rate.ts';
import '@/ai/flows/detect-encroachment.ts';
import '@/ai/flows/report-encroachment.ts';
import '@/ai/flows/predict-maintenance.ts';
import '@/ai/flows/predict-high-risk-zones.ts';
import '@/ai/flows/assess-application-risk.ts';
import '@/ai/flows/verify-document.ts';
