// src/ai/gemini/geminiTypes.ts
// Gemini Creative Brain contracts and payload definitions.

import type {
  AiEnvelope,
  GeminiNarrativeResponse,
} from '../types';

export type GeminiEnvelope = AiEnvelope<GeminiNarrativeResponse>;

export interface GeminiApiGenerateRequest {
  contents: Array<{
    role: 'user';
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
}
