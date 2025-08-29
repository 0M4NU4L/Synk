"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, ArrowRight, Layers, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  // A dummy room ID for demonstration
  const recentRoomId = "a1b2c3d4";

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Layers className="h-6 w-6" />
            <span className="sr-only">Synk</span>
          </Link>
          <Link href="/dashboard" className="font-bold text-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create a new room</CardTitle>
              <CardDescription>Start a new collaboration session.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" asChild>
                <Link href={`/rooms/new-room-${Math.random().toString(36).substring(2, 9)}`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Room
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Join a room</CardTitle>
              <CardDescription>Enter a room ID to join an existing session.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex space-x-2">
                <Input placeholder="Enter Room ID" />
                <Button type="submit">Join</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Rooms</h2>
          <div className="grid gap-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Synk Kick-off</CardTitle>
                    <Link href={`/rooms/${recentRoomId}`}>
                        <Button variant="outline" size="sm">
                            Join <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground">
                        ID: {recentRoomId} &middot; 3 participants
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}