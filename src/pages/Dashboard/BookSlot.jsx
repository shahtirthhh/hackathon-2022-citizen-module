import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Authenticating from "../../components/Authenticating";

import { Context } from "../../store/context";
import { verify_token } from "../../utils/api";
import Navbar from "../../components/Navbar";
import MobileNavbar from "../../components/MobileNavbar";
import axios from "axios";

const BookSlot = () => {
  const tokenContext = useContext(Context).token;
  const setUserContext = useContext(Context).setUser;
  const setNotificationContext = useContext(Context).setNotification;

  const navigate = useNavigate();
  const [verifing, setVerifing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState(undefined);
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
  const [freeSlots, setFreeSlots] = useState(undefined);
  const get_free_slots = async (application) => {
    if (
      !application ||
      !application.form_type ||
      !application.district ||
      !application.application_id
    ) {
      navigate("/dashboard/my-applications");
      setNotificationContext({
        visible: true,
        color: "yellow",
        data: "Place select application from 'My applications' !",
      });
      return;
    }
    setApplication(application);
    setLoading(true);
    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/citizen/get-free-slots",
        {
          department: application.form_type,
          district: application.district,
          application_id: application.application_id,
        },
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );

      const { data } = response;
      if (!data.error) {
        setLoading(false);

        const free_slots = data.data.free_slots;
        setFreeSlots(free_slots);
      } else {
        setNotificationContext({
          visible: true,
          color: "red",
          data: data.message,
        });
        setLoading("error");
      }
    } catch (error) {
      setLoading(false);
      setLoading("error");
      setNotificationContext({
        visible: true,
        color: "red",
        data: error.response ? error.response.data.message : "Network error !",
      });
    }
  };
  useEffect(() => {
    if (!verifing) {
      try {
        const application_data = JSON.parse(
          localStorage.getItem("application-data")
        );
        if (!application_data) navigate("/dashboard");
        get_free_slots(application_data);
      } catch (error) {
        navigate("/dashboard");
      }
    }
    return () => {
      if (!verifing) localStorage.removeItem("application-data");
    };
  }, [verifing]);
  const book_slot_cancel = () => {
    setModalContext({
      isOpen: false,
    });
  };
  const book_slot_confirm = async (selectedSlot) => {
    setModalContext({
      title: "Booking...",
      type: "loading",
      message: "Once booked, cannot be canceled or rescheduled !",
      confirmText: "Booking...",
      cancelText: "Cancel",
      isOpen: true,
    });
    if (!application || !selectedSlot) {
      setModalContext({
        isOpen: false,
      });
      setNotificationContext({
        visible: true,
        color: "yellow",
        data: "Place select application from 'My applications' !",
      });
      navigate("/dashboard/my-applications");
      return;
    }
    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/citizen/book-free-slot",
        {
          application,
          selectedSlot,
        },
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );

      const { data } = response;
      if (!data.error) {
        setModalContext({
          isOpen: false,
        });
        setNotificationContext({
          visible: true,
          color: "green",
          data: data.message,
        });
        navigate("/dashboard/my-applications");
      } else {
        setModalContext({
          isOpen: false,
        });
        setNotificationContext({
          visible: true,
          color: "green",
          data: data.message,
        });
        navigate("/dashboard/my-applications");
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
      navigate("/dashboard/my-applications");
    }
    setTimeout(() => {
      setModalContext({
        isOpen: false,
      });
    }, 5000);
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
              Book a slot
            </h1>
            {application && (
              <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
                {application.form_type[0] +
                  application.form_type.slice(1).toLowerCase() +
                  " application for " +
                  application.holders[0]}
              </p>
            )}
          </div>
          <Navbar />
        </div>
        <MobileNavbar />
      </div>

      {freeSlots && Object.keys(freeSlots).length > 0 && (
        <div className="flex flex-col sm:p-4 sm:py-10 py-20 px-4 sm:gap-20 gap-20 items-center justify-center">
          <p className="appear font-SFProItalic sm:text-xl text-lg font-semibold text-neutral-700 w-full text-center">
            📅 Book an online slot, and stay home enjoying a fun activity!
          </p>
          <div className="flex flex-col gap-2 appear font-primary sm:w-[70%] w-full">
            <p className="sm:text-base text-xs font-semibold text-neutral-500 w-full text-justify">
              - Video verification will be organised at selected time and day.
            </p>
            <p className="sm:text-base text-xs font-semibold text-neutral-500 w-full text-justify">
              - You have to join verification through this portal only. We do
              not conduct it anywhere else or ask for fees!
            </p>
            <p className="sm:text-base text-xs font-semibold text-neutral-500 w-full text-justify">
              - You can join the verification between the given hours on the
              day.
            </p>
          </div>
          <table className="sm:w-[70%] w-full">
            <tbody>
              {Object.keys(freeSlots).map((slot_id) => (
                <tr
                  key={slot_id}
                  className="appear flex flex-col w-full  bg-white my-4 justify-center rounded-xl shadow-lg p-5 md:p-7"
                >
                  <td className="font-SFProItalic text-neutral-600">
                    🕔 {freeSlots[slot_id].time}
                  </td>
                  <td className="flex flex-row flex-wrap p-2 gap-5 w-full justify-center items-center">
                    {freeSlots[slot_id].dates.map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setModalContext({
                            title: (
                              <div className="flex flex-col gap-1">
                                <h1 className="font-SFProItalic text-lg text-neutral-700">{`Book ${freeSlots[slot_id].time}`}</h1>
                                <h1 className="font-SFProItalic text-lg text-neutral-700">{`${
                                  " on " + date
                                }`}</h1>
                              </div>
                            ),
                            type: "confirm",
                            message:
                              "Once booked, cannot be canceled or rescheduled!",
                            confirmText: "👍🏻 Confirm",
                            cancelText: "Cancel",
                            onConfirm: () =>
                              book_slot_confirm({
                                slot_id: parseInt(slot_id),
                                time: freeSlots[slot_id].time,
                                date,
                              }),
                            onCancel: book_slot_cancel,
                            isOpen: true,
                          });
                        }}
                        className="px-4 py-1 font-primary font-medium text-neutral-500 bg-primary rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        {date}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col sm:p-4 sm:py-10 py-20 px-4 sm:gap-20 gap-16 items-center">
        {!freeSlots && (
          <div className="w-fullh-full justify-center items-center">
            {loading && loading !== "error" && (
              <div className="flex flex-row gap-3 justify-center items-center w-full my-40 ">
                <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
                <p className="font-primary font-medium text-neutral-700">
                  Getting free slots...
                </p>
              </div>
            )}
            {loading === "error" && (
              <div className="flex flex-row gap-3 items-center justify-center my-40 w-full">
                <p className="font-SFProItalic text-xl font-medium text-red-400">
                  Error getting free slots !!
                </p>
              </div>
            )}
          </div>
        )}
        {freeSlots && Object.keys(freeSlots).length < 1 && (
          <div className="flex flex-col gap-3 items-center justify-center my-40 w-full">
            <p className="font-SFProItalic text-xl text-neutral-600">
              Uh oh, no free slots found !
            </p>
            <p className="font-SFProItalic text-base font-medium text-green-600">
              Try again tommorow
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default BookSlot;
