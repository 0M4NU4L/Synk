'use client';

import { useState, useEffect } from 'react';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';

export interface DrawEvent {
  x: number;
  y: number;
  type: 'begin' | 'draw' | 'end';
  color: string;
  lineWidth: number;
  userId: string;
  userName: string;
  timestamp: number;
}

export interface WhiteboardData {
  drawEvents: DrawEvent[];
  lastModified: any;
  lastModifiedBy: string;
  lastModifiedByName: string;
  collaborators: {
    userId: string;
    userName: string;
    joinedAt: any;
  }[];
  roomId: string;
}

export function useWhiteboard(roomId: string) {
  const [drawEvents, setDrawEvents] = useState<DrawEvent[]>([]);
  const [collaborators, setCollaborators] = useState<WhiteboardData['collaborators']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const whiteboardRef = doc(db, 'whiteboards', roomId);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      whiteboardRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as WhiteboardData;
          setDrawEvents(data.drawEvents || []);
          setCollaborators(data.collaborators || []);
        } else {
          // Initialize whiteboard if it doesn't exist
          initializeWhiteboard();
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching whiteboard:', err);
        setError('Failed to load whiteboard');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  // Handle user joining the whiteboard when authenticated
  useEffect(() => {
    if (user && !loading && collaborators.length > 0) {
      const userExists = collaborators.some(c => c.userId === user.uid);
      if (!userExists) {
        joinWhiteboard();
      }
    } else if (user && !loading && collaborators.length === 0) {
      // If whiteboard exists but no collaborators, add the user
      joinWhiteboard();
    }
  }, [user, loading, collaborators]);

  const initializeWhiteboard = async () => {
    if (!user) {
      // If no user yet, just set empty state
      setDrawEvents([]);
      setCollaborators([]);
      return;
    }

    try {
      await setDoc(whiteboardRef, {
        drawEvents: [],
        collaborators: [{
          userId: user.uid,
          userName: user.displayName || user.email || 'Anonymous',
          joinedAt: serverTimestamp()
        }],
        lastModified: serverTimestamp(),
        lastModifiedBy: user.uid,
        lastModifiedByName: user.displayName || user.email || 'Anonymous',
        roomId
      });
    } catch (err) {
      console.error('Error initializing whiteboard:', err);
      setError('Failed to initialize whiteboard');
    }
  };

  const addDrawEvent = async (event: Omit<DrawEvent, 'userId' | 'userName' | 'timestamp'>) => {
    if (!user) return;

    const drawEvent: DrawEvent = {
      ...event,
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous',
      timestamp: Date.now()
    };

    // Optimistically update local state first
    const newEvents = [...drawEvents, drawEvent];
    setDrawEvents(newEvents);

    try {
      await updateDoc(whiteboardRef, {
        drawEvents: newEvents,
        lastModified: serverTimestamp(),
        lastModifiedBy: user.uid,
        lastModifiedByName: user.displayName || user.email || 'Anonymous'
      });
    } catch (err) {
      console.error('Error adding draw event:', err);
      // Revert optimistic update on error
      setDrawEvents(drawEvents);
      setError('Failed to save drawing');
    }
  };

  const clearWhiteboard = async () => {
    if (!user) return;

    setDrawEvents([]);
    try {
      await updateDoc(whiteboardRef, {
        drawEvents: [],
        lastModified: serverTimestamp(),
        lastModifiedBy: user.uid,
        lastModifiedByName: user.displayName || user.email || 'Anonymous'
      });
    } catch (err) {
      console.error('Error clearing whiteboard:', err);
      setError('Failed to clear whiteboard');
    }
  };

  const joinWhiteboard = async () => {
    if (!user) return;

    const userCollaborator = {
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous',
      joinedAt: serverTimestamp()
    };

    try {
      await updateDoc(whiteboardRef, {
        collaborators: arrayUnion(userCollaborator)
      });
    } catch (err) {
      console.error('Error joining whiteboard:', err);
    }
  };

  const leaveWhiteboard = async () => {
    if (!user) return;

    const userCollaborator = collaborators.find(c => c.userId === user.uid);
    if (userCollaborator) {
      try {
        await updateDoc(whiteboardRef, {
          collaborators: arrayRemove(userCollaborator)
        });
      } catch (err) {
        console.error('Error leaving whiteboard:', err);
      }
    }
  };

  return {
    drawEvents,
    collaborators,
    loading,
    error,
    addDrawEvent,
    clearWhiteboard,
    joinWhiteboard,
    leaveWhiteboard
  };
}
