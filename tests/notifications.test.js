import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIncomingTextMessage } from '../src/api/notification.js';
import { pollNotifications } from '../src/api/pollNotifications.js';

const incoming = (messageData, chatId = '123@lid') => ({
  receiptId: 1,
  body: { typeWebhook: 'incomingMessageReceived', idMessage: 'msg1', timestamp: 1700000000,
    senderData: { chatId, senderName: 'Контакт' }, messageData },
});

test('parses ordinary and extended text, but ignores media and malformed events', () => {
  for (const messageData of [
    { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет' } },
    { typeMessage: 'extendedTextMessage', extendedTextMessageData: { text: 'Привет' } },
  ]) {
    const result = parseIncomingTextMessage(incoming(messageData));
    assert.equal(result.text, 'Привет');
    assert.equal(result.chatId, '123@lid');
    assert.equal(result.timestamp, 1700000000000);
  }
  assert.equal(parseIncomingTextMessage(incoming({ typeMessage: 'imageMessage' })), null);
  assert.equal(parseIncomingTextMessage(null), null);
  assert.equal(parseIncomingTextMessage(incoming({ typeMessage: 'textMessage' })), null);
});

test('configures restored sessions, handles LID and phone IDs, acknowledges all events in order', async () => {
  const controller = new AbortController();
  const calls = [];
  const messages = [];
  const statuses = [];
  const queue = [
    incoming({ typeMessage: 'extendedTextMessage', extendedTextMessageData: { text: 'Ответ' } }),
    { ...incoming({ typeMessage: 'textMessage', textMessageData: { textMessage: 'Телефон' } }, '7999@c.us'), receiptId: 2 },
    { ...incoming({ typeMessage: 'imageMessage' }), receiptId: 3 },
    { ...incoming({ typeMessage: 'textMessage', textMessageData: { textMessage: 'Другой чат' } }, 'other@lid'), receiptId: 4 },
    { receiptId: 5, body: { typeWebhook: 'outgoingMessageStatus', chatId: '123@lid', idMessage: 'out', status: 'read' } },
  ];
  await pollNotifications({
    client: {
      getSettings: async () => ({ incomingWebhook: 'no' }),
      setSettings: async () => { calls.push('settings'); return { saveSettings: true }; },
      receiveNotification: async () => {
        if (!queue.length) { controller.abort(); return null; }
        calls.push('receive'); return queue.shift();
      },
      deleteNotification: async (id) => { calls.push(`delete:${id}`); },
    },
    signal: controller.signal, identifiers: ['123@lid', '7999@c.us'],
    onMessage: (message) => messages.push(message), onStatus: (status) => statuses.push(status),
    onConnection: () => {},
  });
  assert.deepEqual(messages.map((message) => message.text), ['Ответ', 'Телефон']);
  assert.equal(statuses[0].status, 'read');
  assert.deepEqual(calls, ['settings', ...[1, 2, 3, 4, 5].flatMap((id) => ['receive', `delete:${id}`])]);
});

test('retries failed acknowledgements and clears connection errors after recovery', async () => {
  const controller = new AbortController();
  let deletes = 0;
  const connections = [];
  const ids = new Set();
  await pollNotifications({
    client: {
      getSettings: async () => ({ webhookUrl: '', incomingWebhook: 'yes', outgoingWebhook: 'yes' }),
      setSettings: async () => assert.fail('valid settings should not be changed'),
      receiveNotification: async () => incoming({ typeMessage: 'textMessage', textMessageData: { textMessage: 'Ответ' } }),
      deleteNotification: async () => { if (++deletes === 1) throw new Error('Network error'); },
    },
    signal: controller.signal, identifiers: ['123@lid'],
    onMessage: (message) => ids.add(message.id), onStatus: () => {},
    onConnection: (connected, error) => { connections.push([connected, error]); if (connected) controller.abort(); },
    retry: async () => {},
  });
  assert.equal(deletes, 2);
  assert.equal(ids.size, 1);
  assert.deepEqual(connections, [[false, 'Network error'], [true, '']]);
});

test('does not deliver or delete a response arriving after cancellation', async () => {
  const controller = new AbortController();
  await pollNotifications({
    client: {
      getSettings: async () => ({ webhookUrl: '', incomingWebhook: 'yes', outgoingWebhook: 'yes' }),
      receiveNotification: async () => { controller.abort(); return incoming({ typeMessage: 'textMessage', textMessageData: { textMessage: 'Late' } }); },
      deleteNotification: async () => assert.fail('must not acknowledge'),
    },
    signal: controller.signal, identifiers: ['123@lid'],
    onMessage: () => assert.fail('must not deliver'), onStatus: () => {},
    onConnection: () => assert.fail('must not update state'),
  });
});
