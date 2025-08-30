'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Layers, Video, Edit3, CheckSquare, FileText, MessageSquare } from 'lucide-react';

const navItems = [
  { tab: 'call', icon: Video, label: 'Video Call' },
  { tab: 'whiteboard', icon: Edit3, label: 'Whiteboard' },
  { tab: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { tab: 'files', icon: FileText, label: 'Files' },
  { tab: 'chat', icon: MessageSquare, label: 'Chat' },
];

export function RoomSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'call';

  return (
    <aside className="flex h-screen flex-col items-center gap-4 border-r bg-background p-2 sm:py-4">
      <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
        <Layers className="h-5 w-5" />
        <span className="sr-only">Synk</span>
      </Link>
      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => (
            <Tooltip key={item.tab}>
              <TooltipTrigger asChild>
                <Link href={`${pathname}?tab=${item.tab}`}>
                  <Button
                    variant={activeTab === item.tab ? 'default' : 'secondary'}
                    size="icon"
                    aria-label={item.label}
                    className="rounded-lg"
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
