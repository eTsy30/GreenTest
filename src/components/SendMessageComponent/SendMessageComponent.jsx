import React, { useState } from 'react';
import './SendMessageComponent.css';
import axios from 'axios';

export const SendMessageComponent = () => {
  const [message, setMessage] = useState();
  const [phone, sePhone] = useState();
  async function handleSubmit() {
    await axios.post(
      ` ${import.meta.env.VITE_API_HOST}/waInstance${import.meta.env.VITE_API_IDINSTANCE}/sendMessage/${
        import.meta.env.VITE_API_APITOKENINSTANCE
      }`,
      {
        chatId: `${phone}@c.us`,
        message: message,
      },
    );
    setMessage('');
    sePhone('');
  }
  document.onkeydown = function (evt) {
    if (evt.keyCode == 13) {
      handleSubmit();
    }
  };

  return (
    <form className="message-box">
      <input
        placeholder="enter phone with code..."
        type="tel"
        value={phone}
        maxlength="14"
        required
        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
        className="message-phone"
        onChange={(e) => {
          sePhone(e.target.value);
        }}
      />
      <input
        placeholder="enter your message..."
        type="text"
        value={message}
        className="message-input"
        onChange={(e) => {
          setMessage(e.target.value);
        }}
      />

      <button className="message-submit" disabled={message ? false : true} onClick={handleSubmit}>
        Send
      </button>
    </form>
  );
};
