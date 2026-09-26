export function parseIncomingTextMessage(notification) {
  if (!notification?.body) return null;

  const { typeWebhook, messageData, senderData, timestamp, idMessage } = notification.body;

  if (typeWebhook !== 'incomingMessageReceived' || !messageData) {
    return null;
  }

  const text =
    messageData.typeMessage === 'textMessage'
      ? messageData.textMessageData?.textMessage
      : messageData.typeMessage === 'extendedTextMessage'
        ? messageData.extendedTextMessageData?.text
        : null;

  if (typeof text !== 'string' || !text || !senderData?.chatId || !idMessage) {
    return null;
  }

  return {
    id: idMessage,
    chatId: senderData.chatId,
    chatName: senderData.chatName || senderData.senderName || '',
    text,
    timestamp: Number(timestamp) * 1000 || Date.now(),
  };
}

export function parseOutgoingMessageStatus(notification) {
  const { typeWebhook, chatId, idMessage, status } = notification?.body ?? {};

  if (typeWebhook !== 'outgoingMessageStatus' || !idMessage || !status) {
    return null;
  }

  return {
    id: idMessage,
    chatId: chatId ?? '',
    status,
    error: notification.body?.description ?? '',
  };
}
