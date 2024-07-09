import React, { useContext, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import country_data from "../../utils/data";
import validators from "../../utils/validators";

import avatar from "../../assets/landing/avatar.png";
import { Context } from "../../store/context";

const AadharOperations = () => {
  const setNotificationContext = useContext(Context).setNotification;
  const aadharNumberRef = useRef(null);
  const secretKeyRef = useRef(null);
  const hiddenButtonRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const firstNameRef = useRef(null);
  const middleNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const genderRef = useRef(null);
  const dobRef = useRef(null);
  const addressLineRef = useRef(null);
  const districtRef = useRef(null);
  const stateRef = useRef(null);
  const mobileRef = useRef(null);
  const emailRef = useRef(null);
  const handle_photo_change = () => {
    setPhoto(hiddenButtonRef.current.files[0]);
    const file = hiddenButtonRef.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPhotoBase64(base64String);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform validation
    const formData = {
      secretKey: secretKeyRef.current.value,
      aadharNumber: aadharNumberRef.current.value,
      photo: photo,
      firstName: firstNameRef.current.value,
      middleName: middleNameRef.current.value,
      lastName: lastNameRef.current.value,
      gender: genderRef.current.value,
      dob: dobRef.current.value,
      addressLine: addressLineRef.current.value,
      district: districtRef.current.value,
      state: stateRef.current.value,
      mobile: mobileRef.current.value,
      email: emailRef.current.value,
    };
    const validationErrors = {};

    // Example validation logic, adjust as needed
    if (!formData.secretKey) {
      validationErrors.secretKey = "Secret key is required";
    }
    if (!validators.aadhar_validator(formData.aadharNumber)) {
      validationErrors.aadharNumber = "Aadhar number must be 12 digits";
    }
    if (!formData.photo) {
      validationErrors.photo = "Photo is required";
    }
    if (!validators.only_alpha_validator(formData.firstName)) {
      validationErrors.firstName = "First name is required";
    }
    if (!validators.only_alpha_validator(formData.lastName)) {
      validationErrors.lastName = "Last name is required";
    }
    if (!validators.only_alpha_validator(formData.middleName)) {
      validationErrors.middleName = "Middle name is required";
    }
    if (
      !formData.gender ||
      !["male", "female", "others"].includes(formData.gender)
    ) {
      validationErrors.gender = "Invalid gender";
    }
    if (!formData.dob || new Date(formData.dob) >= new Date()) {
      validationErrors.dob = "Invalid birth date";
    }
    if (!formData.addressLine || formData.addressLine.trim().length <= 5) {
      validationErrors.addressLine = "Address is required";
    }
    if (!country_data.Gujarat.includes(formData.district)) {
      validationErrors.district = "District is required";
    }
    if (!Object.keys(country_data).includes(formData.state)) {
      validationErrors.state = "State is required";
    }
    if (!validators.mobile_number_validator(formData.mobile)) {
      validationErrors.mobile = "Mobile number must be 10 digits";
    }
    // Basic email validation
    if (!validators.email_validator(formData.email)) {
      validationErrors.email = "Invalid email address";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    } else {
      setErrors({});
    }

    try {
      setNotificationContext({
        visible: true,
        color: "blue",
        data: "Saving...",
        loading: true,
      });
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append("secretKey", formData.secretKey);
      formDataToSend.append("aadharNumber", formData.aadharNumber);
      formDataToSend.append("photo", formData.photo);
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("middleName", formData.middleName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("dob", formData.dob);
      formDataToSend.append("addressLine", formData.addressLine);
      formDataToSend.append("district", formData.district);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("email", formData.email);

      // Example API call using axios
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/aadhar/add-new-aadhar",
        formDataToSend
      );
      setSaving(false);
      const { data } = response;
      if (!data.error) {
        document.getElementById("add-aadhar-form-reset").click();
        setNotificationContext({
          visible: true,
          color: "green",
          data: data.message,
        });
      }
    } catch (error) {
      setSaving(false);
      setNotificationContext({
        visible: true,
        color: "red",
        data: error.response ? error.response.data.message : "Network error !",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex sm:flex-row flex-col gap-4 p-4 items-left justify-between bg-gradient-to-r from-blue-400 to-purple-600 text-white py-8">
        <div className="flex flex-col gap-4">
          <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
            Add aadhar
          </h1>
          <p className="appear  lg:text-lg md:text-md text-sm  ml-4 mt-2">
            An admin operation !
          </p>
        </div>

        <div className="flex flex-row justify-end gap-4">
          <Link
            to="/"
            className="appear font-SFProItalic bg-white text-blue-500 h-fit whitespace-nowrap w-fit text-sm py-1 px-2 rounded-lg hover:bg-gray-200"
          >
            Home
          </Link>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className=" w-full flex flex-col gap-12 p-10 "
      >
        {/* Photo upload */}
        <div className="flex flex-col gap-2">
          <input
            ref={hiddenButtonRef}
            type="file"
            accept="image/*"
            className="hidden"
            placeholder="Photo"
            onChange={handle_photo_change}
          />
          <div className="flex flex-wrap gap-7 items-center">
            <img
              className="appear rounded-full w-32 h-32 shadow-lg"
              src={photoBase64 ? photoBase64 : avatar}
              alt="img"
            />
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                setPhotoBase64(null);
                hiddenButtonRef.current.click();
              }}
              className={`appear p-2 h-fit font-primary font-semibold bg-blue-400 hover:bg-blue-500 text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.photo ? "border-red-500" : ""
              }`}
            >
              Select photo
            </button>
          </div>
          {errors.photo && (
            <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
              {errors.photo}
            </p>
          )}
        </div>
        {/* Aadhar number */}
        <div className="flex gap-10 flex-wrap">
          <div className="flex flex-col gap-2">
            <input
              ref={aadharNumberRef}
              type="number"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.aadharNumber ? "border-red-500" : ""
              }`}
              placeholder="Aadhar Number (12 digits)"
            />
            {errors.aadharNumber && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.aadharNumber}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={secretKeyRef}
              type="password"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.secretKey ? "border-red-500" : ""
              }`}
              placeholder="secret key"
            />
            {errors.secretKey && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.secretKey}
              </p>
            )}
          </div>
        </div>
        {/* First Name */}
        <div className="flex gap-10 flex-wrap">
          <div className="">
            <input
              ref={firstNameRef}
              type="text"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.firstName ? "border-red-500" : ""
              }`}
              placeholder="First Name"
            />
            {errors.firstName && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Middle Name */}
          <div className="">
            <input
              ref={middleNameRef}
              type="text"
              className="appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200 "
              placeholder="Middle Name"
            />
            {errors.middleName && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.middleName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="">
            <input
              ref={lastNameRef}
              type="text"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.lastName ? "border-red-500" : ""
              }`}
              placeholder="Last Name"
            />
            {errors.lastName && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="">
            <select
              defaultValue={"gender"}
              ref={genderRef}
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.gender ? "border-red-500" : ""
              }`}
            >
              <option value="gender" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
            {errors.gender && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.gender}
              </p>
            )}
          </div>
          {/* Date of Birth (DOB) */}
          <div className="">
            <input
              defaultValue={new Date().toISOString().split("T")[0]}
              ref={dobRef}
              type="date"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.dob ? "border-red-500" : ""
              }`}
              placeholder="Date of Birth"
            />
            {errors.dob && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.dob}
              </p>
            )}
          </div>
        </div>
        {/* Address Line */}
        <div className="flex gap-10 flex-wrap">
          <div className="">
            <input
              ref={addressLineRef}
              type="text"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.addressLine ? "border-red-500" : ""
              }`}
              placeholder="Address Line"
            />
            {errors.addressLine && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.addressLine}
              </p>
            )}
          </div>

          {/* District */}
          <div className="">
            <select
              defaultValue={"district"}
              ref={districtRef}
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.district ? "border-red-500" : ""
              }`}
            >
              <option value="district" disabled>
                District
              </option>
              {country_data.Gujarat.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.district}
              </p>
            )}
          </div>

          {/* State */}
          <div className="">
            <select
              defaultValue={"state"}
              ref={stateRef}
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.state ? "border-red-500" : ""
              }`}
            >
              <option value="state" disabled>
                State
              </option>
              {Object.keys(country_data).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.state}
              </p>
            )}
          </div>
        </div>
        {/* Mobile */}
        <div className="flex gap-10 flex-wrap">
          <div className="">
            <input
              ref={mobileRef}
              type="text"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.mobile ? "border-red-500" : ""
              }`}
              placeholder="Mobile Number (10 digits)"
            />
            {errors.mobile && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.mobile}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="">
            <input
              ref={emailRef}
              type="email"
              className={`appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200  ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="Email Address"
            />
            {errors.email && (
              <p className="appear font-primary font-medium text-red-400 text-xs tracking-wide mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Submit button */}
          <div className="flex gap-5 items-center">
            <button
              disabled={saving}
              type="submit"
              className="appear h-fit font-primary font-semibold disabled:bg-neutral-600 disabled:cursor-not-allowed bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-800"
            >
              {saving ? (
                <div className="appear flex gap-3 items-center">
                  <div className="spinner border border-white w-3 h-3"></div>
                  <p className="font-primary font-semibold">Saving...</p>
                </div>
              ) : (
                "Submit"
              )}
            </button>
            <button
              onClick={() => {
                setPhoto(null);
                setPhotoBase64(null);
              }}
              id="add-aadhar-form-reset"
              type="reset"
              className="appear h-fit  font-primary font-semibold bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-800"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AadharOperations;
