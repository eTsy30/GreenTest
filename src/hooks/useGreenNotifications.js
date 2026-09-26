import { useEffect, useState } from 'react';
import { pollNotifications } from '../api/pollNotifications';

export function useGreenNotifications(client, chatIdentifiers, handlers) {
  const { onMessage, onStatus } = handlers;
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const chatIdKey = chatIdentifiers.join('|');

  useEffect(() => {
    setIsConnected(false);
    setError('');
    if (!client || !chatIdKey) return undefined;

    const controller = new AbortController();
    pollNotifications({
      client,
      identifiers: chatIdKey.split('|'),
      signal: controller.signal,
      onMessage,
      onStatus,
      onConnection: (connected, message) => {
        setIsConnected(connected);
        setError(message);
      },
    });

    return () => controller.abort();
  }, [client, chatIdKey, onMessage, onStatus]);

  return { isConnected, error };
}
