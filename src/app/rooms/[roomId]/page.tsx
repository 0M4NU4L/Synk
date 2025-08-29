'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TasksBoard } from '@/components/synk/tasks-board';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { useLiveKit } from '@/hooks/use-livekit';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Placeholder = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">{title} content coming soon.</p>
      </div>
    </CardContent>
  </Card>
);

const CallTab = () => {
    const pathname = usePathname();
    const roomName = pathname.split('/').pop() || 'default-room';
    const { token, user } = useLiveKit(roomName);
    
    if (token === '') {
      return (
        <div className="flex flex-1 items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <p className="text-lg">Connecting to call...</p>
        </div>
      );
    }
  
    return (
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: 'calc(100vh - 120px)' }}
      >
        <VideoConference />
      </LiveKitRoom>
    );
  };
const WhiteboardTab = () => <Placeholder title="Interactive Whiteboard" />;
const FilesTab = () => <Placeholder title="Google Drive Files" />;
const ChatTab = () => <Placeholder title="Real-time Chat" />;

function TabContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'call';

  switch (tab) {
    case 'tasks':
      return <TasksBoard />;
    case 'whiteboard':
      return <WhiteboardTab />;
    case 'files':
      return <FilesTab />;
    case 'chat':
      return <ChatTab />;
    case 'call':
    default:
      return <CallTab />;
  }
}

export default function RoomPage() {
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <TabContent />
    </Suspense>
  );
}
