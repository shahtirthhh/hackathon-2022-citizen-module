import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Authenticating from "../../components/Authenticating";

import { Context } from "../../store/context";
import { verify_token } from "../../utils/api";
import Navbar from "../../components/Navbar";
import MobileNavbar from "../../components/MobileNavbar";
import axios from "axios";

const MyApplications = () => {
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
  const socketContext = useContext(Context).socket;
  const setNotificationContext = useContext(Context).setNotification;
  const setModalContext = useContext(Context).setModal;

  const [loading, setLoading] = useState(false);
  const [myApplications, setMyApplications] = useState(undefined);
  const [filteredApplications, setFilteredApplications] = useState(undefined);

  const [currentId, setCurrentId] = useState(null);

  const handleCardClick = (id) => {
    setCurrentId(currentId === id ? null : id);
  };
  const get_my_applications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.REACT_APP_REST_API + "/citizen/my-applications",
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );

      const { data } = response;
      if (!data.error) {
        setLoading(false);

        const applications = data.data.citizen_applications;
        const modified_applications = [];

        applications.map((application) => {
          const new_application = {};
          new_application.holders = [];
          Object.keys(application).map((key) => {
            if (
              (key === "holder1" || key === "holder2" || key === "holder3") &&
              application[key] !== null
            ) {
              new_application.holders.push(application[key]);
            } else {
              new_application[key] = application[key];
            }
          });
          modified_applications.push(new_application);
        });
        setFilteredApplications(modified_applications);
        setMyApplications(modified_applications);
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
    get_my_applications();
    socketContext?.on("clerk-socket-not-connected", () => {
      setModalContext({
        isOpen: false,
      });
      setNotificationContext({
        visible: true,
        color: "red",
        data: "System offline, please try again in few minutes",
      });
    });
    socketContext?.on("callUser", (data) => {
      setModalContext({
        isOpen: false,
      });
      localStorage.setItem(
        "peer",
        JSON.stringify({ signal: data.signal, from: data.from })
      );
      navigate("/dashboard/video-verification");
    });
  }, [socketContext]);

  const [filters, setFilters] = useState({
    date: "",
    form: "",
    holders: "",
    department: "",
    issued: "",
  });
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };
  const applyFilters = (application) => {
    const { date, form, holders, department } = filters;

    if (
      date &&
      new Date(application.createdAt).toDateString() !==
        new Date(date).toDateString()
    )
      return false;
    if (form && application.form_type !== form) return false;
    if (
      holders &&
      !application.holders.some((holder) =>
        holder.toLowerCase().includes(holders.toLowerCase())
      )
    )
      return false;
    if (
      department &&
      !application.district.toLowerCase().includes(department.toLowerCase())
    )
      return false;

    return true;
  };
  const join_confirm = async (application) => {
    setModalContext({
      title: "Join online verification ?",
      type: "loading",
      message: "Checking clerk availablity.",
      confirmText: "Please wait...",
      isOpen: true,
    });
    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/citizen/join-request-by-citizen",
        { application },
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );

      const { data } = response;
      if (!data.error) {
        const socket = data.data.clerk_socket;
        setModalContext({
          title: "Waiting for confirmation...",
          type: "loading",
          message:
            "You will be connected soon, please do not refresh or leave the page",
          confirmText: "Waiting...",
          isOpen: true,
        });
        socketContext.emit("citizen-ready-to-join", {
          citizen_socket: socketContext.id,
          citizen_id: userContext.citizen_id,
          clerk_socket: socket,
          application,
        });
      } else {
        setNotificationContext({
          visible: true,
          color: "red",
          data: data.message,
        });

        setModalContext({
          isOpen: false,
        });
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
    }
  };
  const join_cancel = () => {
    setModalContext({
      isOpen: false,
    });
  };
  const get_certificate = async (application) => {
    setNotificationContext({
      visible: true,
      color: "blue",
      data: "Sending certificate...",
      loading: true,
    });
    try {
      const response = await axios.post(
        process.env.REACT_APP_REST_API + "/citizen/get-certificate",
        { application },
        {
          headers: { Authorization: `Bearer ${tokenContext}` },
        }
      );

      const { data } = response;
      if (!data.error) {
        setNotificationContext({
          visible: true,
          color: "green",
          data: data.message,
        });
      } else {
        setNotificationContext({
          visible: true,
          color: "red",
          data: data.message,
        });
      }
    } catch (error) {
      setNotificationContext({
        visible: true,
        color: "red",
        data: error.response ? error.response.data.message : "Network error !",
      });
    }
  };

  useEffect(() => {
    setFilteredApplications(myApplications?.filter(applyFilters));
  }, [filters]);

  if (verifing) {
    return <Authenticating />;
  }
  return (
    <main className="flex flex-col mb-16 ">
      {/* Hero Section */}
      <div className="sticky  top-0 flex flex-col">
        <div className="flex md:flex-row flex-col md:gap-4 gap-8 p-4  items-left justify-between bg-gradient-to-r from-blue-400 to-purple-600 text-white ">
          <div className="flex flex-col gap-4">
            <h1 className="appear font-SFProItalic lg:text-6xl md:text-4xl text-4xl ">
              My applications
            </h1>
            <p className="appear font-primary text-white/70 lg:text-lg md:text-md text-sm  ml-4 mt-2">
              Applications you have applied for
            </p>
          </div>
          <Navbar />
        </div>
        <MobileNavbar />
      </div>

      {!filteredApplications && (
        <div className="w-fullh-full justify-center items-center">
          {loading && loading !== "error" && (
            <div className="flex flex-row gap-3 justify-center items-center w-full my-40 ">
              <div className="w-5 h-5 border-4 border-blue-500 spinner"></div>
              <p className="font-primary font-medium text-neutral-700">
                Getting your applications...
              </p>
            </div>
          )}
          {loading === "error" && (
            <div className="flex flex-row gap-3 items-center justify-center my-40 w-full">
              <p className="font-SFProItalic text-xl font-medium text-red-400">
                Error getting applications !!
              </p>
            </div>
          )}
        </div>
      )}
      {myApplications && myApplications.length < 1 && (
        <div className="flex flex-row gap-3 items-center justify-center my-40 w-full">
          <p className="font-SFProItalic text-xl font-medium text-neutral-600">
            No applications found !
          </p>
        </div>
      )}
      {myApplications && myApplications.length > 0 && (
        <div className="sticky top-40  right-5 ">
          <div className="flex z-[49] sticky top-0 justify-end mr-8">
            <button
              onClick={() => setFilterMenuOpen((c) => !c)}
              className={`px-6 py-1  text-white font-primary transition-all font-medium rounded-lg ${
                !filterMenuOpen
                  ? " bg-sky-600 hover:bg-blue-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {filterMenuOpen ? "Close" : "📁 Filters"}
            </button>
          </div>
          {filterMenuOpen && (
            <div className="sm:p-4 p-2 flex flex-col md:flex-row gap-4  justify-center bg-primary m-4">
              <input
                id="date"
                type="date"
                name="date"
                placeholder="Filter by Date"
                value={filters.date}
                onChange={handleFilterChange}
                className="appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200"
              />

              <select
                name="form"
                value={filters.form}
                onChange={handleFilterChange}
                className="appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200"
              >
                <option value="">Filter by Form</option>
                <option value="BIRTH">Birth</option>
                <option value="MARRIAGE">Marriage</option>
                <option value="DEATH">Death</option>
              </select>
              <input
                type="text"
                name="holders"
                placeholder="Filter by Holders"
                value={filters.holders}
                onChange={handleFilterChange}
                className="appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200"
              />
              <input
                type="text"
                name="department"
                placeholder="Filter by Department"
                value={filters.department}
                onChange={handleFilterChange}
                className="appear p-2 font-primary font-semibold text-neutral-600 rounded-lg hover:cursor-pointer  hover:shadow-md active:shadow-md transition-all duration-200"
              />
            </div>
          )}
        </div>
      )}
      {filteredApplications && filteredApplications.length > 0 && (
        <div className="flex flex-col items-center justify-start  my-10 w-full ">
          <div className="hidden sm:flex justify-center ">
            {/* Table for sm+ */}
            <table className="font-primary overflow-auto w-full">
              <thead className="appaer bg-neutral-200 rounded-lg">
                <tr>
                  <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                    Date
                  </th>
                  <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                    Form
                  </th>
                  <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                    Holders
                  </th>
                  <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                    Department
                  </th>
                  <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                    Slot
                  </th>
                  <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                    Joining status
                  </th>
                  <th className="font-SFProItalic text-neutral-700 whitespace-nowrap text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                    Issued
                  </th>
                  <th className="font-SFProItalic text-neutral-700 text-xs md:text-sm  text-center px-1 md:px-2 py-2">
                    Rejection reason
                  </th>
                </tr>
              </thead>
              <tbody className="">
                {filteredApplications.map((application) => {
                  let joinStatus = "-",
                    issued = "-",
                    reason = "-",
                    slot = "-";

                  if (!application.slot) {
                    slot = (
                      <button
                        onClick={() => {
                          localStorage.setItem(
                            "application-data",
                            JSON.stringify(application)
                          );
                          navigate("/dashboard/book-slot");
                        }}
                        className="text-blue-400 hover:text-blue-700 underline underline-offset-2 transition-all"
                      >
                        Book here
                      </button>
                    );
                  }
                  if (new Date(application.slot.end) < new Date()) {
                    if (!application.joined_online) {
                      joinStatus = (
                        <span className="text-red-500 font-semibold">
                          Slot missed
                        </span>
                      );
                    } else if (
                      application.joined_online &&
                      application.issued &&
                      !application.rejection_reason
                    ) {
                      issued = (
                        <button
                          onClick={() => get_certificate(application)}
                          className="text-green-500 hover:text-green-600 underline underline-offset-2 transition-all"
                        >
                          Get certificate
                        </button>
                      );
                    } else if (
                      application.joined_online &&
                      !application.issued &&
                      application.rejection_reason
                    )
                      reason = (
                        <span className="text-red-500 font-semibold">
                          {application.rejection_reason}
                        </span>
                      );
                    else if (
                      application.joined_online &&
                      !application.issued &&
                      !application.rejection_reason
                    )
                      issued = (
                        <span className="text-blue-500 font-semibold">
                          Under process
                        </span>
                      );
                  }
                  if (
                    new Date(application.slot.start) < new Date() &&
                    new Date(application.slot.end) > new Date() &&
                    !application.joined_online
                  ) {
                    slot = (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setModalContext({
                              title: "Join online verification ?",
                              type: "confirm",
                              message:
                                "Verification cannot be left incomplete !",
                              confirmText: "Join",
                              cancelText: "Cancel",
                              onConfirm: () => join_confirm(application),
                              onCancel: join_cancel,
                              isOpen: true,
                            });
                          }}
                          className="text-blue-400 hover:text-blue-700 underline underline-offset-2 transition-all"
                        >
                          Join now
                        </button>
                        <span className=" text-xs text-red-400 font-semibold">
                          Valid till{" "}
                          {new Date(application.slot.end)
                            .toTimeString()
                            .split(" ")[0]
                            .slice(0, 5)}
                        </span>
                      </div>
                    );
                  }
                  if (new Date(application.slot.start) > new Date()) {
                    slot = `${
                      new Date(application.slot.start).toLocaleDateString() +
                      "\n" +
                      new Date(application.slot.start)
                        .toTimeString()
                        .split(" ")[0]
                        .slice(0, 5) +
                      "-" +
                      new Date(application.slot.end)
                        .toTimeString()
                        .split(" ")[0]
                        .slice(0, 5)
                    } `;
                  }
                  return (
                    <tr
                      className="appear mt-4  border-b-[1px] border-neutral-300"
                      key={application.application_id}
                    >
                      <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                        {application.form_type}
                      </td>
                      <td className="flex flex-col px-2 md:text-sm text-xs py-4  ">
                        {application.holders.map((holder, index) =>
                          holder ? (
                            <span key={index}>
                              {application.holders.length > 1 ? `-` : ""}{" "}
                              {holder}
                            </span>
                          ) : (
                            <></>
                          )
                        )}
                      </td>
                      <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                        {application.district}
                      </td>
                      <td className=" px-2 md:text-sm text-xs py-4 border-2 whitespace-pre-line">
                        {slot}
                      </td>
                      <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                        {joinStatus}
                      </td>
                      <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                        {issued}
                      </td>
                      <td className=" px-2 md:text-sm text-xs py-4 border-2 ">
                        {reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Card for sm- */}
          <div className="flex sm:hidden flex-col gap-4 w-full px-5">
            {filteredApplications.map((application) => {
              let joinStatus = "-",
                issued = "-",
                reason = "-",
                slot = "-";

              if (!application.slot) {
                slot = (
                  <button
                    onClick={() => {
                      localStorage.setItem(
                        "application-data",
                        JSON.stringify(application)
                      );
                      navigate("/dashboard/book-slot");
                    }}
                    className="text-blue-400 hover:text-blue-700 underline underline-offset-2 transition-all"
                  >
                    Book here
                  </button>
                );
              }
              if (new Date(application.slot.end) < new Date()) {
                if (!application.joined_online) {
                  joinStatus = (
                    <span className="text-red-500 font-semibold">
                      Slot missed
                    </span>
                  );
                } else if (
                  application.joined_online &&
                  application.issued &&
                  !application.rejection_reason
                ) {
                  issued = (
                    <button
                      onClick={() => get_certificate(application)}
                      className="text-green-500 hover:text-green-600 underline underline-offset-2 transition-all"
                    >
                      Get certificate
                    </button>
                  );
                } else if (
                  application.joined_online &&
                  !application.issued &&
                  application.rejection_reason
                )
                  reason = (
                    <span className="text-red-500 font-semibold">
                      {application.rejection_reason}
                    </span>
                  );
                else if (
                  application.joined_online &&
                  !application.issued &&
                  !application.rejection_reason
                )
                  issued = (
                    <span className="text-blue-500 font-semibold">
                      Under process
                    </span>
                  );
              }
              if (
                new Date(application.slot.start) < new Date() &&
                new Date(application.slot.end) > new Date() &&
                !application.joined_online
              ) {
                slot = (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setModalContext({
                          title: "Join online verification ?",
                          type: "confirm",
                          message: "Verification cannot be left incomplete !",
                          confirmText: "Join",
                          cancelText: "Cancel",
                          onConfirm: () => join_confirm(application),
                          onCancel: join_cancel,
                          isOpen: true,
                        });
                      }}
                      className="text-blue-400 hover:text-blue-700 underline underline-offset-2 transition-all"
                    >
                      Join now
                    </button>
                    <span className=" text-xs text-red-400 font-semibold">
                      Valid till{" "}
                      {new Date(application.slot.end)
                        .toTimeString()
                        .split(" ")[0]
                        .slice(0, 5)}
                    </span>
                  </div>
                );
              }
              if (new Date(application.slot.start) > new Date()) {
                slot = `${
                  new Date(application.slot.start).toLocaleDateString() +
                  "\n" +
                  new Date(application.slot.start)
                    .toTimeString()
                    .split(" ")[0]
                    .slice(0, 5) +
                  "-" +
                  new Date(application.slot.end)
                    .toTimeString()
                    .split(" ")[0]
                    .slice(0, 5)
                } `;
              }

              const isExpanded = currentId === application.application_id;

              return (
                <>
                  <div
                    key={application.application_id}
                    className={`appear flex justify-between items-center bg-white p-3 rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all hover:bg-slate-100 w-full ${
                      slot === <Link /> ? "bg-emerald-200" : ""
                    }`}
                    onClick={() => handleCardClick(application.application_id)}
                  >
                    <span className="w-[20%] text-xs font-primary font-semibold text-neutral-600 text-left">
                      {application.form_type}
                    </span>
                    <div className="flex flex-col w-auto">
                      <span className="text-[0.6rem] font-primary font-medium text-neutral-600 text-center">
                        Submitted on
                      </span>{" "}
                      <span className=" text-xs font-primary font-medium text-neutral-600 text-center">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="w-[40%] text-[0.7rem] font-primary font-medium text-right">
                      {application.holders[0]}
                    </span>
                  </div>
                  {isExpanded && (
                    <table className="appear rounded-lg bg-white">
                      <thead className="rounded-lg bg-gray-100">
                        <tr>
                          <th className="border-2  font-SFProRegular text-neutral-600 whitespace-nowrap text-[0.6rem]  text-center px-1">
                            Department
                          </th>
                          <th className="border-2  font-SFProRegular text-neutral-600 whitespace-nowrap text-[0.6rem]  text-center px-1">
                            Slot
                          </th>
                          <th className="border-2  font-SFProRegular text-neutral-600 whitespace-nowrap text-[0.6rem]  text-center px-1">
                            Joining status
                          </th>
                          <th className="border-2  font-SFProRegular text-neutral-600 whitespace-nowrap text-[0.6rem]  text-center px-1">
                            Issued
                          </th>
                          <th className="border-2  font-SFProRegular text-neutral-600 text-[0.6rem]  text-center px-1">
                            Rejection reason
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          className="mt-4  border-b-[1px] border-neutral-300"
                          key={application.application_id}
                        >
                          <td className=" px-1 text-[0.7rem] py-2 border-2 ">
                            {application.district}
                          </td>
                          <td className=" px-1 text-[0.7rem] py-2 border-2 whitespace-pre-line">
                            {slot}
                          </td>
                          <td className=" px-1 text-[0.7rem] py-2 border-2 ">
                            {joinStatus}
                          </td>
                          <td className=" px-1 text-[0.7rem] py-2 border-2 ">
                            {issued}
                          </td>
                          <td className=" px-1 text-[0.7rem] py-2 border-2 ">
                            {reason}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </>
              );
            })}
          </div>
        </div>
      )}
      {myApplications &&
        myApplications.length > 0 &&
        filteredApplications &&
        filteredApplications.length < 1 && (
          <div className="appear px-8 flex flex-row gap-3 items-center justify-center my-40 w-full">
            <p className="font-SFProItalic sm:text-xl text-sm text-center  font-medium text-neutral-600">
              📄 No applications found matching the criteria
            </p>
          </div>
        )}
    </main>
  );
};

export default MyApplications;
