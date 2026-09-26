# GREEN-API Chat

Тестовое задание: чат на React для отправки и получения текстовых сообщений WhatsApp через GREEN-API.

## Локальный запуск

1. Установите Node.js 22.12+ и Git.
2. Скачайте проект и запустите:

```bash
git clone https://github.com/eTsy30/GreenTest.git
cd GreenTest
npm ci
npm run dev
```

3. Откройте адрес из терминала (обычно http://localhost:5173).
4. Введите `idInstance` и `apiTokenInstance` авторизованного инстанса WhatsApp из личного кабинета GREEN-API.
5. Введите номер получателя в международном формате, создайте чат и отправьте сообщение. Ответьте с телефона получателя — ответ появится в чате.

Приложение автоматически включает HTTP-уведомления и очищает webhook URL инстанса. Для остановки сервера нажмите `Ctrl+C` в терминале.

Проверки: `npm test`, `npm run lint`. Сборка: `npm run build`.

Telegram: [@Evgen3900033](https://t.me/Evgen3900033)
