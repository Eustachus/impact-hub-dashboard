"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (roomId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the same host that served the page
    const socketInstance = io(window.location.origin, {
      path: "/socket.io/",
      addTrailingSlash: false,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      if (roomId) {
        socketInstance.emit('join-room', roomId);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  return { socket, isConnected };
};
