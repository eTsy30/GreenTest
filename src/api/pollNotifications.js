import { parseIncomingTextMessage, parseOutgoingMessageStatus } from './notification.js';

function waitForRetry(signal) {
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      resolve();
    };
    const timer = setTimeout(finish, 3000);
    signal.addEventListener('abort', finish, { once: true });
    if (signal.aborted) finish();
  });
}

export async function pollNotifications({
  client,
  identifiers,
  signal,
  onMessage,
  onStatus,
  onConnection,
  retry = waitForRetry,
}) {
  let settingsReady = false;

  while (!signal.aborted) {
    try {
      if (!settingsReady) {
        const settings = await client.getSettings(signal);
        if (signal.aborted) return;
        if (settings.webhookUrl || settings.incomingWebhook !== 'yes' || settings.outgoingWebhook !== 'yes') {
          const result = await client.setSettings(signal);
          if (!result?.saveSettings) throw new Error('Не удалось включить уведомления GREEN-API.');
        }
        settingsReady = true;
      }
      if (signal.aborted) return;
      const notification = await client.receiveNotification(signal);
      if (signal.aborted) return;

      if (notification?.receiptId != null) {
        const message = parseIncomingTextMessage(notification);
        const status = parseOutgoingMessageStatus(notification);
        if (message && identifiers.includes(message.chatId)) onMessage(message);
        if (status && identifiers.includes(status.chatId)) onStatus(status);
        await client.deleteNotification(notification.receiptId, signal);
      }
      if (!signal.aborted) onConnection(true, '');
    } catch (error) {
      if (signal.aborted) return;
      onConnection(false, error.message);
      await retry(signal);
    }
  }
}
