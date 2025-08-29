import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff } from 'lucide-react';
import { AISummarizer } from './ai-summarizer';

export function RoomHeader({ roomId }: { roomId: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Synk</h1>
        <span className="text-sm text-muted-foreground hidden md:inline">/ {roomId}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon"><Mic className="h-5 w-5" /></Button>
        <Button variant="outline" size="icon"><Video className="h-5 w-5" /></Button>
        <Button variant="outline" size="icon"><ScreenShare className="h-5 w-5" /></Button>
        <AISummarizer />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2 overflow-hidden">
          <Avatar className="inline-block h-9 w-9 rounded-full ring-2 ring-background">
            <AvatarImage width={36} height={36} src="https://picsum.photos/id/1/36/36" data-ai-hint="person avatar" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar className="inline-block h-9 w-9 rounded-full ring-2 ring-background">
            <AvatarImage width={36} height={36} src="https://picsum.photos/id/2/36/36" data-ai-hint="person avatar" />
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
          <Avatar className="inline-block h-9 w-9 rounded-full ring-2 ring-background">
            <AvatarFallback>+2</AvatarFallback>
          </Avatar>
        </div>
        <Button variant="destructive">
          <PhoneOff className="mr-2 h-5 w-5" />
          Leave
        </Button>
      </div>
    </header>
  );
}
