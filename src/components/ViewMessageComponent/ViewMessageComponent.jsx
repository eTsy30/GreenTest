import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './ViewMessageComponent.css';

const TIME_FORMAT = { hour: '2-digit', minute: '2-digit' };

const STATUS_LABELS = {
  delivered: 'Доставлено',
  read: 'Прочитано',
  failed: 'Ошибка отправки',
  noAccount: 'Аккаунт получателя не найден',
  notInGroup: 'Отправитель не в группе',
};

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('ru-RU', TIME_FORMAT);
}

export function ViewMessageComponent({ messages }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

  if (!messages.length) {
    return (
      <div className="message-list" ref={containerRef}>
        <p className="message-empty">
          Сообщений пока нет. Напишите первое сообщение в чат.
        </p>
      </div>
    );
  }

  return (
    <div className="message-list" ref={containerRef}>
      {messages.map((message) => {
        const isOutgoing = message.direction === 'outgoing';

        return (
          <div
            key={message.id}
            className={`message ${isOutgoing ? 'message-outgoing' : 'message-incoming'}`}
          >
            <span className="message-text">{message.text}</span>

            <span className="message-meta">
              <span className="message-time">{formatTime(message.timestamp)}</span>

              {isOutgoing && (
                <span
                  className={`message-status ${message.status ? `message-status-${message.status}` : ''}`}
                  title={STATUS_LABELS[message.status] ?? 'Отправлено'}
                >
                  {['failed', 'noAccount', 'notInGroup'].includes(message.status)
                    ? '!'
                    : message.status === 'read' || message.status === 'delivered' ? '✓✓' : '✓'}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

ViewMessageComponent.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      timestamp: PropTypes.number.isRequired,
      direction: PropTypes.oneOf(['incoming', 'outgoing']).isRequired,
      status: PropTypes.string,
    }),
  ).isRequired,
};
