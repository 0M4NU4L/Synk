'use client';
import { useState } from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { meetingSummarizer } from '@/ai/flows/meeting-summarizer';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AISummarizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsLoading(true);
    setSummary('');

    try {
      // In a real app, you would get audio data from the LiveKit recording.
      // Here, we use a placeholder data URI representing a silent WAV file.
      // This is to make the AI flow runnable and demonstrate functionality.
      const silentWavDataUri =
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

      const result = await meetingSummarizer({ audioDataUri: silentWavDataUri });
      
      if (result.summary) {
        setSummary(result.summary);
      } else {
          // The model might return an empty summary if the audio is silent.
          setSummary("No key discussion points, action items, or decisions were found in the provided audio. The AI model needs a real meeting recording to provide a summary.");
      }
    } catch (error) {
      console.error('Error summarizing meeting:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate meeting summary. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setSummary('');
    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bot className="mr-2 h-5 w-5" />
          AI Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI-Powered Meeting Summary</DialogTitle>
          <DialogDescription>
            Generate a summary of key discussion points, action items, and decisions from the meeting recording.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {summary ? (
            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <h3 className="font-bold mb-2 flex items-center"><Sparkles className="mr-2 h-4 w-4 text-primary" />Summary</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</div>
            </ScrollArea>
          ) : (
            <div className="flex h-72 w-full items-center justify-center rounded-md border border-dashed">
              <Button onClick={handleSummarize} disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Summary from Recording
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          {summary && (
            <Button onClick={handleSummarize} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Regenerate
                  </>
                )}
              </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
