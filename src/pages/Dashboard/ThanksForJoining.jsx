import React from "react";

import Navbar from "../../components/Navbar";
import MobileNavbar from "../../components/MobileNavbar";

import thanks_for_joining from "../../assets/thanks-for-joining.png";
import { Link } from "react-router-dom";

const ThanksForJoining = () => {
  return (
    <main className="flex flex-col mb-16 ">
      {/* Hero Section */}
      <div className="sticky  top-0 flex flex-col">
        <div className="flex md:flex-row flex-col md:gap-4 gap-8 p-4  items-left justify-between bg-gradient-to-r from-blue-400 to-purple-600 text-white ">
          <div className="flex flex-col gap-4">
            <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
              Thanks for joining
            </h1>
            <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
              A contribution to digitalize India
            </p>
          </div>
        </div>
      </div>
      <div className="w-full h-96 flex flex-col gap-5 px-5 items-center justify-center">
        <img
          src={thanks_for_joining}
          alt="thanks for joining"
          className="w-48 h-48"
        />
        <p className="font-SFProItalic text-xl text-neutral-600 text-center ">
          Updates of your application will be reflected in{" "}
          <Link
            to={"/dashboard/my-applications"}
            className="text-blue-400 whitespace-nowrap  underline underline-offset-2  hover:text-blue-600 transition-all"
          >
            my-applications
          </Link>{" "}
          section
        </p>
        <Link
          to={"/dashboard"}
          className="text-blue-400 underline underline-offset-2 font-SFProItalic hover:text-blue-600 transition-all"
        >
          go to home
        </Link>
      </div>
    </main>
  );
};

export default ThanksForJoining;
