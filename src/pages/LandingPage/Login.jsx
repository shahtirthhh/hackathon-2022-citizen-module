import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import LoggingIn from "../../components/LoggingIn";

import validators from "../../utils/validators";
import { Context } from "../../store/context";
import { verify_token } from "../../utils/api";

const Login = () => {
  const setTokenContext = useContext(Context).setToken;
  const tokenContext = useContext(Context).token;
  const setUserContext = useContext(Context).setUser;
  const navigate = useNavigate();
  const [verifing, setVerifing] = useState(true);
  const auth_token = async (token) => {
    const response = await verify_token(token);
    if (response.error) {
      setVerifing(false);
      return;
    } else {
      const { data } = response;
      if (!data.error) {
        setUserContext(data.data);
        navigate("/dashboard");
      }
    }
  };
  useEffect(() => {
    auth_token(tokenContext);
  }, [tokenContext]);
  const setNotificationContext = useContext(Context).setNotification;

  const emailRef = useRef();
  const passwordRef = useRef();
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setLoading] = useState(false);

  const login_user = async () => {
    const password = passwordRef.current.value;
    const email = emailRef.current.value;
    setValidationErrors({});
    if (!password || !validators.password_validator(password))
      setValidationErrors((err) => ({
        ...err,
        password: "Invalid password format",
      }));
    if (!email || !validators.email_validator(email))
      setValidationErrors((err) => ({
        ...err,
        email: "Invalid email",
      }));
    else {
      setLoading(true);
      try {
        const response = await axios.post(
          process.env.REACT_APP_REST_API + "/citizen/login-citizen",
          {
            email,
            password,
          }
        );
        const { data } = response;
        setLoading(false);
        if (!data.error) {
          setNotificationContext({
            visible: true,
            color: "green",
            data: data.message,
          });

          setTokenContext(data.data.token);
          setUserContext(data.data.citizen);
          localStorage.setItem("access-token", data.data.token);
          localStorage.setItem("user", JSON.stringify(data.data.citizen));
          navigate("/dashboard");
        } else {
          setNotificationContext({
            visible: true,
            color: "red",
            data: data.message,
          });
        }
      } catch (error) {
        setLoading(false);
        setNotificationContext({
          visible: true,
          color: "red",
          data: error.response
            ? error.response.data.message
            : "Network error !",
        });
      }
    }
  };

  if (verifing) {
    return <LoggingIn />;
  }

  return (
    <main className="flex flex-col mb-16">
      {/* Hero Section */}
      <div className="flex sm:flex-row flex-col gap-4 p-4 items-left justify-between bg-gradient-to-r from-blue-400 to-purple-600 text-white py-8">
        <div className="flex flex-col gap-4">
          <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
            Login
          </h1>
          <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
            Way to paperless and contactless approach !
          </p>
        </div>

        <div className="flex flex-row justify-end gap-4">
          <Link
            to="/register"
            className="appear font-SFProItalic bg-white text-blue-500 h-fit whitespace-nowrap w-fit text-sm py-1 px-2 rounded-lg hover:bg-gray-200"
          >
            Register here
          </Link>
        </div>
      </div>
      <div className="flex flex-col  items-center p-8 gap-7">
        <h1 className="appear font-SFProItalic text-2xl font-bold text-blue-500">
          Login with registered email address
        </h1>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            {/* Enter email */}
            <input
              ref={emailRef}
              type="email"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all ${
                validationErrors.email ? "border-2 border-red-400" : ""
              }`}
              placeholder="Email"
            />
            {validationErrors.email && (
              <p className="appear font-primary font-semibold text-red-400">
                {validationErrors.email}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {/* Enter password */}
            <input
              ref={passwordRef}
              type="password"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                validationErrors.password ? "border-2 border-red-400" : ""
              }`}
              placeholder="Password"
            />
            {validationErrors.password && (
              <p className="appear font-primary font-semibold text-red-400">
                {validationErrors.password}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={login_user}
          disabled={isLoading}
          className="appear bg-blue-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-blue-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
        >
          {isLoading ? (
            <div className="flex flex-row gap-3 items-center">
              <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
              <p className="font-primary font-medium text-neutral-700">
                Please wait...
              </p>
            </div>
          ) : (
            "Login"
          )}
        </button>
      </div>
    </main>
  );
};

export default Login;
