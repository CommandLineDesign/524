import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';

import { useAuthStore } from '../store/authStore';

// Get the WebSocket URL from environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5240';
const WS_URL = API_BASE_URL.replace(/^http/, 'ws');

export function useSocket() {
  const { user, token } = useAuthStore();
  // biome-ignore lint/suspicious/noExplicitAny: socket.io Socket type from third-party library
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      // Clean up existing connection if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const socket = io(WS_URL, {
      auth: {
        token,
        userId: user.id,
        userRole: user.primaryRole || 'customer',
      },
      transports: ['websocket'], // Use only WebSocket transport
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on(
      'disconnect',
      (
        // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
        reason: any
      ) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);

        if (reason === 'io server disconnect') {
          // Server disconnected, manual reconnection needed
          setConnectionError('Connection lost. Please refresh.');
        }
      }
    );

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    socket.on('reconnect', (attemptNumber: any) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    socket.on('reconnect_error', (error: any) => {
      console.error('Socket reconnection error:', error);
      setConnectionError('Failed to reconnect');
    });

    // Message event handlers
    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    socket.on('message:new', (message: any) => {
      console.log('New message received:', message);
      // This will be handled by React Query cache updates
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    socket.on('message:delivered', (data: any) => {
      console.log('Message delivered:', data);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    socket.on('message:read', (data: any) => {
      console.log('Message read:', data);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    socket.on('user:typing', (data: any) => {
      console.log('User typing:', data);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    socket.on('conversation:joined', (data: any) => {
      console.log('Joined conversation:', data);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user, token]);

  // Reconnect method
  const reconnect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  };

  // Disconnect method
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    reconnect,
    disconnect,
  };
}
