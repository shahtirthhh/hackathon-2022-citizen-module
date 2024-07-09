import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import Authenticating from "../../../components/Authenticating";

import { Context } from "../../../store/context";
import {
  generate_aadhar_otp,
  verify_aadhar_otp,
  verify_token,
} from "../../../utils/api";
import validators from "../../../utils/validators";
import data from "../../../utils/data";
import axios from "axios";

const initialState = {
  dead: {
    aadhar: {
      value: "",
      isError: false,
      error: "",
      isVerified: false,
      isLoading: false,
    },
    otp: {
      value: "",
      isError: false,
      error: "",
      isVerified: false,
      isLoading: false,
    },
  },
  filler: {
    aadhar: {
      value: "",
      isError: false,
      error: "",
      isVerified: false,
      isLoading: false,
    },
    otp: {
      value: "",
      isError: false,
      error: "",
      isVerified: false,
      isLoading: false,
    },
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.person]: {
          ...state[action.person],
          [action.field]: {
            ...state[action.person][action.field],
            value: action.value,
          },
        },
      };
    case "SET_VERIFIED":
      return {
        ...state,
        [action.person]: {
          ...state[action.person],
          [action.field]: {
            ...state[action.person][action.field],
            isVerified: true,
          },
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        [action.person]: {
          ...state[action.person],
          [action.field]: {
            ...state[action.person][action.field],
            error: action.error,
            isError: action.isError,
          },
        },
      };
    case "SET_LOADING":
      return {
        ...state,
        [action.person]: {
          ...state[action.person],
          [action.field]: {
            ...state[action.person][action.field],
            isLoading: action.isLoading,
          },
        },
      };
    default:
      return state;
  }
}

