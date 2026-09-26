import PropTypes from 'prop-types';
import './ChatSidebar.css';
import { Avatar } from '../Avatar/Avatar';
import { MESSENGER_LABEL } from '../../constants/messengers';

const TIME_FORMAT = { hour: '2-digit', minute: '2-digit' };

function formatTime(timestamp) {
  if (!timestamp) return '';

  return new Date(timestamp).toLocaleTimeString('ru-RU', TIME_FORMAT);
}

export function ChatSidebar({ chat, messages, isConnected, onNewChat, onLogout }) {
  const lastMessage = messages[messages.length - 1];

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <span className="sidebar-logo">{MESSENGER_LABEL}</span>

        <button className="sidebar-icon-button" type="button" onClick={onLogout} title="Выйти">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h11"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="visually-hidden">Выйти</span>
        </button>
      </header>

      <button className="sidebar-new-chat" type="button" onClick={onNewChat}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Новый чат
      </button>

      <nav className="sidebar-list" aria-label="Список чатов">
        {chat && (
          <div className="sidebar-cell sidebar-cell-active">
            <Avatar name={chat.title} size="small" />

            <span className="sidebar-cell-body">
              <span className="sidebar-cell-title">
                {chat.title}
                <span className="sidebar-cell-time">{formatTime(lastMessage?.timestamp)}</span>
              </span>

              <span className="sidebar-cell-subtitle">
                {lastMessage
                  ? `${lastMessage.direction === 'outgoing' ? 'Вы: ' : ''}${lastMessage.text}`
                  : 'Нет сообщений'}
              </span>
            </span>
          </div>
        )}
      </nav>

      <footer className="sidebar-footer">
        <span className={`sidebar-status ${isConnected ? 'sidebar-status-online' : ''}`}>
          {isConnected ? 'Подключено' : 'Ожидание ответа GREEN-API'}
        </span>
      </footer>
    </aside>
  );
}

ChatSidebar.propTypes = {
  chat: PropTypes.shape({
    chatId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      timestamp: PropTypes.number,
      direction: PropTypes.string.isRequired,
    }),
  ).isRequired,
  isConnected: PropTypes.bool.isRequired,
  onNewChat: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};
