import { useCallback, useMemo, useState } from 'react';
import './App.css';
import { createGreenApiClient } from './api/greenApi';
import { readStoredCredentials, LoginForm } from './components/LoginForm/LoginForm';
import { MESSENGER, MESSENGER_LABEL } from './constants/messengers';
import { formatPhone, toChatId, PhoneSetup } from './components/PhoneSetup/PhoneSetup';
import { SendMessageComponent } from './components/SendMessageComponent/SendMessageComponent';
import { ViewMessageComponent } from './components/ViewMessageComponent/ViewMessageComponent';
import { ChatSidebar } from './components/ChatSidebar/ChatSidebar';
import { Avatar } from './components/Avatar/Avatar';
import { useGreenNotifications } from './hooks/useGreenNotifications';

function App() {
  const [credentials, setCredentials] = useState(() => readStoredCredentials());
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  const client = useMemo(() => {
    if (!credentials?.idInstance || !credentials?.apiTokenInstance) {
      return null;
    }

    return createGreenApiClient(credentials);
  }, [credentials]);

  const handleLogin = useCallback((nextCredentials) => {
    setCredentials({ ...nextCredentials, messenger: MESSENGER });
    setError('');
  }, []);

  const handleStartChat = useCallback(
    async (phone) => {
      if (!client) {
        throw new Error('Сначала подключите инстанс GREEN-API.');
      }

      const result = await client.checkWhatsapp(phone);

      if (!result.existsWhatsapp) {
        throw new Error(
          `Абонент с номером ${formatPhone(phone)} не зарегистрирован в ${MESSENGER_LABEL}.`,
        );
      }

      setChat({
        chatId: result.chatId || toChatId(phone),
        phoneChatId: toChatId(phone),
        lid: result.chatId ?? '',
        phone,
        title: formatPhone(phone),
      });
      setMessages([]);
      setError('');
    },
    [client],
  );

  const handleIncomingMessage = useCallback((message) => {
    setMessages((currentMessages) => {
      if (currentMessages.some((item) => item.id === message.id)) {
        return currentMessages;
      }

      return [...currentMessages, { ...message, direction: 'incoming' }];
    });

    if (message.chatName) {
      setChat((currentChat) =>
        currentChat && currentChat.phone
          ? { ...currentChat, title: message.chatName }
          : currentChat,
      );
    }
  }, []);

  const handleStatus = useCallback(({ id, status }) => {
    setMessages((currentMessages) =>
      currentMessages.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }, []);

  const chatIdentifiers = useMemo(
    () => (chat ? [chat.chatId, chat.lid, chat.phoneChatId].filter(Boolean) : []),
    [chat],
  );

  const { isConnected, error: pollError } = useGreenNotifications(client, chatIdentifiers, {
    onMessage: handleIncomingMessage,
    onStatus: handleStatus,
  });

  const handleSendMessage = useCallback(
    async (text) => {
      if (!client || !chat) {
        throw new Error('Сначала создайте чат.');
      }

      const result = await client.sendMessage(chat.chatId, text);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: result?.idMessage ?? `${Date.now()}`,
          chatId: chat.chatId,
          text,
          timestamp: Date.now(),
          direction: 'outgoing',
          status: '',
        },
      ]);
    },
    [client, chat],
  );

  const handleNewChat = () => {
    setChat(null);
    setMessages([]);
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('green-api-credentials');
    setCredentials(null);
    setChat(null);
    setMessages([]);
    setError('');
  };

  if (!client) {
    return (
      <main className="app app-plain">
        <LoginForm onLogin={handleLogin} onError={setError} />
        {error && <p className="app-error">{error}</p>}
      </main>
    );
  }

  if (!chat) {
    return (
      <main className="app app-plain">
        <PhoneSetup onStartChat={handleStartChat} onError={setError} />
        <button className="app-logout-button" type="button" onClick={handleLogout}>
          Выйти
        </button>
        {error && <p className="app-error">{error}</p>}
      </main>
    );
  }

  return (
    <main className="app">
      <ChatSidebar
        chat={chat}
        messages={messages}
        isConnected={isConnected}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
      />

      <section className="chat">
        <header className="chat-header">
          <Avatar name={chat.title} />

          <div className="chat-header-body">
            <h1>{chat.title}</h1>
            <p>{formatPhone(chat.phone)}</p>
          </div>

          <span
            className={`chat-header-status ${isConnected ? 'chat-header-status-online' : ''}`}
            title={isConnected ? 'Получение сообщений активно' : 'Ожидание ответа GREEN-API'}
          >
            {isConnected ? 'Получение активно' : 'Подключение…'}
          </span>

          <button className="chat-header-button" type="button" onClick={handleNewChat}>
            Новый чат
          </button>
          <button className="chat-header-button mobile-logout" type="button" onClick={handleLogout}>
            Выйти
          </button>
        </header>

        <ViewMessageComponent messages={messages} />

        {(error || pollError) && <p className="app-error">{error || pollError}</p>}

        <SendMessageComponent onSend={handleSendMessage} onError={setError} />
      </section>
    </main>
  );
}

export default App;
