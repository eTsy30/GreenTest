import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { createGreenApiClient, getErrorMessage } from '../src/api/greenApi.js';

test('466 distinguishes chat quotas, method quotas and missing response bodies', () => {
  const error = (data) => ({ response: { status: 466, data } });
  assert.match(getErrorMessage(error({
    invokeStatus: { status: 'QUOTE_ALLOWED' },
    correspondentsStatus: { status: 'CORRESPONDENTS_QUOTE_EXCEEDED', used: 3, total: 3 },
  })), /лимит чатов \(3 из 3\)/);
  assert.match(getErrorMessage(error({
    invokeStatus: { status: 'QUOTE_EXCEEDED', used: 100, total: 100 },
  })), /лимит запросов \(100 из 100\)/);
  assert.match(getErrorMessage(error(null)), /превышены лимиты тарифа/);
});

test('sendMessage surfaces quota errors without retrying or switching recipient IDs', async () => {
  const original = axios.request;
  let calls = 0;
  axios.request = async (config) => {
    calls++;
    assert.deepEqual(config.data, { chatId: '123@lid', message: 'Тест' });
    throw { response: { status: 466, data: {
      correspondentsStatus: { status: 'CORRESPONDENTS_QUOTE_EXCEEDED', used: 3, total: 3 },
    } } };
  };
  try {
    const client = createGreenApiClient({ idInstance: 'test', apiTokenInstance: 'test' });
    await assert.rejects(client.sendMessage('123@lid', 'Тест'), /лимит чатов/);
    assert.equal(calls, 1);
  } finally {
    axios.request = original;
  }
});
