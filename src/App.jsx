import { RouterProvider, createBrowserRouter } from "react-router-dom";
import io from "socket.io-client";
import { useContext, useEffect } from "react";
import { Context } from "./store/context";

import Error from "./components/Error";
import Notification from "./components/Notification";
import Modal from "./components/Modal";

import LandingLayout from "../src/pages/LandingPage/LandingLayout";
import Home from "../src/pages/LandingPage/Home";
import Register from "../src/pages/LandingPage/Register";
import AadharOperations from "../src/pages/LandingPage/AadharOperations";
import Login from "./pages/LandingPage/Login";

import DashboardLayout from "../src/pages/Dashboard/DashboardLayout";
import HomePage from "./pages/Dashboard/HomePage";
import MyApplications from "./pages/Dashboard/MyApplications";
import BirthForm from "./pages/Dashboard/forms/BirthForm";
import MarriageForm from "./pages/Dashboard/forms/MarriageForm";
import DeathForm from "./pages/Dashboard/forms/DeathForm";
import BookSlot from "./pages/Dashboard/BookSlot";
import VideoVerification from "./pages/Dashboard/VideoVerification";
import ThanksForJoining from "./pages/Dashboard/ThanksForJoining";

const SOCKET = io(process.env.REACT_APP_SOCKET_SERVER);
const ROUTER = createBrowserRouter([
  // Homepage paths
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "aadhar-operations",
        element: <AadharOperations />,
      },
    ],
    errorElement: <Error />,
  },
  // Dashboard paths
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "my-applications",
        element: <MyApplications />,
      },
      {
        path: "birth-form",
        element: <BirthForm />,
      },
      {
        path: "marriage-form",
        element: <MarriageForm />,
      },
      {
        path: "death-form",
        element: <DeathForm />,
      },
      {
        path: "book-slot",
        element: <BookSlot />,
      },
      {
        path: "video-verification",
        element: <VideoVerification />,
      },
      {
        path: "thanks-for-joining",
        element: <ThanksForJoining />,
      },
    ],
    errorElement: <Error />,
  },
]);

function App() {
  const setSocketContext = useContext(Context).setSocket;
  const socketContext = useContext(Context).socket;

  useEffect(() => {
    SOCKET.on("connection_sucess", () => {
      setSocketContext(SOCKET);
    });
  }, [SOCKET]);
  return (
    <div className="h-full ">
      <Modal />
      <Notification />
      <RouterProvider router={ROUTER}></RouterProvider>
      {!SOCKET.connected && (
        <div className=" backdrop-blur-lg fixed bottom-0 z-50 w-full  bg-primary flex  items-center justify-center px-5">
          <div className="appear flex gap-1 items-center justify-end w-full">
            <div className="spinner border-2 border-neutral-600 w-[0.6rem] h-[0.6rem]"></div>
            <p className="font-primary sm:text-sm text-xs font-semibold text-neutral-600 ">
              connecting to real time servers
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
