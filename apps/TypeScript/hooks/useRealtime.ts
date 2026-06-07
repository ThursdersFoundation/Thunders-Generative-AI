'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getWebSocketClient, WebSocketService } from '@/services/websocket';

interface UseRealtimeOptions {
  url?: string;
  events?: string[];
  enabled?: boolean;
  onMessage?: (data: unknown) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseRealtimeReturn {
  isConnected: boolean;
  lastMessage: unknown;
  reconnectCount: number;
  connect: () => void;
  disconnect: () => void;
  send: (eventType: string, payload: unknown) => void;
  subscribe: (eventType: string, handler: (data: unknown) => void) => () => void;
}

export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
  const {
    url,
    events = [],
    enabled = true,
    onMessage,
    onConnect,
    onDisconnect,
  } = options;

  const clientRef = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const initializeClient = useCallback(() => {
    try {
      const client = getWebSocketClient(url ? { url } : undefined);
      clientRef.current = client;
      return client;
    } catch {
      if (url) {
        const client = new WebSocketService({
          url,
          reconnect: true,
          reconnectInterval: 3000,
          reconnectAttempts: 10,
        });
        clientRef.current = client;
        return client;
      }
      return null;
    }
  }, [url]);

  useEffect(() => {
    if (!enabled) return;

    const client = initializeClient();
    if (!client) return;

    const unsubConnect = client.onOpen(() => {
      setIsConnected(true);
      setReconnectCount(0);
      onConnect?.();
    });

    const unsubDisconnect = client.onClose(() => {
      setIsConnected(false);
      const state = client.getState();
      setReconnectCount(state.reconnectCount);
      onDisconnect?.();
    });

    const unsubWildcard = client.on('*', (data) => {
      setLastMessage(data);
      onMessage?.(data);
    });

    const eventUnsubscribers = events.map((eventType) =>
      client.on(eventType, (data) => {
        setLastMessage(data);
        onMessage?.(data);
      }),
    );

    client.connect();

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubWildcard();
      eventUnsubscribers.forEach((unsub) => unsub());
      client.disconnect();
    };
  }, [enabled, initializeClient, events, onMessage, onConnect, onDisconnect]);

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const send = useCallback((eventType: string, payload: unknown) => {
    clientRef.current?.send(eventType, payload);
  }, []);

  const subscribe = useCallback((eventType: string, handler: (data: unknown) => void) => {
    return clientRef.current?.on(eventType, handler) ?? (() => {});
  }, []);

  return {
    isConnected,
    lastMessage,
    reconnectCount,
    connect,
    disconnect,
    send,
    subscribe,
  };
}
