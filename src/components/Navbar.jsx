import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/context";

const Navbar = () => {
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
    <div className="sm:flex hidden flex-row flex-wrap   justify-center sm:justify-end gap-4 items-center ">
      <Link
        to="/dashboard"
        className="link-border before:bg-white appear  font-SFProItalic text-white h-fit whitespace-nowrap w-fit text-md sm:text-lg py-1 px-2 rounded-lg transition-all "
      >
        Home
      </Link>
      <Link
        to="/dashboard/my-applications"
        className="link-border before:bg-white appear font-SFProItalic text-white h-fit whitespace-nowrap w-fit text-md sm:text-lg py-1 px-2 rounded-lg transition-all "
      >
        My applications
      </Link>
      <button
        onClick={onLogout}
        className="appear font-SFProItalic py-[0.15rem] bg-red-500 text-white h-fit whitespace-nowrap w-fit text-md sm:text-lg px-4 rounded-lg hover:bg-red-400 transition-all"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
