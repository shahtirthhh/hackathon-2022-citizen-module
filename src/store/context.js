import React, { useState } from "react";

export const Context = React.createContext({
  socket: null,
  setSocket: (socket) => {},

  notification: { color: null, data: null },
  setNotification: ({ visible, color, data, loading = false }) => {},

  modal: {
    title: "",
    type: "loading",
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
    onCancel: () => {},
    isOpen: false,
  },
  setModal: (
    title,
    type,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    isOpen
  ) => {},

  token: "",
  setToken: (token) => {},

  user: {},
  setUser: (user) => {},
});
// eslint-disable-next-line
export default (props) => {
  const [socketValue, setSocketValue] = useState(null);

  const [notificationValue, setNotificationValue] = useState({
    color: "null",
    data: "null",
    visible: false,
    loading: false,
  });
  const [modalValue, setModalValue] = useState({
    title: "",
    type: "loading",
    message: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => {},
    onCancel: () => {},
    isOpen: false,
  });
  const storedToken = localStorage.getItem("access-token");
  const [tokenValue, setTokenValue] = useState(storedToken || "");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [userValue, setUserValue] = useState(storedUser || "");

  return (
    <Context.Provider
      value={{
        socket: socketValue,
        notification: notificationValue,

        setSocket: setSocketValue,
        setNotification: setNotificationValue,

        modal: modalValue,
        setModal: setModalValue,

        token: tokenValue,
        setToken: setTokenValue,

        user: userValue,
        setUser: setUserValue,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};
