import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';

import { useAuthStore } from '../store/authStore';

// Get the API URL from environment
// Socket.IO uses HTTP/HTTPS URLs, not WS/WSS - it handles the WebSocket upgrade internally
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5240';

interface SocketContextValue {
  // biome-ignore lint/suspicious/noExplicitAny: socket.io Socket type from third-party library
  socket: any | null;
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  // biome-ignore lint/suspicious/noExplicitAny: socket.io Socket type from third-party library
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!user || !token) {
      // Clean up existing connection if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        forceUpdate({});
      }
      return;
    }

    // Don't create a new socket if one already exists
    if (socketRef.current) {
      return;
    }

    // Create socket connection
    const newSocket = io(API_BASE_URL, {
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

    socketRef.current = newSocket;
    forceUpdate({}); // Force re-render to update consumers

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on(
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
    newSocket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    newSocket.on('reconnect', (attemptNumber: any) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    newSocket.on('reconnect_error', (error: any) => {
      console.error('Socket reconnection error:', error);
      setConnectionError('Failed to reconnect');
    });

    // Message event handlers
    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    newSocket.on('message:new', (message: any) => {
      console.log('New message received:', message);
      // This will be handled by React Query cache updates
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    newSocket.on('message:delivered', (data: any) => {
      console.log('Message delivered:', data);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    newSocket.on('message:read', (data: any) => {
      console.log('Message read:', data);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    newSocket.on('user:typing', (data: any) => {
      console.log('User typing:', data);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    newSocket.on('conversation:joined', (data: any) => {
      console.log('Joined conversation:', data);
    });

    // biome-ignore lint/suspicious/noExplicitAny: socket.io event handler parameter
    newSocket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
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
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const value: SocketContextValue = {
    socket: socketRef.current,
    isConnected,
    connectionError,
    reconnect,
    disconnect: disconnectSocket,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