const DeathForm = () => {
  const tokenContext = useContext(Context).token;
  const setUserContext = useContext(Context).setUser;

  const navigate = useNavigate();
  const [verifing, setVerifing] = useState(true);
  const auth_token = async (token) => {
    const response = await verify_token(token);
    if (response.error) {
      setVerifing(false);
      navigate("/login");
      return;
    } else {
      const { data } = response;
      if (!data.error) {
        localStorage.setItem("user", JSON.stringify(data.data));
        setUserContext(data.data);
        setVerifing(false);
      }
    }
  };
  useEffect(() => {
    auth_token(tokenContext);
  }, [tokenContext]);

  const userContext = useContext(Context).user;
  const setModalContext = useContext(Context).setModal;
  const setNotificationContext = useContext(Context).setNotification;

  const [aadharData, dispatch] = useReducer(reducer, initialState);
  const [errors, setErrors] = useState({});

  const [dead, setDead] = useState("");
  const [filler, setFiller] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const dateOfDeathRef = useRef();
  const placeOfDeathRef = useRef();

  const deceasedAadharRef = useRef();
  const deceasedOTPref = useRef();
  const deathReasonRef = useRef();

  const fillerAadharRef = useRef();
  const fillerOTPref = useRef();
  const fillerReliationRef = useRef();

  const crematoriumDeclarationHiddenButton = useRef();
  const [crematoriumDeclaration, setCrematoriumDeclaration] = useState(null);
  const [crematoriumDeclarationImage, setCrematoriumDeclarationImage] =
    useState(null);

  const hospitalDeclarationHiddenButton = useRef();
  const [hospitalDeclaration, setHospitalDeclaration] = useState(null);
  const [hospitalDeclarationImage, setHospitalDeclarationImage] =
    useState(null);

  if (verifing) {
    return <Authenticating />;
  }

  const verify_aadhar = async (person) => {
    const aadharRef = person === "dead" ? deceasedAadharRef : fillerAadharRef;
    dispatch({
      type: "SET_ERROR",
      person,
      field: "aadhar",
      isError: false,
    });
    if (!validators.aadhar_validator(aadharRef.current.value)) {
      dispatch({
        type: "SET_ERROR",
        person,
        field: "aadhar",
        isError: true,
        error: "Invalid aadhar number",
      });
    } else {
      dispatch({
        type: "SET_LOADING",
        person,
        field: "aadhar",
        isLoading: true,
      });
      try {
        const response = await generate_aadhar_otp(aadharRef.current.value);
        dispatch({
          type: "SET_LOADING",
          person,
          field: "aadhar",
          isLoading: false,
        });
        if (response.error) throw response;
        dispatch({
          type: "SET_FIELD",
          person,
          field: "aadhar",
          value: aadharRef.current.value,
        });
        dispatch({
          type: "SET_FIELD",
          person,
          field: "otp",
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
  const verify_otp = async (person) => {
    const otp =
      person === "dead"
        ? deceasedOTPref.current.value
        : fillerOTPref.current.value;

    const aadhar =
      person === "dead"
        ? aadharData.dead.aadhar.value
        : aadharData.filler.aadhar.value;
    if (!otp || !/^\d{4}$/.test(otp)) {
      setNotificationContext({
        visible: true,
        color: "red",
        data: "Please enter 4 digit OTP",
      });
    } else {
      dispatch({
        type: "SET_LOADING",
        person,
        field: "otp",
        isLoading: true,
      });
      try {
        const response = await verify_aadhar_otp(aadhar, otp);
        dispatch({
          type: "SET_LOADING",
          person,
          field: "otp",
          isLoading: false,
        });
        if (response.error) throw response;
        dispatch({
          type: "SET_VERIFIED",
          person,
          field: "otp",
        });
        dispatch({
          type: "SET_VERIFIED",
          person,
          field: "aadhar",
        });
        person === "dead"
          ? setDead(response.data.data.fullName.fullName)
          : setFiller(response.data.data.fullName.fullName);
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
  const handle_crematorium_change = async () => {
    setCrematoriumDeclaration(
      crematoriumDeclarationHiddenButton.current.files[0]
    );
    const file = crematoriumDeclarationHiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setCrematoriumDeclarationImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handle_hospital_change = async () => {
    setHospitalDeclaration(hospitalDeclarationHiddenButton.current.files[0]);
    const file = hospitalDeclarationHiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setHospitalDeclarationImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const validate_fields = () => {
    const formData = {
      citizen_id: userContext.citizen_id,
      placeOfDeath: placeOfDeathRef.current.value,
      dateOfDeath: dateOfDeathRef.current.value,

      deceasedAadhar: aadharData.dead.aadhar.value,
      deathReason: deathReasonRef.current.value,

      fillerAadhar: aadharData.filler.aadhar.value,
      fillerRelation: fillerReliationRef.current.value,

      crematoriumDeclaration: crematoriumDeclaration,
      hospitalDeclaration: hospitalDeclaration,
    };
    const validationErrors = {};

    if (!validators.aadhar_validator(formData.citizen_id)) {
      validationErrors.secretKey = "Citizen aadhar number not found";
    }
    if (!formData.placeOfDeath || formData.placeOfDeath.trim().length < 3) {
      validationErrors.placeOfDeath = "Place of death is required";
    }
    const today = new Date().toDateString();
    if (new Date(formData.dateOfDeath) >= new Date(today)) {
      validationErrors.dateOfDeath = "Invalid death date";
    }
    // dead's validations
    if (!validators.aadhar_validator(formData.deceasedAadhar)) {
      validationErrors.deceasedAadhar = "Invalid deceased's aadhar";
    }
    if (!data.death_reasons.includes(formData.deathReason)) {
      validationErrors.deathReason = "Reason for death is required";
    }
    // Filler validations
    if (!validators.aadhar_validator(formData.fillerAadhar)) {
      validationErrors.fillerAadhar = "Invalid applicant's aadhar";
    }
    if (!data.relations.includes(formData.fillerRelation)) {
      validationErrors.fillerRelation = "Relation is required";
    }
    if (!validators.image_validator(formData.crematoriumDeclaration)) {
      validationErrors.crematorium = "Must be an img with max 2MB";
    }
    if (!validators.image_validator(formData.hospitalDeclaration)) {
      validationErrors.hospital = "Must be an img with max 2MB";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return true;
    } else {
      setErrors({});
      return false;
    }
  };
  const submit_cancel = async () => {
    setFormSubmitting(false);
    setModalContext({
      isOpen: false,
    });
  };
  const submit_confirm = async () => {
    const formData = {
      citizen_id: userContext.citizen_id,
      placeOfDeath: placeOfDeathRef.current.value,
      dateOfDeath: dateOfDeathRef.current.value,

      deceasedAadhar: aadharData.dead.aadhar.value,
      deathReason: deathReasonRef.current.value,

      fillerAadhar: aadharData.filler.aadhar.value,
      fillerRelation: fillerReliationRef.current.value,

      crematoriumDeclaration: crematoriumDeclaration,
      hospitalDeclaration: hospitalDeclaration,
    };
    setModalContext({
      title: "Submit form ?",
      type: "loading",
      message: "Submitted forms, cannot be edited !",
      confirmText: "Submitting...",
      cancelText: "Cancel",
      onConfirm: submit_confirm,
      onCancel: submit_cancel,
      isOpen: true,
    });

    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/citizen/submit-death-form",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${tokenContext}`,
          },
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
        setFormSubmitting(false);
        navigate("/dashboard/my-applications");
      } else {
        setFormSubmitting(false);
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
      setFormSubmitting(false);
      setNotificationContext({
        visible: true,
        color: "red",
        data: error.response ? error.response.data.message : "Network error !",
      });
    }
  };
  return (
    <main className="flex flex-col mb-16">
      {/* Hero Section */}
      <div className="sticky  top-0 flex flex-col">
        <div className="flex md:flex-row flex-col md:gap-4 gap-8 p-4  items-left justify-between bg-gradient-to-r from-blue-400 to-purple-600 text-white ">
          <div className="flex flex-col gap-4">
            <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
              Death Form
            </h1>
            <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
              Fast, online and paper-free !
            </p>
          </div>
          <Link
            to="/dashboard"
            className="appear font-SFProItalic bg-white text-blue-500 h-fit whitespace-nowrap w-fit text-sm py-1 px-2 rounded-lg hover:bg-gray-200"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-16 sm:gap-20 p-5">
        {/* Basic Details */}
        <div className="flex flex-col gap-5">
          <h2 className="appear font-SFProItalic text-2xl  text-neutral-700">
            Basic Details
          </h2>
          <div className="flex flex-row flex-wrap gap-7 w-fit">
            <div className="flex flex-col gap-2">
              <input
                ref={placeOfDeathRef}
                type="text"
                className={` w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.placeOfDeath ? "border-2 border-red-400" : ""
                }`}
                placeholder="Place of death"
              />
              {errors.placeOfDeath && (
                <p className="font-primary text-xs font-semibold text-red-400">
                  {errors.placeOfDeath}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={dateOfDeathRef}
                defaultValue={new Date().toISOString().split("T")[0]}
                type="date"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.dateOfDeath ? "border-2 border-red-400" : ""
                }`}
              />
              <label className="appear text-left px-2 font-primary font-medium text-neutral-700 text-sm tracking-wide ">
                Date of death
              </label>
              {errors.dateOfDeath && (
                <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                  {errors.dateOfDeath}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Deceased's Details */}
        <div className="flex flex-col gap-5">
          <h2 className="appear font-SFProItalic text-2xl  text-neutral-700">
            Deceased's Details
          </h2>
          {!aadharData.dead.aadhar.isVerified && (
            <div className="flex flex-col gap-3 w-fit">
              <input
                ref={deceasedAadharRef}
                type="number"
                inputMode="numeric"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  aadharData.dead.aadhar.isError
                    ? "border-2 border-red-400"
                    : ""
                }`}
                placeholder="Deceased's Aadhar Number"
              />
              {aadharData.dead.aadhar.isError && (
                <p className="font-primary font-semibold text-red-400">
                  {aadharData.dead.aadhar.error}
                </p>
              )}
              <button
                onClick={() => verify_aadhar("dead")}
                disabled={aadharData.dead.aadhar.isLoading}
                className="w-fit appear bg-blue-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-blue-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
              >
                {aadharData.dead.aadhar.isLoading ? (
                  <div className="flex flex-row gap-3 items-center">
                    <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                    <p className="font-primary font-medium text-neutral-700">
                      Please wait...
                    </p>
                  </div>
                ) : (
                  "Request OTP"
                )}
              </button>
              {aadharData.dead.otp.value &&
                !aadharData.dead.aadhar.isVerified && (
                  <div className="flex flex-row gap-3 ">
                    <input
                      ref={deceasedOTPref}
                      type="number"
                      max={4}
                      inputMode="numeric"
                      className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                        aadharData.dead.otp.isError
                          ? "border-2 border-red-400"
                          : ""
                      }`}
                      placeholder="4 digit OTP"
                    />
                    <button
                      onClick={() => verify_otp("dead")}
                      disabled={aadharData.dead.otp.isLoading}
                      className="w-fit appear bg-emerald-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-emerald-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                    >
                      {aadharData.dead.otp.isLoading ? (
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
          )}
          {aadharData.dead.aadhar.isVerified && (
            <h2 className="appear font-primary font-semibold text-xs  tracking-wide text-neutral-500 ">
              ✔ {dead}
            </h2>
          )}
          {aadharData.dead.aadhar.isVerified && (
            <div className="flex flex-row flex-wrap gap-8">
              <div className="flex flex-col gap-2">
                <select
                  defaultValue={"select"}
                  className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    errors.deathReason ? "border-2 border-red-400" : ""
                  }`}
                  ref={deathReasonRef}
                >
                  <option disabled value="select">
                    Reason of death
                  </option>
                  {data.death_reasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                {errors.deathReason && (
                  <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                    {errors.deathReason}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Filler's Details */}
        {aadharData.dead.aadhar.isVerified && (
          <div className="flex flex-col gap-5">
            <h2 className="appear font-SFProItalic text-2xl  text-neutral-700">
              Applicant details (Person who is applying for the certificate)
            </h2>
            {!aadharData.filler.aadhar.isVerified && (
              <div className="flex flex-col gap-3 w-fit">
                <input
                  ref={fillerAadharRef}
                  type="number"
                  inputMode="numeric"
                  className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    aadharData.filler.aadhar.isError
                      ? "border-2 border-red-400"
                      : ""
                  }`}
                  placeholder="Applicant's Aadhar Number"
                />
                {aadharData.filler.aadhar.isError && (
                  <p className="font-primary font-semibold text-red-400">
                    {aadharData.filler.aadhar.error}
                  </p>
                )}
                <button
                  onClick={() => verify_aadhar("filler")}
                  disabled={aadharData.filler.aadhar.isLoading}
                  className="w-fit appear bg-blue-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-blue-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                >
                  {aadharData.filler.aadhar.isLoading ? (
                    <div className="flex flex-row gap-3 items-center">
                      <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                      <p className="font-primary font-medium text-neutral-700">
                        Please wait...
                      </p>
                    </div>
                  ) : (
                    "Request OTP"
                  )}
                </button>
                {aadharData.filler.otp.value &&
                  !aadharData.filler.aadhar.isVerified && (
                    <div className="flex flex-row gap-3 ">
                      <input
                        ref={fillerOTPref}
                        type="number"
                        max={4}
                        inputMode="numeric"
                        className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                          aadharData.filler.otp.isError
                            ? "border-2 border-red-400"
                            : ""
                        }`}
                        placeholder="4 digit OTP"
                      />
                      <button
                        onClick={() => verify_otp("filler")}
                        disabled={aadharData.filler.otp.isLoading}
                        className="w-fit appear bg-emerald-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-emerald-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                      >
                        {aadharData.filler.otp.isLoading ? (
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
            )}
            {aadharData.filler.aadhar.isVerified && (
              <h2 className="appear font-primary font-semibold text-xs  tracking-wide text-neutral-500 ">
                ✔ {filler}
              </h2>
            )}
            {aadharData.filler.aadhar.isVerified && (
              <div className="flex flex-row flex-wrap gap-8">
                <div className="flex flex-col gap-2">
                  <select
                    defaultValue={"select"}
                    className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                      errors.fillerRelation ? "border-2 border-red-400" : ""
                    }`}
                    ref={fillerReliationRef}
                  >
                    <option disabled value="select">
                      Select relation
                    </option>
                    {data.relations.map((relation) => (
                      <option key={relation} value={relation}>
                        {relation}
                      </option>
                    ))}
                  </select>
                  {errors.fillerRelation && (
                    <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                      {errors.fillerRelation}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* documents upload */}
        {aadharData.dead.aadhar.isVerified &&
          aadharData.filler.aadhar.isVerified && (
            <div className="flex flex-col gap-20 justify-center items-center w-full">
              <div className="flex flex-row justify-evenly w-full flex-wrap gap-6">
                {/* Crematorium */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={crematoriumDeclarationHiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_crematorium_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {crematoriumDeclarationImage && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72 shadow-lg"
                        src={crematoriumDeclarationImage}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCrematoriumDeclaration(null);
                        setCrematoriumDeclarationImage(null);
                        crematoriumDeclarationHiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.crematorium ? "border-red-500" : ""
                      }`}
                    >
                      Upload crematorium declaration
                    </button>
                    {errors.crematorium && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.crematorium}
                      </p>
                    )}
                  </div>
                </div>
                {/* Hospital */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={hospitalDeclarationHiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_hospital_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {hospitalDeclarationImage && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72 shadow-lg"
                        src={hospitalDeclarationImage}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setHospitalDeclaration(null);
                        setHospitalDeclarationImage(null);
                        hospitalDeclarationHiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.hospital ? "border-red-500" : ""
                      }`}
                    >
                      Upload hospital declaration
                    </button>
                    {errors.hospital && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.hospital}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={formSubmitting}
                onClick={() => {
                  setFormSubmitting(true);
                  const err = validate_fields();
                  // const err = false;
                  if (err) {
                    setFormSubmitting(false);
                    return;
                  } else {
                    setModalContext({
                      title: "Submit form ?",
                      type: "confirm",
                      message: "Submitted forms, cannot be edited !",
                      confirmText: "Submit",
                      cancelText: "Cancel",
                      onConfirm: submit_confirm,
                      onCancel: submit_cancel,
                      isOpen: true,
                    });
                  }
                }}
                className={
                  "appear px-6 py-1 h-fit font-primary w-fit font-semibold bg-green-400 hover:bg-green-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  disabled:bg-neutral-500  disabled:cursor-not-allowed"
                }
              >
                {formSubmitting ? (
                  <div className="flex flex-row gap-3 items-center">
                    <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                    <p className="font-primary font-medium text-neutral-700">
                      Submitting...
                    </p>
                  </div>
                ) : (
                  "Submit form"
                )}
              </button>
            </div>
          )}
      </div>
    </main>
  );
};

export default DeathForm;
