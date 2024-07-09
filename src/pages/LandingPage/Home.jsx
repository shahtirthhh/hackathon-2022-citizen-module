import React from "react";
import { Link } from "react-router-dom";
import developersImage from "../../assets/landing/developers.png";
import problemImage from "../../assets/landing/problem.png";
import solutionImage from "../../assets/landing/solution.png";

const tirth = "#";
const devanshee = "#";
const govtModule = "#";

function Home() {
  return (
    <main className=" flex flex-col mb-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-purple-600 text-white py-8">
        <h1 className="appear ani-1 font-SFProItalic lg:text-8xl md:text-6xl text-4xl text-center">
          Citizen Module
        </h1>
        <p className="appear ani-1 lg:text-2xl md:text-xl text-lg text-center mt-4">
          A realistic approach for a genuine issue
        </p>

        <div className="mt-8 flex space-x-4">
          <Link
            to="/register"
            className="appear font-primary font-semibold bg-white text-blue-500 py-2 px-4 rounded-lg hover:bg-gray-200"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="appear font-primary font-semibold bg-white text-blue-500 py-2 px-4 rounded-lg hover:bg-gray-200"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Slideshow Section */}
      <div className="flex lg:flex-row flex-col p-3 gap-1 sm:gap-10">
        <div className="appear flex sm:flex-row flex-col  md:items-start items-center gap-3 sm:gap-10 p-3 ">
          <img className="w-40 h-40" src={problemImage} alt="problem" />
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-SFProItalic text-rose-500 w-full sm:text-left text-center">
              What's the issue?
            </h1>
            <ul className="text-lg text-gray-600  flex flex-col gap-4">
              <li>
                • In India, to apply for birth, marriage, or death certificates,
                people lack online options.
              </li>
              <li>
                • Visiting respective government departments with bunch of
                papers is a must.
              </li>
              <li> • Rush or missing documents can be a nightmare.</li>
            </ul>
          </div>
        </div>
        <div className="appear flex sm:flex-row flex-col h-full  md:items-start items-center gap-3 sm:gap-10 p-3 ">
          <img className="w-40 h-40" src={solutionImage} alt="solution" />
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-SFProItalic text-emerald-500 w-full sm:text-left text-center">
              What's the solution?
            </h1>
            <ul className="text-lg text-gray-600 flex flex-col gap-4">
              <li>
                • Apply for all 3 certificates from one place, anytime and
                anywhere.
              </li>
              <li>
                • No more paperwork, just upload the documents and proceed to
                the next step.
              </li>
              <li>
                • 5-minute online video verification at your convenience on the
                same portal to ensure identity.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Developers Section */}
      <div className="animate mt-14 p-4  flex flex-col lg:flex-row  justify-evenly gap-10 items-center">
        <div className="appear  h-full flex flex-row lg:gap-10 gap-3 items-center">
          <img
            className="sm:w-52 w-[40%] sm:h-52 h-[40%]"
            src={developersImage}
            alt="Developers"
          />
          <div className="flex flex-col gap-3">
            <h1 className="sm:text-3xl text-lg text-neutral-600 whitespace-nowrap font-SFProItalic">
              🧠 Developers
            </h1>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={tirth}
                  className="sm:text-xl text-md text-blue-500 font-SFProItalic hover:cursor-pointer hover:text-blue-400 transition-all underline underline-offset-2"
                >
                  Tirth Shah
                </a>
              </li>
              <li>
                <a
                  href={devanshee}
                  className="sm:text-xl text-md text-blue-500 font-SFProItalic hover:cursor-pointer hover:text-blue-400 transition-all underline underline-offset-2"
                >
                  Devanshee Ramanuj
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          id="modules"
          className="appear h-full p-3 flex flex-col lg:gap-10 gap-3 items-center"
        >
          <h1 className="text-3xl text-neutral-600  font-SFProItalic">
            🔗 Link to modules
          </h1>
          <ul>
            <li>
              <a
                href={govtModule}
                className="text-xl text-blue-500 font-SFProItalic hover:cursor-pointer hover:text-blue-400 transition-all underline underline-offset-2"
              >
                Govt. Module
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default Home;
