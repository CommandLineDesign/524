import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';

import { useAuthStore } from '../store/authStore';

// Get the WebSocket URL from environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5240';
const WS_URL = API_BASE_URL.replace(/^http/, 'ws');

export function useSocket() {
  const { user, token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
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

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        // Server disconnected, manual reconnection needed
        setConnectionError('Connection lost. Please refresh.');
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      setConnectionError('Failed to reconnect');
    });

    // Message event handlers
    socket.on('message:new', (message) => {
      console.log('New message received:', message);
      // This will be handled by React Query cache updates
    });

    socket.on('message:delivered', (data) => {
      console.log('Message delivered:', data);
    });

    socket.on('message:read', (data) => {
      console.log('Message read:', data);
    });

    socket.on('user:typing', (data) => {
      console.log('User typing:', data);
    });

    socket.on('conversation:joined', (data) => {
      console.log('Joined conversation:', data);
    });

    socket.on('error', (error) => {
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
