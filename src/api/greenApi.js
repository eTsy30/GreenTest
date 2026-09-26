import axios from 'axios';

const API_URL = import.meta.env?.VITE_API_HOST || 'https://api.green-api.com';
const RECEIVE_TIMEOUT_SECONDS = 25;

export function getErrorMessage(error) {
  const data = error?.response?.data;

  if (error?.response?.status === 466) {
    const chats = data?.correspondentsStatus;
    const invoke = data?.invokeStatus;
    const quota = (value) => value?.used != null && value?.total != null
      ? ` (${value.used} из ${value.total})`
      : '';

    if (chats?.status === 'CORRESPONDENTS_QUOTE_EXCEEDED' || chats?.status === 'QUOTE_EXCEEDED') {
      return `GREEN-API: превышен месячный лимит чатов${quota(chats)} (466). Используйте уже разрешённый тарифом чат или проверьте тариф в личном кабинете GREEN-API.`;
    }

    if (invoke?.status === 'QUOTE_EXCEEDED') {
      return `GREEN-API: превышен месячный лимит запросов${quota(invoke)} (466). Проверьте лимиты в личном кабинете GREEN-API; дождитесь обновления квоты или измените тариф.`;
    }

    return 'GREEN-API: превышены лимиты тарифа (466). Проверьте лимит чатов и запросов в личном кабинете GREEN-API. Подробности — в ответе API (Response).';
  }

  if (typeof data === 'string' && data) {
    return data;
  }

  if (data && typeof data === 'object') {
    const message = data.message ?? data.reason ?? data.error;

    if (typeof message === 'string' && message) {
      return message;
    }
  }

  const { status, statusText } = error?.response ?? {};

  if (status === 401) {
    return 'GREEN-API отклонил apiTokenInstance. Проверьте idInstance и apiTokenInstance.';
  }

  if (status === 404) {
    return 'GREEN-API не нашёл инстанс с такими учётными данными.';
  }

  if (status) {
    return `Ошибка GREEN-API: ${status}${statusText ? ` ${statusText}` : ''}`;
  }

  return error?.message || 'Не удалось выполнить запрос к GREEN-API';
}

async function request(config) {
  try {
    const { data } = await axios.request({ timeout: 20000, ...config });

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export function createGreenApiClient({ idInstance, apiTokenInstance, messenger }) {
  const baseURL = `${API_URL}/waInstance${idInstance}`;

  const getStateInstance = () =>
    request({ method: 'GET', url: `${baseURL}/getStateInstance/${apiTokenInstance}` });

  const checkWhatsapp = (phoneNumber) =>
    request({
      method: 'POST',
      url: `${baseURL}/checkWhatsapp/${apiTokenInstance}`,
      data: { phoneNumber: Number(phoneNumber) },
    });

  const sendMessage = (chatId, message) =>
    request({
      method: 'POST',
      url: `${baseURL}/sendMessage/${apiTokenInstance}`,
      data: { chatId, message },
    });

  const getSettings = (signal) =>
    request({ method: 'GET', url: `${baseURL}/getSettings/${apiTokenInstance}`, signal });

  const setSettings = (signal) =>
    request({
      method: 'POST',
      url: `${baseURL}/setSettings/${apiTokenInstance}`,
      signal,
      data: {
        webhookUrl: '',
        incomingWebhook: 'yes',
        outgoingWebhook: 'yes',
      },
    });

  const receiveNotification = (signal) =>
    request({
      method: 'GET',
      url: `${baseURL}/receiveNotification/${apiTokenInstance}`,
      params: { receiveTimeout: RECEIVE_TIMEOUT_SECONDS },
      timeout: (RECEIVE_TIMEOUT_SECONDS + 15) * 1000,
      signal,
    });

  const deleteNotification = (receiptId, signal) =>
    request({
      method: 'DELETE',
      url: `${baseURL}/deleteNotification/${apiTokenInstance}/${receiptId}`,
      signal,
    });

  return {
    messenger,
    getStateInstance,
    checkWhatsapp,
    sendMessage,
    getSettings,
    setSettings,
    receiveNotification,
    deleteNotification,
  };
}
