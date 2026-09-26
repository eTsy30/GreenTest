import { useState } from 'react';
import PropTypes from 'prop-types';
import './SendMessageComponent.css';

const MAX_LENGTH = 4000;

export const SendMessageComponent = ({ onSend, onError }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const text = message.trim();

    if (!text || isSending) return;

    setIsSending(true);
    onError('');

    try {
      await onSend(text);
      setMessage('');
    } catch (error) {
      onError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form className="message-box" onSubmit={handleSubmit}>
      <input
        className="message-input"
        type="text"
        aria-label="Текст сообщения"
        value={message}
        maxLength={MAX_LENGTH}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Введите сообщение..."
        disabled={isSending}
      />

      <button
        className="message-submit"
        type="submit"
        disabled={!message.trim() || isSending}
        aria-label="Отправить"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M4 12 20 4l-6 16-2.5-6.5L4 12Z" fill="currentColor" />
        </svg>
      </button>
    </form>
  );
};

SendMessageComponent.propTypes = {
  onSend: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};
