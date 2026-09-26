import { useState } from 'react';
import PropTypes from 'prop-types';
import './LoginForm.css';
import { createGreenApiClient } from '../../api/greenApi';
import { MESSENGER, INSTANCE_STATES } from '../../constants/messengers';

const STORAGE_KEY = 'green-api-credentials';

export function readStoredCredentials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    const value = raw ? JSON.parse(raw) : null;
    return typeof value?.idInstance === 'string' && value.idInstance.trim()
      && typeof value?.apiTokenInstance === 'string' && value.apiTokenInstance.trim()
      ? value
      : null;
  } catch {
    return null;
  }
}

export function LoginForm({ onLogin, onError }) {
  const [stored] = useState(readStoredCredentials);

  const [idInstance, setIdInstance] = useState(stored?.idInstance ?? '');
  const [apiTokenInstance, setApiTokenInstance] = useState(stored?.apiTokenInstance ?? '');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const credentials = {
      messenger: MESSENGER,
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    };

    if (!credentials.idInstance || !credentials.apiTokenInstance) {
      onError('Заполните оба поля.');
      return;
    }

    setIsChecking(true);
    onError('');

    try {
      const client = createGreenApiClient(credentials);
      const { stateInstance } = await client.getStateInstance();

      if (stateInstance !== 'authorized') {
        onError(
          `Инстанс ${INSTANCE_STATES[stateInstance] ?? stateInstance}. Авторизуйте его в личном кабинете GREEN-API.`,
        );

        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
      onLogin(credentials);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="auth-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.1 14.9l-.4-.2-2.6.7.7-2.5-.2-.4A8 8 0 0 1 12 4Zm-3 4c-.2 0-.5 0-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 2 .8 2.5.7 3 .6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3-1.5-.7c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4Z"
              fill="currentColor"
            />
          </svg>
        </span>

        <h1 className="auth-title">Подключение GREEN-API</h1>

        <p className="auth-subtitle">
          Введите учётные данные инстанса WhatsApp из личного кабинета GREEN-API
        </p>

        <label className="auth-field">
          <span>idInstance</span>
          <input
            type="text"
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            placeholder="1101828142"
            autoComplete="username"
            required
          />
        </label>

        <label className="auth-field">
          <span>apiTokenInstance</span>
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button className="auth-submit" type="submit" disabled={isChecking}>
          {isChecking ? 'Проверяем инстанс...' : 'Подключиться'}
        </button>
      </form>
    </section>
  );
}

LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};
