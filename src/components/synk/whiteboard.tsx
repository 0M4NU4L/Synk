'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Users, Pen, Eraser } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useWhiteboard, DrawEvent } from '@/hooks/use-whiteboard';

type DrawMode = 'pen' | 'eraser';

export default function Whiteboard({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>('pen');
  const { user } = useAuth();
  const { 
    drawEvents, 
    collaborators, 
    loading, 
    error, 
    addDrawEvent, 
    clearWhiteboard,
    joinWhiteboard 
  } = useWhiteboard(roomId);

  // Join whiteboard when component mounts
  useEffect(() => {
    if (user && !loading) {
      joinWhiteboard();
    }
  }, [user, loading]);

  // Redraw canvas from events
  const redraw = useCallback((events: DrawEvent[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    let isDrawing = false;
    
    for (const event of events) {
      if (event.type === 'begin') {
        ctx.beginPath();
        ctx.moveTo(event.x, event.y);
        if (event.color === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = 20;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
        }
        isDrawing = true;
      } else if (event.type === 'draw' && isDrawing) {
        ctx.lineTo(event.x, event.y);
        ctx.stroke();
      } else if (event.type === 'end') {
        isDrawing = false;
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }, []);

  // Redraw when events change
  useEffect(() => {
    redraw(drawEvents);
  }, [drawEvents, redraw]);

  // Handle local drawing
  const handlePointer = useCallback((type: 'begin' | 'draw' | 'end') => (e: React.PointerEvent) => {
    if (!user) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    addDrawEvent({
      x, 
      y, 
      type, 
      color: drawMode === 'eraser' ? 'eraser' : '#000000',
      lineWidth: drawMode === 'eraser' ? 20 : 2
    });
  }, [drawMode, user, addDrawEvent]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Whiteboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 w-full h-96 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Whiteboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Whiteboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            Please sign in to use the whiteboard
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Whiteboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Badge variant="secondary">{collaborators.length}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simple Tools */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex gap-2">
            <Button
              variant={drawMode === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDrawMode('pen')}
            >
              <Pen className="h-4 w-4 mr-2" />
              Pen
            </Button>
            <Button
              variant={drawMode === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDrawMode('eraser')}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Eraser
            </Button>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="destructive" onClick={clearWhiteboard}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex justify-center bg-white p-4 rounded-lg border">
          <canvas
            ref={canvasRef}
            width={1000}
            height={600}
            className="border-2 border-gray-300 bg-white rounded cursor-crosshair touch-none max-w-full h-auto"
            style={{
              cursor: drawMode === 'pen' ? 'crosshair' : 'grab'
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              setDrawing(true);
              handlePointer('begin')(e);
            }}
            onPointerMove={(e) => {
              e.preventDefault();
              if (drawing) {
                handlePointer('draw')(e);
              }
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setDrawing(false);
              handlePointer('end')(e);
            }}
            onPointerLeave={(e) => {
              if (drawing) {
                setDrawing(false);
                handlePointer('end')(e);
              }
            }}
            onPointerCancel={(e) => {
              if (drawing) {
                setDrawing(false);
                handlePointer('end')(e);
              }
            }}
          />
        </div>
        
        {/* Status */}
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          {collaborators.length > 1 ? (
            <span>{collaborators.length} people collaborating</span>
          ) : (
            <span>You are alone in this session</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
