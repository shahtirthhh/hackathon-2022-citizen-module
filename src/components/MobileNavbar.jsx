import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/context";

const MobileNavbar = () => {
  const setTokenContext = useContext(Context).setToken;
  const setUserContext = useContext(Context).setUser;
  const setModalContext = useContext(Context).setModal;
  const navigate = useNavigate();
  const onLogout = () => {
    setModalContext({
      title: "Logout ?",
      type: "delete",
      message: "You have to login again once logged out !",
      confirmText: "Logout 👋🏻",
      cancelText: "Cancel",
      onConfirm: logoutConfirm,
      onCancel: logoutCancel,
      isOpen: true,
    });
  };
  const logoutCancel = () => {
    setModalContext({
      onConfirm: () => {},
      onCancel: () => {},
      isOpen: false,
    });
  };
  const logoutConfirm = () => {
    setModalContext({
      title: "Logout ?",
      type: "loading",
      message: "You have to login again once logged out !",
      confirmText: "Logging out...",
      cancelText: "Cancel",
      onConfirm: logoutConfirm,
      onCancel: logoutCancel,
      isOpen: true,
    });
    setTimeout(() => {
      setTokenContext(undefined);
      setUserContext(undefined);
      localStorage.removeItem("access-token");
      localStorage.removeItem("user");
      setModalContext({
        isOpen: false,
      });
      navigate("/");
    }, 2000);
  };

  return (
    <div className=" sm:hidden flex flex-row flex-wrap w-full bg-secondary shadow-sm justify-center sm:justify-end gap-4 items-center ">
      <Link
        to="/dashboard"
        className="link-border appear font-SFProItalic text-neutral-600 h-fit whitespace-nowrap w-fit xs:text-[0.925rem] text-xs xs:text-md py-1 px-2 rounded-lg transition-all "
      >
        Home
      </Link>
      <Link
        to="/dashboard/my-applications"
        className="link-border appear font-SFProItalic text-neutral-600 h-fit whitespace-nowrap w-fit xs:text-[0.925rem] text-xs xs:text-md py-1 px-2 rounded-lg transition-all "
      >
        My applications
      </Link>
      <button
        onClick={onLogout}
        className="appear font-SFProItalic py-[0.15rem]  text-red-500 h-fit whitespace-nowrap w-fit  xs:text-[0.925rem] text-xs px-4 rounded-lg  transition-all"
      >
        Logout
      </button>
    </div>
  );
};

export default MobileNavbar;
