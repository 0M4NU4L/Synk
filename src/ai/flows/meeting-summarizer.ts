'use server';

/**
 * @fileOverview Summarizes meeting transcript to extract key discussion points, action items, and decisions made.
 *
 * - meetingSummarizer - A function that handles the meeting summarization process.
 * - MeetingSummarizerInput - The input type for the meetingSummarizer function.
 * - MeetingSummarizerOutput - The return type for the meetingSummarizer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const MeetingSummarizerInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'Audio recording of the meeting, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type MeetingSummarizerInput = z.infer<typeof MeetingSummarizerInputSchema>;

const MeetingSummarizerOutputSchema = z.object({
  summary: z.string().describe('A summary of the meeting including key discussion points, action items, and decisions made.'),
});
export type MeetingSummarizerOutput = z.infer<typeof MeetingSummarizerOutputSchema>;

export async function meetingSummarizer(input: MeetingSummarizerInput): Promise<MeetingSummarizerOutput> {
  return meetingSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'meetingSummarizerPrompt',
  input: {schema: MeetingSummarizerInputSchema},
  output: {schema: MeetingSummarizerOutputSchema},
  prompt: `You are an AI assistant that summarizes meetings.

  Summarize the key discussion points, action items, and decisions made in the meeting transcript below.

  Meeting Transcript: {{audioDataUri}}`,
});

const meetingSummarizerFlow = ai.defineFlow(
  {
    name: 'meetingSummarizerFlow',
    inputSchema: MeetingSummarizerInputSchema,
    outputSchema: MeetingSummarizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
