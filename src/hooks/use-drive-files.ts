'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';

export interface DriveFile {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'video' | 'other';
  url: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  size?: string;
  modifiedTime: string;
  addedBy: string;
  addedByName: string;
  addedAt: any;
  roomId: string;
}

export function useDriveFiles(roomId: string) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const filesRef = collection(db, 'driveFiles');
    const q = query(
      filesRef, 
      where('roomId', '==', roomId),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const filesData: DriveFile[] = [];
        snapshot.forEach((doc) => {
          filesData.push({ id: doc.id, ...doc.data() } as DriveFile);
        });
        setFiles(filesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching files:', err);
        setError('Failed to load files');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const addFile = async (fileData: {
    name: string;
    type: DriveFile['type'];
    url: string;
    embedUrl?: string;
    thumbnailUrl?: string;
    size?: string;
    modifiedTime: string;
  }) => {
    if (!user || !roomId) return;

    try {
      const filesRef = collection(db, 'driveFiles');
      const newFile = {
        ...fileData,
        addedBy: user.uid,
        addedByName: user.displayName || user.email || 'Anonymous',
        addedAt: serverTimestamp(),
        roomId,
      };

      await addDoc(filesRef, newFile);
      setError(null);
    } catch (err) {
      console.error('Error adding file:', err);
      setError('Failed to add file');
      throw err;
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!user) return;

    try {
      const fileRef = doc(db, 'driveFiles', fileId);
      await deleteDoc(fileRef);
      setError(null);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
      throw err;
    }
  };

  return {
    files,
    loading,
    error,
    addFile,
    deleteFile,
  };
}
