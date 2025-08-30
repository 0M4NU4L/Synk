import type { ReactNode } from 'react';
import { RoomSidebar } from '@/components/synk/sidebar';
import { RoomHeader } from '@/components/synk/header';

export default async function RoomLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  
  return (
    <div className="flex h-screen w-full bg-muted/40">
      <RoomSidebar />
      <div className="flex flex-1 flex-col">
        <RoomHeader roomId={roomId} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
