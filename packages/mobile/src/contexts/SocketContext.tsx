import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';

import { TokenService } from '../services/tokenService';
import { useAuthStore } from '../store/authStore';

// Get the API URL from environment
// Socket.IO uses HTTP/HTTPS URLs, not WS/WSS - it handles the WebSocket upgrade internally
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5240';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);

  // Get the token from TokenService when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      TokenService.getAccessToken().then(setToken);
    } else {
      setToken(null);
    }
  }, [isAuthenticated]);
  const socketRef = useRef<Socket | null>(null);
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

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        // Server disconnected, manual reconnection needed
        setConnectionError('Connection lost. Please refresh.');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.io.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.io.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      setConnectionError('Failed to reconnect');
    });

    // Message event handlers
    newSocket.on('message:new', (message) => {
      console.log('New message received:', message);
      // This will be handled by React Query cache updates
    });

    newSocket.on('message:delivered', (data) => {
      console.log('Message delivered:', data);
    });

    newSocket.on('message:read', (data) => {
      console.log('Message read:', data);
    });

    newSocket.on('user:typing', (data) => {
      console.log('User typing:', data);
    });

    newSocket.on('conversation:joined', (data) => {
      console.log('Joined conversation:', data);
    });

    newSocket.on('error', (error) => {
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
