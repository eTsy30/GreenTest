import { useState } from 'react';
import PropTypes from 'prop-types';
import './PhoneSetup.css';
import { MESSENGER_LABEL } from '../../constants/messengers';

export function normalizePhone(value) {
  return value.replace(/\D/g, '');
}

export function isValidPhone(value) {
  const digits = normalizePhone(value);

  return digits.length >= 10 && digits.length <= 15;
}

export function toChatId(value) {
  return `${normalizePhone(value)}@c.us`;
}

export function formatPhone(value) {
  const digits = normalizePhone(value);

  if (digits.startsWith('375')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`;
  }

  if (digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }

  return value;
}

export function PhoneSetup({ onStartChat, onError }) {
  const [value, setValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const isValid = isValidPhone(value);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValid || isChecking) return;

    setIsChecking(true);
    onError('');

    try {
      await onStartChat(normalizePhone(value));
    } catch (error) {
      onError(error.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section className="new-chat-screen">
      <form className="new-chat-card" onSubmit={handleSubmit}>
        <h1 className="new-chat-title">Новый чат</h1>

        <p className="new-chat-subtitle">Введите номер получателя в международном формате</p>

        <input
          className="new-chat-input"
          type="tel"
          aria-label="Номер телефона получателя"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="+7 999 123-45-67"
          autoComplete="tel"
          required
        />

        <button className="new-chat-submit" type="submit" disabled={!isValid || isChecking}>
          {isChecking ? `Проверяем в ${MESSENGER_LABEL}...` : 'Создать чат'}
        </button>

        <p className="new-chat-hint">
          Получатель должен быть зарегистрирован в WhatsApp.
        </p>
      </form>
    </section>
  );
}

PhoneSetup.propTypes = {
  onStartChat: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};
