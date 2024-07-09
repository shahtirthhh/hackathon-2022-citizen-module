import React, { useContext, useReducer, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { aadhar_validator, password_validator } from "../../utils/validators";
import { generate_aadhar_otp, verify_aadhar_otp } from "../../utils/api";

import { Context } from "../../store/context";
import axios from "axios";

const initialState = {
  aadhar: {
    value: "",
    isError: false,
    error: "",
    isVerified: false,
    isLoading: false,
  },
  otp: {
    value: undefined,
    isError: false,
    error: "",
    isVerified: false,
    isLoading: false,
  },
  password: {
    value: undefined,
    isError: false,
    error: "",
    isVerified: false,
    isLoading: false,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: {
          ...state[action.field],
          value: action.value,
          error: action.error || "",
          isError: action.isError,
        },
      };
    case "SET_VERIFIED":
      return {
        ...state,
        [action.field]: {
          ...state[action.field],
          isVerified: true,
          error: "",
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        [action.field]: {
          ...state[action.field],
          error: action.error,
          isError: action.isError,
        },
      };
    case "SET_LOADING":
      return {
        ...state,
        [action.field]: {
          ...state[action.field],
          isLoading: action.isLoading,
        },
      };
    default:
      return state;
  }
}
const Register = () => {
  const navigate = useNavigate();
  const setNotificationContext = useContext(Context).setNotification;
  const setModalContext = useContext(Context).setModal;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [aadharUser, setAadharUser] = useState("");

  const aadharRef = useRef();
  const enteredOTPRef = useRef();
  const passwordRef = useRef();

  const verify_aadhar = async () => {
    dispatch({
      type: "SET_ERROR",
      field: "aadhar",
      isError: false,
      error: "",
    });
    if (!aadhar_validator(aadharRef.current.value)) {
      dispatch({
        type: "SET_ERROR",
        field: "aadhar",
        isError: true,
        error: "Invalid aadhar number",
      });
    } else {
      dispatch({
        type: "SET_LOADING",
        field: "aadhar",
        isLoading: true,
      });
      try {
        const response = await generate_aadhar_otp(aadharRef.current.value);
        dispatch({
          type: "SET_LOADING",
          field: "aadhar",
          isLoading: false,
        });
        if (response.error) throw response;
        dispatch({
          type: "SET_FIELD",
          field: "aadhar",
          isError: false,
          value: aadharRef.current.value,
        });
        dispatch({
          type: "SET_FIELD",
          field: "otp",
          isError: false,
          value: "NaN",
        });
        setNotificationContext({
          visible: true,
          color: "yellow",
          data: response.data.message,
        });
      } catch (error) {
        setNotificationContext({
          visible: true,
          color: "red",
          data: error.message,
        });
      }
    }
  };
  const verify_otp = async () => {
    const otp = enteredOTPRef.current.value;
    if (!otp || !/^\d{4}$/.test(otp))
      setNotificationContext({
        visible: true,
        color: "red",
        data: "Please enter 4 digit OTP",
      });
    else {
      dispatch({
        type: "SET_LOADING",
        field: "otp",
        isLoading: true,
      });

      try {
        const response = await verify_aadhar_otp(state.aadhar.value, otp);

        dispatch({
          type: "SET_LOADING",
          field: "otp",
          isLoading: false,
        });

        if (response.error) throw response;
        dispatch({
          type: "SET_VERIFIED",
          field: "otp",
        });
        setAadharUser(response.data.data.fullName.fullName);
        dispatch({
          type: "SET_VERIFIED",
          field: "aadhar",
        });
        setNotificationContext({
          visible: true,
          color: "green",
          data: response.data.message,
        });
      } catch (error) {
        setNotificationContext({
          visible: true,
          color: "red",
          data: error.message,
        });
      }
    }
  };

  const register_new_user = async () => {
    setModalContext({
      title: "Registration ?",
      type: "loading",
      message: `New account will be registered with ${state.aadhar.value}`,
      confirmText: "Registering...",
      cancelText: "Cancel",
      isOpen: true,
    });
    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/citizen/register-citizen",
        {
          aadhar: state.aadhar.value,
          fullName: aadharUser,
          password: passwordRef.current.value,
        }
      );
      setModalContext({
        isOpen: false,
      });
      const { data } = response;
      if (!data.error) {
        setNotificationContext({
          visible: true,
          color: "green",
          data: data.message,
        });
        navigate("/login");
      } else {
        setNotificationContext({
          visible: true,
          color: "red",
          data: data.message,
        });
      }
    } catch (error) {
      setModalContext({
        isOpen: false,
      });
      setNotificationContext({
        visible: true,
        color: "red",
        data: error.response ? error.response.data.message : "Network error !",
      });
    }
  };
  const cancel_registration_process = async () => {
    setModalContext({
      title: "Registration ?",
      type: "confirm",
      message: `Confirm to register with ${state.aadhar.value}`,
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: () => {},
      onCancel: () => {},
      isOpen: false,
    });
  };
  const registerClickHandler = () => {
    dispatch({
      type: "SET_ERROR",
      field: "password",
      isError: false,
      error: "",
    });
    if (!password_validator(passwordRef.current.value)) {
      dispatch({
        type: "SET_ERROR",
        field: "password",
        isError: true,
        error: "Invalid password !",
      });
      return;
    }
    setModalContext({
      title: "Registration ?",
      type: "confirm",
      message: `New account will be registered with ${state.aadhar.value}`,
      confirmText: "Confirm 👌🏻",
      cancelText: "Cancel",
      onConfirm: register_new_user,
      onCancel: cancel_registration_process,
      isOpen: true,
    });
  };
  return (
    <main className="flex flex-col mb-16">
      {/* Hero Section */}
      <div className="flex sm:flex-row flex-col gap-4 p-4 items-left justify-between bg-gradient-to-r from-blue-400 to-purple-600 text-white py-8">
        <div className="flex flex-col gap-4">
          <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
            Registration
          </h1>
          <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
            All you need is an aadhar number to continue...
          </p>
        </div>

        <div className="flex flex-row justify-end gap-4">
          <Link
            to="/login"
            className="appear font-SFProItalic bg-white text-blue-500 h-fit whitespace-nowrap w-fit text-sm py-1 px-2 rounded-lg hover:bg-gray-200"
          >
            Login instead
          </Link>
        </div>
      </div>

      {/* Registration Form */}
      <div className="flex flex-col  items-center p-8">
        {!state.aadhar.isVerified && (
          <div className="flex flex-col gap-6">
            <h1 className="appear font-SFProItalic font-bold text-blue-500">
              Let's get started with aadhar verification
            </h1>
            <div className="flex flex-col gap-4">
              {/* Enter aadhar number */}
              <div className="flex flex-wrap gap-4">
                <input
                  ref={aadharRef}
                  type="number"
                  inputMode="numeric"
                  className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    state.aadhar.isError ? "border-2 border-red-400" : ""
                  }`}
                  placeholder="aadhar number"
                />
                <button
                  onClick={verify_aadhar}
                  disabled={state.aadhar.isLoading}
                  className="appear bg-blue-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-blue-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                >
                  {state.aadhar.isLoading ? (
                    <div className="flex flex-row gap-3 items-center">
                      <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                      <p className="font-primary font-medium text-neutral-700">
                        Please wait...
                      </p>
                    </div>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
              {state.aadhar.isError && (
                <p className="font-primary font-semibold text-red-400">
                  {state.aadhar.error}
                </p>
              )}
              {/* Enter OTP */}
              {state.otp.value && !state.aadhar.isVerified && (
                <div className="flex flex-wrap gap-4">
                  <input
                    ref={enteredOTPRef}
                    type="number"
                    max={4}
                    inputMode="numeric"
                    className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                      state.otp.isError ? "border-2 border-red-400" : ""
                    }`}
                    placeholder="4 digit OTP"
                  />
                  <button
                    onClick={verify_otp}
                    disabled={state.otp.isLoading}
                    className="appear bg-emerald-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-emerald-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                  >
                    {state.otp.isLoading ? (
                      <div className="flex flex-row gap-3 items-center">
                        <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                        <p className="font-primary font-medium text-neutral-700">
                          Verifing...
                        </p>
                      </div>
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {state.aadhar.isVerified && (
          <div className="flex flex-col gap-12 items-center">
            <p className="appear font-SFProItalic text-3xl font-semibold text-neutral-700">
              Hi, {aadharUser} !
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <input
                ref={passwordRef}
                type="password"
                className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  state.password.isError ? "border-2 border-red-400" : ""
                }`}
                placeholder="Create a password"
              />
              <button
                onClick={registerClickHandler}
                disabled={state.password.isLoading}
                className="appear bg-emerald-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-emerald-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
              >
                {state.password.isLoading ? (
                  <div className="flex flex-row gap-3 items-center">
                    <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                    <p className="font-primary font-medium text-neutral-700">
                      Verifing...
                    </p>
                  </div>
                ) : (
                  "Register"
                )}
              </button>
              {state.password.isError && (
                <p className="appear font-primary font-semibold text-red-400">
                  {state.password.error}
                </p>
              )}
            </div>

            <div className="appear flex flex-col gap-4 items-start w-full ">
              <p className="font-SFProItalic text-sm text-neutral-500">
                Password must contain...
              </p>
              <ul className="flex flex-col items-start w-full gap-1">
                <li className="font-primary text-xs text-neutral-400">
                  Minimum 8 charachters,
                </li>
                <li className="font-primary text-xs text-neutral-400">
                  A special, numeric and capital charachter
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Register;
