'use client';
import { useState, useEffect } from 'react';

// Generates a random user name
const getRandomUserName = () => {
    return `user-${Math.random().toString(36).substring(2, 9)}`;
}

export function useLiveKit(room: string) {
    const [token, setToken] = useState('');
    const [user] = useState(getRandomUserName());

    useEffect(() => {
        if (!room || !user) return;
        
        (async () => {
            try {
                const resp = await fetch(
                    `/api/livekit?room=${room}&username=${user}`
                );
                const data = await resp.json();
                if (data.token) {
                    setToken(data.token);
                }
            } catch (e) {
                console.error(e);
            }
        })();
    }, [room, user]);

    return { token, user };
}
