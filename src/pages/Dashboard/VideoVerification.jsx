import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "simple-peer";

import Authenticating from "../../components/Authenticating";

import { Context } from "../../store/context";
import { verify_token } from "../../utils/api";

const VideoVerification = () => {
  const tokenContext = useContext(Context).token;
  const setUserContext = useContext(Context).setUser;
  const socketContext = useContext(Context).socket;
  const setNotificationContext = useContext(Context).setNotification;

  const navigate = useNavigate();
  const [verifing, setVerifing] = useState(true);
  const [loading, setLoading] = useState(false);
  //   const [application, setApplication] = useState(undefined);
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

  const [peerData, setPeerData] = useState(undefined);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!verifing) {
      try {
        const peer_data = JSON.parse(localStorage.getItem("peer"));
        if (!peer_data) navigate("/dashboard");
      } catch (error) {
        navigate("/dashboard");
      }
    }
    // return () => {
    //   if (!verifing) localStorage.removeItem("application-data");
    // };
  }, [verifing]);

  const clerkVideoRef = useRef();
  const citizenVideoRef = useRef();
  const connectionRef = useRef();
  const [stream, setStream] = useState(undefined);
  const [callAccepted, setCallAccepted] = useState(false);
  useEffect(() => {
    if (videoReady) {
      const peer_data = JSON.parse(localStorage.getItem("peer"));
      setPeerData(peer_data);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setStream(stream);
          citizenVideoRef.current.srcObject = stream;
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: citizenVideoRef.current.srcObject,
          });
          peer.on("signal", (data) => {
            //   console.log(data);
            socketContext.emit("answerCall", {
              signal: data,
              to: peer_data.from,
            });
          });
          peer.on("stream", (stream) => {
            console.log(stream);
            clerkVideoRef.current.srcObject = stream;
          });
          peer.signal(peer_data.signal);
          connectionRef.current = peer;
        });
    }
    socketContext.on("video-verification-ended", () => {
      localStorage.removeItem("peer");
      window.location.href = "/dashboard/thanks-for-joining";
    });
  }, [socketContext, videoReady]);
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
              Video verification
            </h1>

            <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
              Hours of travel eliminated !
            </p>
          </div>
        </div>
      </div>
      {/* Video call window */}
      <div className="flex flex-col gap-5 w-full py-10">
        <div className="flex flex-col gap-5 justify-center items-center">
          <div className="w-full flex justify-evenly sm:flex-row flex-col items-center gap-5">
            <video
              ref={(ref) => {
                citizenVideoRef.current = ref;
                setVideoReady(true);
              }}
              autoPlay
              muted
              className="rounded-xl shadow-md w-80"
            />
            <video
              autoPlay
              ref={clerkVideoRef}
              className="rounded-xl shadow-md w-80"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default VideoVerification;
