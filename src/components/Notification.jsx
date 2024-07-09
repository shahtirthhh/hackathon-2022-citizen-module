import { Context } from "../store/context";
import React, { useContext, useEffect } from "react";

export default function Notification() {
  const { notification, setNotification } = useContext(Context);

  useEffect(() => {
    let timeout;
    if (!notification.loading && notification.visible) {
      timeout = setTimeout(() => {
        setNotification({
          ...notification,
          visible: false,
        });
      }, 7000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [notification, setNotification]);

  return (
    <div
      id="notification"
      className={`notification fixed right-0 z-50  w-full h-fit pl-4 pt-1 ${
        notification.visible ? "top-0" : "-top-32"
      } transition-all duration-700 ease-in-out  ${
        notification.color === "red"
          ? "bg-red-500 shadow-red-400"
          : notification.color === "blue"
          ? "bg-blue-500 shadow-sky-400"
          : notification.color === "green"
          ? "bg-green-500 shadow-green-400"
          : "bg-yellow-200 shadow-yellow-200"
      }`}
    >
      <h2
        className={`text-lg text-center  font-SFProItalic [word-spacing:0.2rem] tracking-wide ${
          notification.color === "blue"
            ? "text-zinc-100"
            : notification.color === "green"
            ? "text-neutral-700"
            : notification.color === "red"
            ? "text-zinc-100"
            : "text-neutral-700"
        }`}
      >
        {notification.color === "blue" ? (
          <div className="appear flex gap-3 items-center justify-center">
            <div className="spinner border-2 border-white w-3 h-3"></div>
            <p className="font-SFProItalic text-white">{notification.data}</p>
          </div>
        ) : (
          notification.data
        )}
      </h2>
    </div>
  );
}
