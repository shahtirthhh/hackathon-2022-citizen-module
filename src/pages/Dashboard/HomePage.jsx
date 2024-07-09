import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Authenticating from "../../components/Authenticating";

import { Context } from "../../store/context";
import { verify_token } from "../../utils/api";
import Navbar from "../../components/Navbar";
import MobileNavbar from "../../components/MobileNavbar";

const data = [
  {
    heading: "Birth Certificate",
    details: (
      <div className="flex flex-col items-center w-full gap-6">
        <h3 className="text-xl sm:text-left w-full text-center font-SFProItalic text-neutral-700 mb-2">
          🤱🏻 Birth certificate
        </h3>
        <div className="flex flex-row flex-wrap justify-evenly items-start gap-4 w-full">
          <ul className="flex flex-col items-center">
            <h5 className="font-medium mb-3 text-base underline underline-offset-4 font-primary text-neutral-700">
              Basic details
            </h5>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Mother's Aadhaar card
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Father's Aadhaar card
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Decided child's name
            </li>
          </ul>
          <ul className="flex flex-col items-center">
            <h5 className="font-medium mb-3 text-base underline underline-offset-4 font-primary text-neutral-700">
              Documents
            </h5>
            <li className="text-left w-full  font-primary text-neutral-700 text-sm">
              Proof of permanent address
            </li>
            <li className="text-left w-full  font-primary text-neutral-700 text-sm">
              Marriage certificate
            </li>
            <li className="text-left w-full  font-primary text-neutral-700 text-sm">
              Proof of birth by hospital
            </li>
          </ul>
        </div>

        <Link to="birth-form">
          <button className="px-6 py-1 rounded-lg bg-blue-300 font-SFProItalic text-neutral-700 hover:bg-blue-500 transition-all">
            Apply
          </button>
        </Link>
      </div>
    ),
  },
  {
    heading: "Marriage Certificate",
    details: (
      <div className="flex flex-col items-center w-full gap-6">
        <h3 className="text-xl sm:text-left w-full text-center font-SFProItalic text-neutral-700 mb-2">
          💑 Marriage certificate
        </h3>
        <div className="flex flex-row flex-wrap justify-evenly items-start gap-4 w-full">
          <ul className="flex flex-col items-center">
            <h5 className="font-medium mb-3 text-base underline underline-offset-4 font-primary text-neutral-700">
              Basic details{" "}
            </h5>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Husband's Aadhaar card
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Wife's Aadhaar card
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Aadhaar card of witness 1
            </li>
          </ul>
          <ul className="flex flex-col items-center">
            <h5 className="font-medium mb-3 text-base underline underline-offset-4 font-primary text-neutral-700">
              Documents
            </h5>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Husband's signature
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Wife's signature
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Priest's signature
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Husband's birth certificate
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Wife's birth certificate
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Marriage photos
            </li>
          </ul>
        </div>

        <Link to="marriage-form">
          <button className="px-6 py-1 rounded-lg bg-blue-300 font-SFProItalic text-neutral-700 hover:bg-blue-500 transition-all">
            Apply
          </button>
        </Link>
      </div>
    ),
  },
  {
    heading: "Death Certificate",
    details: (
      <div className="flex flex-col items-center w-full gap-6">
        <h3 className="text-xl sm:text-left w-full text-center font-SFProItalic text-neutral-700 mb-2">
          📄 Death certificate
        </h3>
        <div className="flex flex-row flex-wrap justify-evenly items-start gap-4 w-full">
          <ul className="flex flex-col items-center">
            <h5 className="font-medium mb-3 text-base underline underline-offset-4 font-primary text-neutral-700">
              Basic details
            </h5>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Deceased person's Aadhaar card
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Form filler's Aadhaar card
            </li>
          </ul>
          <ul className="flex flex-col items-center">
            <h5 className="font-medium mb-3 text-base underline underline-offset-4 font-primary text-neutral-700">
              Documents{" "}
            </h5>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Death declaration by hospital
            </li>
            <li className="text-left w-full font-primary text-neutral-700 text-sm">
              Crematorium declaration
            </li>
          </ul>
        </div>
        <Link to="death-form">
          <button className="px-6 py-1 rounded-lg bg-blue-300 font-SFProItalic text-neutral-700 hover:bg-blue-500 transition-all">
            Apply
          </button>
        </Link>
      </div>
    ),
  },
];

const HomePage = () => {
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
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleDetails = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (verifing) {
    return <Authenticating />;
  }

  return (
    <main className="flex flex-col mb-16">
      {/* Hero Section */}
      <div className="sticky z-[49] top-0 flex flex-col">
        <div className="flex md:flex-row flex-col md:gap-4 gap-8 p-4  items-left justify-between bg-gradient-to-r from-blue-400 to-purple-600 text-white ">
          <div className="flex flex-col gap-4">
            <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
              Dashboard
            </h1>
            <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
              Hi again, {userContext.fullName}
            </p>
          </div>
          <Navbar />
        </div>
        <MobileNavbar />
      </div>

      <div className="flex flex-col sm:p-4 sm:py-10 py-20 px-4 sm:gap-20 gap-16 items-center">
        <p className="appear font-SFProItalic sm:text-xl text-lg font-semibold text-neutral-700 w-full text-center">
          💡 List of documents/information for seamless experience
        </p>

        {data.map((item, index) => (
          <div
            key={index}
            className="appear flex md:w-[50%] w-full  bg-white justify-center rounded-xl shadow-lg p-5 md:p-7"
          >
            {item.details}
          </div>
        ))}
      </div>
    </main>
  );
};

export default HomePage;
