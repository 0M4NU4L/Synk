'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { TasksBoard } from '@/components/synk/tasks-board';
import Whiteboard from '@/components/synk/whiteboard';
import { FilesSection } from '@/components/synk/files-section';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { useLiveKit } from '@/hooks/use-livekit';
import { Loader2, X, Maximize2, Minimize2 } from 'lucide-react';
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

const VideoCallComponent = ({ 
  roomName, 
  isMinimized, 
  onToggleMinimize, 
  onClose 
}: { 
  roomName: string;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
}) => {
  const { token, user } = useLiveKit(roomName);
  
  if (token === '') {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <p>Connecting to call...</p>
      </div>
    );
  }

  return (
    <div className={`${isMinimized ? 'h-48' : 'h-full'} transition-all duration-300`}>
      <div className="flex items-center justify-between p-2 bg-black/80 text-white">
        <span className="text-sm">Video Call - {roomName}</span>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={onToggleMinimize}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        data-lk-theme="default"
        style={{ height: isMinimized ? '160px' : 'calc(100% - 40px)' }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

const WhiteboardTab = () => {
  const params = useParams();
  const roomId = params.roomId as string;
  return <Whiteboard roomId={roomId} />;
};

const FilesTab = () => {
  const params = useParams();
  const roomId = params.roomId as string;
  return <FilesSection roomId={roomId} />;
};

const ChatTab = () => <Placeholder title="Real-time Chat" />;

function TabContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const roomName = pathname.split('/').pop() || 'default-room';
  const tab = searchParams.get('tab') || 'call';
  
  const [showVideoCall, setShowVideoCall] = useState(true);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);

  const handleCloseVideo = () => {
    setShowVideoCall(false);
  };

  const handleToggleMinimize = () => {
    setIsVideoMinimized(!isVideoMinimized);
  };

  // If we're on the call tab, show full video conference
  if (tab === 'call') {
    return (
      <div className="h-full">
        <VideoCallComponent 
          roomName={roomName}
          isMinimized={false}
          onToggleMinimize={() => {}}
          onClose={handleCloseVideo}
        />
      </div>
    );
  }

  // For other tabs, show the content with optional video overlay
  return (
    <div className="relative h-full">
      {/* Main Content */}
      <div className="h-full">
        {tab === 'tasks' && <TasksBoard />}
        {tab === 'whiteboard' && <WhiteboardTab />}
        {tab === 'files' && <FilesTab />}
        {tab === 'chat' && <ChatTab />}
      </div>

      {/* Video Call Overlay */}
      {showVideoCall && (
        <div className={`fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg overflow-hidden ${
          isVideoMinimized ? 'w-80 h-52' : 'w-96 h-72'
        } transition-all duration-300`}>
          <VideoCallComponent 
            roomName={roomName}
            isMinimized={isVideoMinimized}
            onToggleMinimize={handleToggleMinimize}
            onClose={handleCloseVideo}
          />
        </div>
      )}
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <TabContent />
    </Suspense>
  );
}
