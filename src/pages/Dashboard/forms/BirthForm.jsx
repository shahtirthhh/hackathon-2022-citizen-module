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
  verify_token,
  verify_aadhar_otp,
} from "../../../utils/api";
import validators from "../../../utils/validators";
import static_data from "./../../../utils/data";
import axios from "axios";

const initialState = {
  mother: {
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
  father: {
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

const BirthForm = () => {
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

  const [mother, setMother] = useState("");
  const [father, setFather] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const childBirthDateRef = useRef();
  const childGenderRef = useRef();
  const childFirstNameRef = useRef();
  const childMiddleNameRef = useRef();
  const childLastNameRef = useRef();
  const placeOfBirthRef = useRef();

  const motherAadharRef = useRef();
  const motherOTPref = useRef();
  const motherReligionRef = useRef();
  const motherLiteracyRef = useRef();
  const motherAgeRef = useRef();
  const motherOccupationRef = useRef();

  const fatherAadharRef = useRef();
  const fatherOTPref = useRef();
  const fatherReligionRef = useRef();
  const fatherLiteracyRef = useRef();
  const fatherOccupationRef = useRef();

  const addressProofHiddenButton = useRef();
  const [addressProof, setAddressProof] = useState(null);
  const [addressProofImage, setAddressProofImage] = useState(null);

  const marriageCertiHiddenButton = useRef();
  const [marriageProof, setMarriageProof] = useState(null);
  const [marriageProofImage, setMarriageProofImage] = useState(null);

  const birthProof1HiddenButton = useRef();
  const [birthProof, setBirthProof] = useState(null);
  const [birthProofImage, setBirthProofImage] = useState(null);

  if (verifing) {
    return <Authenticating />;
  }

  const verify_aadhar = async (person) => {
    const aadharRef = person === "mother" ? motherAadharRef : fatherAadharRef;
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
      person === "mother"
        ? motherOTPref.current.value
        : fatherOTPref.current.value;

    const aadhar =
      person === "mother"
        ? aadharData.mother.aadhar.value
        : aadharData.father.aadhar.value;
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
        person === "mother"
          ? setMother(response.data.data.fullName.fullName)
          : setFather(response.data.data.fullName.fullName);
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
  const handle_address_change = async () => {
    setAddressProof(addressProofHiddenButton.current.files[0]);
    const file = addressProofHiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAddressProofImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handle_marriage_change = async () => {
    setMarriageProof(marriageCertiHiddenButton.current.files[0]);
    const file = marriageCertiHiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setMarriageProofImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const handle_birth_change = async () => {
    setBirthProof(birthProof1HiddenButton.current.files[0]);
    const file = birthProof1HiddenButton.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setBirthProofImage(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const validate_fields = () => {
    const formData = {
      citizen_id: userContext.citizen_id,
      childBirthDate: new Date(childBirthDateRef.current.value).toDateString(),
      childGender: childGenderRef.current.value,
      childFirstName: childFirstNameRef.current.value,
      childMiddleName: childMiddleNameRef.current.value,
      childLastName: childLastNameRef.current.value,
      placeOfBirth: placeOfBirthRef.current.value,

      motherAadhar: aadharData.mother.aadhar.value,
      motherReligion: motherReligionRef.current.value,
      motherLiteracy: motherLiteracyRef.current.value,
      motherAgeAtBirth: motherAgeRef.current.value,
      motherOccupation: motherOccupationRef.current.value,

      fatherAadhar: aadharData.father.aadhar.value,
      fatherReligion: fatherReligionRef.current.value,
      fatherLiteracy: fatherLiteracyRef.current.value,
      fatherOccupation: fatherOccupationRef.current.value,

      permanentAddProofDOC: addressProof,
      marriageCertificateDOC: marriageProof,
      proofOfBirthDOC: birthProof,
    };
    const validationErrors = {};
    // Example validation logic, adjust as needed
    if (!validators.aadhar_validator(formData.citizen_id)) {
      validationErrors.secretKey = "Citizen aadhar number not found";
    }
    const today = new Date().toDateString();
    const dob = new Date(formData.childBirthDate);
    if (dob >= new Date(today)) {
      validationErrors.childBirthDate = "Invalid birthdate";
    }
    if (!["male", "female", "others"].includes(formData.childGender)) {
      validationErrors.childGender = "Gender is required";
    }
    if (!validators.only_alpha_validator(formData.childFirstName)) {
      validationErrors.childFirstName = "First name is required";
    }
    if (!validators.only_alpha_validator(formData.childLastName)) {
      validationErrors.childLastName = "Last name is required";
    }
    if (!validators.only_alpha_validator(formData.childMiddleName)) {
      validationErrors.childMiddleName = "Middle name is required";
    }
    if (!static_data.Gujarat.includes(formData.placeOfBirth)) {
      validationErrors.placeOfBirth = "Birth place required";
    }
    // Mother validations
    if (!validators.aadhar_validator(formData.motherAadhar)) {
      validationErrors.motherAadhar = "Invalid mother's aadhar";
    }
    if (!static_data.religions.includes(formData.motherReligion)) {
      validationErrors.motherReligion = "Religion is required";
    }
    if (!static_data.education.includes(formData.motherLiteracy)) {
      validationErrors.motherLiteracy = "Literacy is required";
    }
    if (formData.motherAgeAtBirth >= 100 || formData.motherAgeAtBirth < 18) {
      validationErrors.motherAge = "Must be between 18 & 100";
    }
    if (!static_data.occupations.includes(formData.motherOccupation)) {
      validationErrors.motherOccupation = "Occupation is required";
    }
    // Father validations
    if (!validators.aadhar_validator(formData.fatherAadhar)) {
      validationErrors.fatherAadhar = "Invalid father's aadhar";
    }
    if (!static_data.religions.includes(formData.fatherReligion)) {
      validationErrors.fatherReligion = "Religion is required";
    }
    if (!static_data.education.includes(formData.fatherLiteracy)) {
      validationErrors.fatherLiteracy = "Literacy is required";
    }
    if (!static_data.occupations.includes(formData.fatherOccupation)) {
      validationErrors.fatherOccupation = "Occupation is required";
    }
    // Document validations
    if (!validators.image_validator(formData.permanentAddProofDOC)) {
      validationErrors.addressProof = "Must be an img with max 2MB";
    }
    if (!validators.image_validator(formData.marriageCertificateDOC)) {
      validationErrors.marriageProof = "Must be an img with max 2MB";
    }
    if (!validators.image_validator(formData.proofOfBirthDOC)) {
      validationErrors.birthProof = "Must be an img with max 2MB";
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
      childBirthDate: new Date(childBirthDateRef.current.value).toDateString(),
      childGender: childGenderRef.current.value,
      childFirstName: childFirstNameRef.current.value,
      childMiddleName: childMiddleNameRef.current.value,
      childLastName: childLastNameRef.current.value,
      placeOfBirth: placeOfBirthRef.current.value,

      motherAadhar: aadharData.mother.aadhar.value,
      motherReligion: motherReligionRef.current.value,
      motherLiteracy: motherLiteracyRef.current.value,
      motherAgeAtBirth: motherAgeRef.current.value,
      motherOccupation: motherOccupationRef.current.value,

      fatherAadhar: aadharData.father.aadhar.value,
      fatherReligion: fatherReligionRef.current.value,
      fatherLiteracy: fatherLiteracyRef.current.value,
      fatherOccupation: fatherOccupationRef.current.value,

      permanentAddProofDOC: addressProof,
      marriageCertificateDOC: marriageProof,
      proofOfBirthDOC: birthProof,
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
        process.env.REACT_APP_REST_API + "/citizen/submit-birth-form",
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
              Birth Form
            </h1>
            <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
              It's online ! No more visits to govt. departments in this happy
              time.
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
        {/* Child's Details */}
        <div className="flex flex-col gap-5">
          <h2 className="appear font-SFProItalic text-2xl  text-neutral-700">
            Child's Details
          </h2>
          <div className="flex flex-row  flex-wrap gap-8">
            <div className="flex flex-col gap-2">
              <input
                ref={childBirthDateRef}
                defaultValue={new Date().toISOString().split("T")[0]}
                type="date"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.childBirthDate ? "border-2 border-red-400" : ""
                }`}
              />
              <label className="appear text-left px-2 font-primary font-medium text-neutral-700 text-sm tracking-wide ">
                Date of birth
              </label>
              {errors.childBirthDate && (
                <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                  {errors.childBirthDate}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <select
                defaultValue={"select"}
                className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.childGender ? "border-2 border-red-400" : ""
                }`}
                ref={childGenderRef}
              >
                <option disabled value="select">
                  Gender
                </option>
                {["male", "female", "others"].map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
              {errors.childGender && (
                <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                  {errors.childGender}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={childFirstNameRef}
                type="text"
                placeholder="First name"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.childFirstName ? "border-2 border-red-400" : ""
                }`}
              />
              {errors.childFirstName && (
                <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                  {errors.childFirstName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={childMiddleNameRef}
                type="text"
                placeholder="Middle name"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.childMiddleName ? "border-2 border-red-400" : ""
                }`}
              />
              {errors.childMiddleName && (
                <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                  {errors.childMiddleName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={childLastNameRef}
                type="text"
                placeholder="Last name"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.childLastName ? "border-2 border-red-400" : ""
                }`}
              />
              {errors.childLastName && (
                <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                  {errors.childLastName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <select
                defaultValue={"select"}
                className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  errors.placeOfBirth ? "border-2 border-red-400" : ""
                }`}
                ref={placeOfBirthRef}
              >
                <option disabled value="select">
                  Place of birth
                </option>
                {static_data.Gujarat.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.placeOfBirth && (
                <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                  {errors.placeOfBirth}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Mother's Details */}
        <div className="flex flex-col gap-5">
          <h2 className="appear font-SFProItalic text-2xl  text-neutral-700">
            Mother's Details
          </h2>
          {!aadharData.mother.aadhar.isVerified && (
            <div className="flex flex-col gap-3 w-fit">
              <input
                ref={motherAadharRef}
                type="number"
                inputMode="numeric"
                className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                  aadharData.mother.aadhar.isError
                    ? "border-2 border-red-400"
                    : ""
                }`}
                placeholder="Mother's Aadhar Number"
              />
              {aadharData.mother.aadhar.isError && (
                <p className="font-primary font-semibold text-red-400">
                  {aadharData.mother.aadhar.error}
                </p>
              )}
              <button
                onClick={() => verify_aadhar("mother")}
                disabled={aadharData.mother.aadhar.isLoading}
                className="w-fit appear bg-blue-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-blue-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
              >
                {aadharData.mother.aadhar.isLoading ? (
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
              {aadharData.mother.otp.value &&
                !aadharData.mother.aadhar.isVerified && (
                  <div className="flex flex-row gap-3 ">
                    <input
                      ref={motherOTPref}
                      type="number"
                      max={4}
                      inputMode="numeric"
                      className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                        aadharData.mother.otp.isError
                          ? "border-2 border-red-400"
                          : ""
                      }`}
                      placeholder="4 digit OTP"
                    />
                    <button
                      onClick={() => verify_otp("mother")}
                      disabled={aadharData.mother.otp.isLoading}
                      className="w-fit appear bg-emerald-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-emerald-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                    >
                      {aadharData.mother.otp.isLoading ? (
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
          {aadharData.mother.aadhar.isVerified && (
            <h2 className="appear font-primary font-semibold text-xs  tracking-wide text-neutral-500 ">
              ✔ {mother}
            </h2>
          )}
          {aadharData.mother.aadhar.isVerified && (
            <div className="flex flex-row flex-wrap gap-8">
              <div className="flex flex-col gap-2">
                <select
                  defaultValue={"select"}
                  className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    errors.motherReligion ? "border-2 border-red-400" : ""
                  }`}
                  ref={motherReligionRef}
                >
                  <option disabled value="select">
                    Select Religion
                  </option>
                  {static_data.religions.map((religion) => (
                    <option key={religion} value={religion}>
                      {religion}
                    </option>
                  ))}
                </select>
                {errors.motherReligion && (
                  <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                    {errors.motherReligion}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <select
                  defaultValue={"select"}
                  className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    errors.motherLiteracy ? "border-2 border-red-400" : ""
                  }`}
                  ref={motherLiteracyRef}
                >
                  <option disabled value="select">
                    Select literacy
                  </option>
                  {static_data.education.map((edu) => (
                    <option key={edu} value={edu}>
                      {edu}
                    </option>
                  ))}
                </select>
                {errors.motherLiteracy && (
                  <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                    {errors.motherLiteracy}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={motherAgeRef}
                  type="number"
                  className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                    errors.motherAge ? "border-2 border-red-500" : ""
                  }`}
                  placeholder="Mother's age at birth"
                />
                {errors.motherAge && (
                  <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                    {errors.motherAge}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <select
                  defaultValue={"select"}
                  className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    errors.motherOccupation ? "border-2 border-red-400" : ""
                  }`}
                  ref={motherOccupationRef}
                >
                  <option disabled value="select">
                    Mother's occupation
                  </option>
                  {static_data.occupations.map((occu) => (
                    <option key={occu} value={occu}>
                      {occu}
                    </option>
                  ))}
                </select>
                {errors.motherOccupation && (
                  <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                    {errors.motherOccupation}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Father's Details */}
        {aadharData.mother.aadhar.isVerified && (
          <div className="flex flex-col gap-5">
            <h2 className="appear font-SFProItalic text-2xl  text-neutral-700">
              Father's Details
            </h2>
            {!aadharData.father.aadhar.isVerified && (
              <div className="flex flex-col gap-3 w-fit">
                <input
                  ref={fatherAadharRef}
                  type="number"
                  inputMode="numeric"
                  className={`w-fit appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                    aadharData.father.aadhar.isError
                      ? "border-2 border-red-400"
                      : ""
                  }`}
                  placeholder="Father's Aadhar Number"
                />
                {aadharData.father.aadhar.isError && (
                  <p className="font-primary font-semibold text-red-400">
                    {aadharData.father.aadhar.error}
                  </p>
                )}
                <button
                  onClick={() => verify_aadhar("father")}
                  disabled={aadharData.father.aadhar.isLoading}
                  className="w-fit appear bg-blue-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-blue-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                >
                  {aadharData.father.aadhar.isLoading ? (
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
                {aadharData.father.otp.value &&
                  !aadharData.father.aadhar.isVerified && (
                    <div className="flex flex-row gap-3 ">
                      <input
                        ref={fatherOTPref}
                        type="number"
                        max={4}
                        inputMode="numeric"
                        className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                          aadharData.father.otp.isError
                            ? "border-2 border-red-400"
                            : ""
                        }`}
                        placeholder="4 digit OTP"
                      />
                      <button
                        onClick={() => verify_otp("father")}
                        disabled={aadharData.father.otp.isLoading}
                        className="w-fit appear bg-emerald-300 disabled:bg-neutral-400 disabled:cursor-not-allowed hover:bg-emerald-500 font-primary font-medium text-neutral-700 px-4 py-1 rounded-lg"
                      >
                        {aadharData.father.otp.isLoading ? (
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
            {aadharData.father.aadhar.isVerified && (
              <h2 className="appear font-semibold text-xs  tracking-wide text-neutral-500 ">
                ✔ {father}
              </h2>
            )}
            {aadharData.father.aadhar.isVerified && (
              <div className="flex flex-row flex-wrap gap-8">
                <div className="flex flex-col gap-2">
                  <select
                    defaultValue={"select"}
                    className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                      errors.fatherReligion ? "border-2 border-red-400" : ""
                    }`}
                    ref={fatherReligionRef}
                  >
                    <option disabled value="select">
                      Select Religion
                    </option>
                    {static_data.religions.map((religion) => (
                      <option key={religion} value={religion}>
                        {religion}
                      </option>
                    ))}
                  </select>
                  {errors.fatherReligion && (
                    <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                      {errors.fatherReligion}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    defaultValue={"select"}
                    className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                      errors.fatherLiteracy ? "border-2 border-red-400" : ""
                    }`}
                    ref={fatherLiteracyRef}
                  >
                    <option disabled value="select">
                      Select literacy
                    </option>
                    {static_data.education.map((edu) => (
                      <option key={edu} value={edu}>
                        {edu}
                      </option>
                    ))}
                  </select>
                  {errors.fatherLiteracy && (
                    <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                      {errors.fatherLiteracy}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    defaultValue={"select"}
                    className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 ${
                      errors.fatherOccupation ? "border-2 border-red-400" : ""
                    }`}
                    ref={fatherOccupationRef}
                  >
                    <option disabled value="select">
                      Father's occupation
                    </option>
                    {static_data.occupations.map((occu) => (
                      <option key={occu} value={occu}>
                        {occu}
                      </option>
                    ))}
                  </select>
                  {errors.fatherOccupation && (
                    <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                      {errors.fatherOccupation}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Documents upload */}
        {aadharData.mother.aadhar.isVerified &&
          aadharData.father.aadhar.isVerified && (
            <div className="flex flex-col gap-20 justify-center items-center w-full">
              <div className="flex flex-row justify-evenly w-full flex-wrap gap-6">
                {/* Address Proof */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={addressProofHiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_address_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {addressProofImage && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72 shadow-lg"
                        src={addressProofImage}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAddressProof(null);
                        setAddressProofImage(null);
                        addressProofHiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.addressProof ? "border-red-500" : ""
                      }`}
                    >
                      Upload address proof
                    </button>
                    {errors.addressProof && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.addressProof}
                      </p>
                    )}
                  </div>
                </div>
                {/* Marriage Proof */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={marriageCertiHiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_marriage_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {marriageProofImage && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72 shadow-lg"
                        src={marriageProofImage}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMarriageProof(null);
                        setMarriageProofImage(null);
                        marriageCertiHiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.marriageProof ? "border-red-500" : ""
                      }`}
                    >
                      Upload marriage proof
                    </button>
                    {errors.marriageProof && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.marriageProof}
                      </p>
                    )}
                  </div>
                </div>
                {/* Birth Proof */}
                <div className="flex flex-col gap-5">
                  <input
                    ref={birthProof1HiddenButton}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    placeholder="Photo"
                    onChange={handle_birth_change}
                  />
                  <div className="flex flex-col flex-wrap gap-7 items-center">
                    {birthProofImage && (
                      <img
                        className="appear rounded-lg md:w-96 w-72 md:h-96 h-72  shadow-lg object-cover"
                        src={birthProofImage}
                        alt="img"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setBirthProof(null);
                        setBirthProofImage(null);
                        birthProof1HiddenButton.current.click();
                      }}
                      className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                        errors.addressProof ? "border-red-500" : ""
                      }`}
                    >
                      Upload birth proof
                    </button>
                    {errors.birthProof && (
                      <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                        {errors.birthProof}
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

export default BirthForm;
