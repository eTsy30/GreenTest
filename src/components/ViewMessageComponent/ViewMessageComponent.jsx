import React, { useEffect, useState } from 'react';
import './ViewMessageComponent.css';
import axios from 'axios';
export const ViewMessageComponent = () => {
  const [message, setMessage] = useState([]);
  useEffect(() => {
    timerReload();
  });
  const isIncludeMessage = (id, message) => {
    return message.find((ObjArray) => ObjArray.id === id);
  };
  const timerReload = () => {
    const timer = setInterval(async () => {
      axios
        .get(
          `${import.meta.env.VITE_API_HOST}/waInstance${import.meta.env.VITE_API_IDINSTANCE}/receiveNotification/${
            import.meta.env.VITE_API_APITOKENINSTANCE
          }`,
        )
        .then((response) => {
          if (response?.data?.body?.messageData) {
            setMessage((prew) => [
              ...prew,
              ...(isIncludeMessage(response?.data?.receiptId, prew)
                ? []
                : [
                    {
                      id: response?.data?.receiptId,
                      text: response?.data?.body?.messageData?.extendedTextMessageData?.text,
                    },
                  ]),
            ]);
          }
          return response?.data?.receiptId;
        })
        .then((id) => {
          if (!id) {
            timerReload();
            return;
          }
          return axios
            .delete(
              `${import.meta.env.VITE_API_HOST}/waInstance${import.meta.env.VITE_API_IDINSTANCE}/deleteNotification/${
                import.meta.env.VITE_API_APITOKENINSTANCE
              }/${id}`,
            )
            .then((response) => {
              timerReload;
            });
        });
    }, 5000);
    return () => clearInterval(timer);
  };

  return (
    <div className="container_ViewMessageComponent">
      {message.length > 0 &&
        message.map((m, index) => (
          <div key={index + Math.random() * 1000} className="message ">
            {m.text}
          </div>
        ))}
    </div>
  );
};
