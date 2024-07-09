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
  groom: {
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
  bride: {
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

const MarriageForm = () => {
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

  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const placeOfMarriageRef = useRef();
  const dateOfMarriageRef = useRef();

  const groomAadharRef = useRef();
  const groomOTPref = useRef();
  const groomReligionRef = useRef();
  const groomDOBRef = useRef();
  const groomOccupationRef = useRef();
  const groomSignatureHiddenButton = useRef();
  const [groomSignature, setGroomSignature] = useState(null);
  const [groomSignatureImage, setGroomSignatureImage] = useState(null);

  const brideAadharRef = useRef();
  const brideOTPref = useRef();
  const brideReligionRef = useRef();
  const brideDOBRef = useRef();
  const brideOccupationRef = useRef();
  const brideSignatureHiddenButton = useRef();
  const [brideSignature, setBrideSignature] = useState(null);
  const [brideSignatureImage, setBrideSignatureImage] = useState(null);

  const witnessIDHiddenButton = useRef();
  const [witnessID, setWitnessID] = useState(null);
  const [witnessIDImage, setWitnessIDImage] = useState(null);

  const witnessSignatureHiddenButton = useRef();
  const [witnessSignature, setWitnessSignature] = useState(null);
  const [witnessSignatureImage, setWitnessSignatureImage] = useState(null);

  const priestSignatureHiddenButton = useRef();
  const [priestSignature, setPriestSignature] = useState(null);
  const [priestSignatureImage, setPriestSignatureImage] = useState(null);

  const marriage1HiddenButton = useRef();
  const [marriage1, setMarriage1] = useState(null);
  const [marriage1Image, setMarriage1Image] = useState(null);

  const marriage2HiddenButton = useRef();
  const [marriage2, setMarriage2] = useState(null);
  const [marriage2Image, setMarriage2Image] = useState(null);

  if (verifing) {
    return <Authenticating />;
  }

  const verify_aadhar = async (person) => {
    const aadharRef = person === "groom" ? groomAadharRef : brideAadharRef;
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
      person === "groom"
        ? groomOTPref.current.value
        : brideOTPref.current.value;

    const aadhar =
      person === "groom"
        ? aadharData.groom.aadhar.value
        : aadharData.bride.aadhar.value;
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
        person === "groom"
          ? setGroom(response.data.data.fullName.fullName)
          : setBride(response.data.data.fullName.fullName);
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
  const handle_groom_signature_change = async () => {
    setGroomSignature(groomSignatureHiddenButton.current.files[0]);
    const file = groomSignatureHiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setGroomSignatureImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handle_bride_signature_change = async () => {
    setBrideSignature(brideSignatureHiddenButton.current.files[0]);
    const file = brideSignatureHiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setBrideSignatureImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handle_witness_id_change = async () => {
    setWitnessID(witnessIDHiddenButton.current.files[0]);
    const file = witnessIDHiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setWitnessIDImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handle_witness_signature_change = async () => {
    setWitnessSignature(witnessSignatureHiddenButton.current.files[0]);
    const file = witnessSignatureHiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setWitnessSignatureImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handle_priest_signature_change = async () => {
    setPriestSignature(priestSignatureHiddenButton.current.files[0]);
    const file = priestSignatureHiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPriestSignatureImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handle_marriage_photo1_change = async () => {
    setMarriage1(marriage1HiddenButton.current.files[0]);
    const file = marriage1HiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setMarriage1Image(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handle_marriage_photo2_change = async () => {
    setMarriage2(marriage2HiddenButton.current.files[0]);
    const file = marriage2HiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setMarriage2Image(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const validate_fields = () => {
    const formData = {
      citizen_id: userContext.citizen_id,

      placeOfMarriage: placeOfMarriageRef.current.value,
      dateOfMarriage: dateOfMarriageRef.current.value,

      groomAadhar: aadharData.groom.aadhar.value,
      groomReligion: groomReligionRef.current.value,
      groomDOB: groomDOBRef.current.value,
      groomOccupation: groomOccupationRef.current.value,
      groomSignature: groomSignature,

      brideAadhar: aadharData.bride.aadhar.value,
      brideReligion: brideReligionRef.current.value,
      brideDOB: brideDOBRef.current.value,
      brideOccupation: brideOccupationRef.current.value,
      brideSignature: brideSignature,

      witnessID: witnessID,
      witnessSignature: witnessSignature,

      priestSignature: priestSignature,
      marriagePhoto1: marriage1,
      marriagePhoto2: marriage2,
    };
    const validationErrors = {};
    // Example validation logic, adjust as needed
    if (!validators.aadhar_validator(formData.citizen_id)) {
      validationErrors.secretKey = "Citizen aadhar number not found";
    }
    if (
      !formData.placeOfMarriage ||
      formData.placeOfMarriage.trim().length < 3
    ) {
      validationErrors.placeOfMarriage = "Place of marriage is required";
    }
    const today = new Date().toDateString();
    if (new Date(formData.dateOfMarriage) >= new Date(today)) {
      validationErrors.dateOfMarriage = "Invalid marriage date";
    }
    // Groom validations
    if (!validators.aadhar_validator(formData.groomAadhar)) {
      validationErrors.groomAadhar = "Invalid grrom's aadhar";
    }
    if (!data.religions.includes(formData.groomReligion)) {
      validationErrors.groomReligion = "Religion is required";
    }
    if (new Date(formData.groomDOB) >= new Date(today)) {
      validationErrors.groomDOB = "Invalid date of birth";
    }
    if (!data.occupations.includes(formData.groomOccupation)) {
      validationErrors.groomOccupation = "Occupation is required";
    }
    if (!validators.image_validator(formData.groomSignature)) {
      validationErrors.groomSignature = "Must be an img with max 2MB";
    }
    // bride validations
    if (!validators.aadhar_validator(formData.brideAadhar)) {
      validationErrors.brideAadhar = "Invalid grrom's aadhar";
    }
    if (!data.religions.includes(formData.brideReligion)) {
      validationErrors.brideReligion = "Religion is required";
    }
    if (new Date(formData.brideDOB) >= new Date(today)) {
      validationErrors.brideDOB = "Invalid date of birth";
    }
    if (!data.occupations.includes(formData.brideOccupation)) {
      validationErrors.brideOccupation = "Occupation is required";
    }
    if (!validators.image_validator(formData.brideSignature)) {
      validationErrors.brideSignature = "Must be an img with max 2MB";
    }
    // witness validations
    if (!validators.image_validator(formData.witnessID)) {
      validationErrors.witnessID = "Must be an img with max 2MB";
    }
    if (!validators.image_validator(formData.witnessSignature)) {
      validationErrors.witnessSignature = "Must be an img with max 2MB";
    }
    // Documents validations
    if (!validators.image_validator(formData.priestSignature)) {
      validationErrors.priestSignature = "Must be an img with max 2MB";
    }
    if (!validators.image_validator(formData.marriagePhoto1)) {
      validationErrors.marriagePhoto1 = "Must be an img with max 2MB";
    }
    if (!validators.image_validator(formData.marriagePhoto2)) {
      validationErrors.marriagePhoto2 = "Must be an img with max 2MB";
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

      placeOfMarriage: placeOfMarriageRef.current.value,
      dateOfMarriage: dateOfMarriageRef.current.value,

      groomAadhar: aadharData.groom.aadhar.value,
      groomReligion: groomReligionRef.current.value,
      groomDOB: groomDOBRef.current.value,
      groomOccupation: groomOccupationRef.current.value,
      groomSignature: groomSignature,

      brideAadhar: aadharData.bride.aadhar.value,
      brideReligion: brideReligionRef.current.value,
      brideDOB: brideDOBRef.current.value,
      brideOccupation: brideOccupationRef.current.value,
      brideSignature: brideSignature,

      witnessID: witnessID,
      witnessSignature: witnessSignature,

      priestSignature: priestSignature,
      marriagePhoto1: marriage1,
      marriagePhoto2: marriage2,
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
        process.env.REACT_APP_REST_API + "/citizen/submit-marriage-form",
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
              Marriage Form
            </h1>
            <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
              Who wants multiple visits to govt. offices in this happy time !
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
        {/* Marriage Details */}
        <div className="flex flex-col gap-5">
          <h2 className="appear font-SFProItalic text-2xl  text-neutral-700">
            Marriage Details
          </h2>
          <div className="flex flex-row flex-wrap gap-7 w-fit">
            <div className="flex flex-col gap-2">
              <input
                ref={placeOfMarriageRef}
                type="text"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.placeOfMarriage ? "border-2 border-red-400" : ""
                }`}
                placeholder="Place of marriage"
              />
              {errors.placeOfMarriage && (
                <p className="font-primary text-xs font-semibold text-red-400">
                  {errors.placeOfMarriage}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={dateOfMarriageRef}
                defaultValue={new Date().toISOString().split("T")[0]}
                type="date"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.dateOfMarriage ? "border-2 border-red-400" : ""
                }`}
              />
              <label className="appear text-left px-2 font-primary font-medium text-neutral-700 text-sm tracking-wide ">
                Date of marriage
              </label>
              {errors.dateOfMarriage && (
                <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                  {errors.dateOfMarriage}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Groom's Details */}
        <div className="flex flex-col gap-5">
          <h2 className="appear font-SFProItalic text-2xl  text-neutral-700">
            Groom's Details
          </h2>
          {!aadharData.groom.aadhar.isVerified && (
            <div className="flex flex-col gap-3 w-fit">
              <input
                ref={groomAadharRef}
                type="number"
                inputMode="numeric"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  aadharData.groom.aadhar.isError
                    ? "border-2 border-red-400"
                    : ""
                }`}
                placeholder="Groom's Aadhar Number"
              />
              {aadharData.groom.aadhar.isError && (
                <p className="font-primary font-semibold text-red-400">
                  {aadharData.groom.aadhar.error}
                </p>
              )}
              <button
                onClick={() => verify_aadhar("groom")}
                disabled={aadharData.groom.aadhar.isLoading}
                className="w-fit appear bg-blue-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-blue-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
              >
                {aadharData.groom.aadhar.isLoading ? (
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
              {aadharData.groom.otp.value &&
                !aadharData.groom.aadhar.isVerified && (
                  <div className="flex flex-row gap-3 ">
                    <input
                      ref={groomOTPref}
                      type="number"
                      max={4}
                      inputMode="numeric"
                      className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                        aadharData.groom.otp.isError
                          ? "border-2 border-red-400"
                          : ""
                      }`}
                      placeholder="4 digit OTP"
                    />
                    <button
                      onClick={() => verify_otp("groom")}
                      disabled={aadharData.groom.otp.isLoading}
                      className="w-fit appear bg-emerald-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-emerald-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                    >
                      {aadharData.groom.otp.isLoading ? (
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
          {aadharData.groom.aadhar.isVerified && (
            <h2 className="appear font-primary font-semibold text-xs  tracking-wide text-neutral-500 ">
              ✔ {groom}
            </h2>
          )}
          {aadharData.groom.aadhar.isVerified && (
            <div className="flex flex-row flex-wrap gap-8">
              <div className="flex flex-col gap-2">
                <input
                  ref={groomDOBRef}
                  defaultValue={new Date().toISOString().split("T")[0]}
                  type="date"
                  className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    errors.groomDOB ? "border-2 border-red-400" : ""
                  }`}
                />
                <label className="appear text-left px-2 font-primary font-medium text-neutral-700 text-sm tracking-wide ">
                  Date of birth
                </label>
                {errors.groomDOB && (
                  <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                    {errors.groomDOB}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <select
                  defaultValue={"select"}
                  className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    errors.groomReligion ? "border-2 border-red-400" : ""
                  }`}
                  ref={groomReligionRef}
                >
                  <option disabled value="select">
                    Select Religion
                  </option>
                  {data.religions.map((religion) => (
                    <option key={religion} value={religion}>
                      {religion}
                    </option>
                  ))}
                </select>
                {errors.groomReligion && (
                  <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                    {errors.groomReligion}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <select
                  defaultValue={"select"}
                  className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    errors.groomOccupation ? "border-2 border-red-400" : ""
                  }`}
                  ref={groomOccupationRef}
                >
                  <option disabled value="select">
                    Groom's occupation
                  </option>
                  {data.occupations.map((occu) => (
                    <option key={occu} value={occu}>
                      {occu}
                    </option>
                  ))}
                </select>
                {errors.groomOccupation && (
                  <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                    {errors.groomOccupation}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-5">
                <input
                  ref={groomSignatureHiddenButton}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  placeholder="Photo"
                  onChange={handle_groom_signature_change}
                />
                <div className="flex flex-col flex-wrap gap-7 items-center h-fit">
                  {groomSignatureImage && (
                    <img
                      className="appear rounded-lg w-36 h-28 shadow-lg"
                      src={groomSignatureImage}
                      alt="img"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setGroomSignature(null);
                      setGroomSignatureImage(null);
                      groomSignatureHiddenButton.current.click();
                    }}
                    className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                      errors.groomSignature ? "border-red-500" : ""
                    }`}
                  >
                    Upload groom's sign
                  </button>
                  {errors.groomSignature && (
                    <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                      {errors.groomSignature}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Bride's Details */}
        {aadharData.groom.aadhar.isVerified && (
          <div className="flex flex-col gap-5">
            <h2 className="appear font-SFProItalic text-2xl  text-neutral-700">
              Bride's Details
            </h2>
            {!aadharData.bride.aadhar.isVerified && (
              <div className="flex flex-col gap-3 w-fit">
                <input
                  ref={brideAadharRef}
                  type="number"
                  inputMode="numeric"
                  className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    aadharData.bride.aadhar.isError
                      ? "border-2 border-red-400"
                      : ""
                  }`}
                  placeholder="Bride's Aadhar Number"
                />
                {aadharData.bride.aadhar.isError && (
                  <p className="font-primary font-semibold text-red-400">
                    {aadharData.bride.aadhar.error}
                  </p>
                )}
                <button
                  onClick={() => verify_aadhar("bride")}
                  disabled={aadharData.bride.aadhar.isLoading}
                  className="w-fit appear bg-blue-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-blue-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                >
                  {aadharData.bride.aadhar.isLoading ? (
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
                {aadharData.bride.otp.value &&
                  !aadharData.bride.aadhar.isVerified && (
                    <div className="flex flex-row gap-3 ">
                      <input
                        ref={brideOTPref}
                        type="number"
                        max={4}
                        inputMode="numeric"
                        className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                          aadharData.bride.otp.isError
                            ? "border-2 border-red-400"
                            : ""
                        }`}
                        placeholder="4 digit OTP"
                      />
                      <button
                        onClick={() => verify_otp("bride")}
                        disabled={aadharData.bride.otp.isLoading}
                        className="w-fit appear bg-emerald-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-emerald-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                      >
                        {aadharData.bride.otp.isLoading ? (
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
            {aadharData.bride.aadhar.isVerified && (
              <h2 className="appear font-primary font-semibold text-xs  tracking-wide text-neutral-500 ">
                ✔ {bride}
              </h2>
            )}
            {aadharData.groom.aadhar.isVerified && (
              <div className="flex flex-row flex-wrap gap-8">
                <div className="flex flex-col gap-2">
                  <input
                    ref={brideDOBRef}
                    defaultValue={new Date().toISOString().split("T")[0]}
                    type="date"
                    className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                      errors.brideDOB ? "border-2 border-red-400" : ""
                    }`}
                  />
                  <label className="appear text-left px-2 font-primary font-medium text-neutral-700 text-sm tracking-wide ">
                    Date of birth
                  </label>
                  {errors.brideDOB && (
                    <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                      {errors.brideDOB}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    defaultValue={"select"}
                    className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                      errors.brideReligion ? "border-2 border-red-400" : ""
                    }`}
                    ref={brideReligionRef}
                  >
                    <option disabled value="select">
                      Select Religion
                    </option>
                    {data.religions.map((religion) => (
                      <option key={religion} value={religion}>
                        {religion}
                      </option>
                    ))}
                  </select>
                  {errors.brideReligion && (
                    <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                      {errors.brideReligion}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    defaultValue={"select"}
                    className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                      errors.brideOccupation ? "border-2 border-red-400" : ""
                    }`}
                    ref={brideOccupationRef}
                  >
                    <option disabled value="select">
                      Bride's occupation
                    </option>
                    {data.occupations.map((occu) => (
                      <option key={occu} value={occu}>
                        {occu}
                      </option>
                    ))}
                  </select>
                  {errors.brideOccupation && (
                    <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                      {errors.brideOccupation}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-5">
                  <input
                    ref={brideSignatureHiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_bride_signature_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {brideSignatureImage && (
                      <img
                        className="appear rounded-lg w-36 h-28 shadow-lg"
                        src={brideSignatureImage}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setBrideSignature(null);
                        setBrideSignatureImage(null);
                        brideSignatureHiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.brideSignature ? "border-red-500" : ""
                      }`}
                    >
                      Upload bride's sign
                    </button>
                    {errors.brideSignature && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.brideSignature}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* witness upload */}
        {aadharData.groom.aadhar.isVerified &&
          aadharData.bride.aadhar.isVerified && (
            <div className="flex flex-col gap-20 justify-center items-center w-full">
              <div className="flex flex-row justify-evenly w-full flex-wrap gap-6">
                {/* Witness ID */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={witnessIDHiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_witness_id_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {witnessIDImage && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72 shadow-lg"
                        src={witnessIDImage}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setWitnessID(null);
                        setWitnessIDImage(null);
                        witnessIDHiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.witnessID ? "border-red-500" : ""
                      }`}
                    >
                      Upload wintess ID proof
                    </button>
                    {errors.witnessID && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.witnessID}
                      </p>
                    )}
                  </div>
                </div>
                {/* Witness Signature */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={witnessSignatureHiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_witness_signature_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {witnessSignatureImage && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72 shadow-lg"
                        src={witnessSignatureImage}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setWitnessSignature(null);
                        setWitnessSignatureImage(null);
                        witnessSignatureHiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.witnessSignature ? "border-red-500" : ""
                      }`}
                    >
                      Upload wintess sign
                    </button>
                    {errors.witnessSignature && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.witnessSignature}
                      </p>
                    )}
                  </div>
                </div>
                {/* Priest Signature */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={priestSignatureHiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_priest_signature_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {priestSignatureImage && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72 shadow-lg"
                        src={priestSignatureImage}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setPriestSignature(null);
                        setPriestSignatureImage(null);
                        priestSignatureHiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.priestSignature ? "border-red-500" : ""
                      }`}
                    >
                      Upload priest sign
                    </button>
                    {errors.priestSignature && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.priestSignature}
                      </p>
                    )}
                  </div>
                </div>
                {/* Marriage photo 1 */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={marriage1HiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_marriage_photo1_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {marriage1Image && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72 shadow-lg"
                        src={marriage1Image}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMarriage1(null);
                        setMarriage1Image(null);
                        marriage1HiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.marriagePhoto1 ? "border-red-500" : ""
                      }`}
                    >
                      Upload marriage image
                    </button>
                    {errors.marriagePhoto1 && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.marriagePhoto1}
                      </p>
                    )}
                  </div>
                </div>
                {/* Marriage photo 2 */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={marriage2HiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_marriage_photo2_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {marriage2Image && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72 shadow-lg"
                        src={marriage2Image}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMarriage2(null);
                        setMarriage2Image(null);
                        marriage2HiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.marriagePhoto2 ? "border-red-500" : ""
                      }`}
                    >
                      Upload another marriage image
                    </button>
                    {errors.marriagePhoto2 && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.marriagePhoto2}
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

export default MarriageForm;
