"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null;
  
  const g = globalThis as Record<string, unknown>;
  if (!g.__focus_socket) {
    g.__focus_socket = io(window.location.origin, {
      path: "/socket.io/",
      addTrailingSlash: false,
    });
  }
  return g.__focus_socket as Socket;
}

export const useSocket = (roomId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
      if (roomId) {
        socket.emit('join-room', roomId);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      if (roomId) {
        socket.emit('leave-room', roomId);
      }
    };
  }, [roomId]);

  const emit = useCallback((event: string, data: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => { socket.off(event, handler); };
  }, []);

  return { socket: socketRef.current, isConnected, emit, on };
};
