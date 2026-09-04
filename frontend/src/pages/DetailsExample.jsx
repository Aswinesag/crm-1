import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { IoIosSearch } from "react-icons/io";
import { GoUpload } from "react-icons/go";
import Card from "../components/Card.jsx";
import { useDispatch, useSelector } from "react-redux";
import { updateLead } from "../redux/leadSlice.jsx";
import {
  updateLeadStatus,
  fetchEngineersWithTaskCount,
  updateAssignedToapi,
} from "../api/fetchdata.jsx";
import { setEngineerTaskCounts } from "../redux/leadSlice.jsx";
import axiosInstance from "../api/axiosInstance.jsx";
import { PencilIcon } from "@heroicons/react/24/outline";

const DetailsExample = () => {
  const [basicDetails, setBasicDetails] = useState(true);
  const [qualificationDetails, setQualificationDetails] = useState(false);
  const [experienceDetails, setExperienceDetails] = useState(false);
  const [emergencyDetails, setEmergencyDetails] = useState(false);

  return (
    <>
      <div class=" bg-gray-100 p-6">
        <h1 class="text-2xl font-semibold mb-6 ">Employee Details</h1>

        <div className="border border-gray-200 rounded-2xl shadow-2xl">
          {/* title */}
          <div className="flex flex-row gap-24 items-center px-8 pt-5 border-b border-gray-300">
            <div
              onClick={() => {
                setBasicDetails(true);
                setQualificationDetails(false);
                setExperienceDetails(false);
                setEmergencyDetails(false);
              }}
              className="flex flex-col items-center justify-between "
            >
              <h2 className="text-lg font-semibold text-blue-600 pb-3">
                Basic Details
              </h2>
              <div className={`${basicDetails && "border-b-4 w-full border-blue-600"}`}></div>
            </div>

            <div
              onClick={() => {
                setBasicDetails(false);
                setQualificationDetails(true);
                setExperienceDetails(false);
                setEmergencyDetails(false);
              }}
              className="flex flex-col items-center justify-between "
            >
              <h2 className="text-lg font-semibold  text-blue-600 pb-3">
                Qualification Details
              </h2>
              <div className={`${qualificationDetails && "border-b-4 w-full border-blue-600"}`}></div>
            </div>

            <div
              onClick={() => {
                setBasicDetails(false);
                setQualificationDetails(false);
                setExperienceDetails(true);
                setEmergencyDetails(false);
              }}
              className="flex flex-col items-center justify-between "
            >
              <h2 className="text-lg font-semibold  text-blue-600 pb-3">
                Experience Details
              </h2>
              <div className={`${experienceDetails && " border-b-4 w-full border-blue-600"}`}></div>
            </div>

            <div
              onClick={() => {
                setBasicDetails(false);
                setQualificationDetails(false);
                setExperienceDetails(false);
                setEmergencyDetails(true);
              }}
              className="flex flex-col items-center justify-between "
            >
              <h2 className="text-lg font-semibold text-blue-600 pb-3">
                Emergency Details
              </h2>
              <div className={`${emergencyDetails && "border-b-4 w-full border-blue-600 "}`}></div>
            </div>
          </div>

          {/* discription */}
          <div className="p-2">
            {basicDetails && (
              <div class=" bg-gray-100 p-6">
                {/* <!-- Page Title --> */}
                <div className="border rounded-3xl shadow-md border-gray-300">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 ">
                    <h2 className="text-lg font-semibold text-blue-600 border-b-4">
                      Basic Details
                    </h2>
                    <PencilIcon
                      onClick={() => navigate("/employee/edit")}
                      className="h-4 w-4 sm:h-9 sm:w-8 md:h-10 md:w-8 p-1 sm:p-1.5 rounded-full bg-gray-200 text-blue-500 cursor-pointer hover:bg-blue-100 hover:text-blue-600 transition"
                    />
                  </div>

                  {/* <!-- Card Body --> */}

                  <div class="grid grid-cols-2 px-6 py-4 space-y-5 text-sm">
                    <p>
                      <span class="font-medium">Employee Name :</span>
                      <span class="text-gray-700 ml-5">Mr. Subash</span>
                    </p>

                    <p>
                      <span class="font-medium">Preferred Name :</span>
                      <span class="text-gray-700 ml-5">Subash L</span>
                    </p>

                    <p>
                      <span class="font-medium">Date of Birth :</span>
                      <span class="text-gray-700 ml-5">12/05/1998</span>
                    </p>

                    <p>
                      <span class="font-medium">Gender :</span>
                      <span class="text-gray-700 ml-5">Male</span>
                    </p>

                    <p>
                      <span class="font-medium">Blood Group :</span>
                      <span class="text-gray-700 ml-5">A1+</span>
                    </p>

                    <p>
                      <span className="font-medium">Address Details :</span>
                      <span className="text-gray-700 ml-5">
                        93, MGR Nagar, kovaipudur, covai-42
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Role :</span>
                      <span className="text-gray-700 ml-5">Developer</span>
                    </p>

                    <p>
                      <span className="font-medium">Marital Status :</span>
                      <span className="text-gray-700 ml-5">Single</span>
                    </p>

                    <p>
                      <span className="font-medium">Nationality :</span>
                      <span className="text-gray-700 ml-5">India</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            {qualificationDetails && (
              <div className="bg-gray-100 p-6 ">
                <div className="border rounded-3xl shadow-md border-gray-300 ">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 ">
                    <h2 className="text-lg font-semibold text-blue-600 border-b-4">
                      Qualification Details
                    </h2>
                    <PencilIcon
                      className="h-4 w-4 sm:h-9 sm:w-8 md:h-10 md:w-8
                  p-1 sm:p-1.5
                  rounded-full
                  bg-gray-200
                  text-blue-500
                  cursor-pointer
                  hover:bg-blue-100
                  hover:text-blue-600
                  transition"
                    />
                  </div>

                  {/* <!-- Card Body --> */}
                  <div class="grid grid-cols-2 px-6 py-4 space-y-5 text-sm">
                    <p>
                      <span class="font-medium">Employee Name :</span>
                      <span class="text-gray-700 ml-5">Mr. Subash</span>
                    </p>

                    <p>
                      <span className="font-medium">
                        Highest Qualification :
                      </span>
                      <span className="text-gray-700 ml-5">
                        Master's Degree
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Degree :</span>
                      <span className="text-gray-700 ml-5">M.Sc</span>
                    </p>

                    <p>
                      <span className="font-medium">Specialization :</span>
                      <span className="text-gray-700 ml-5">
                        Information Tecnology
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Year of Passing :</span>
                      <span className="text-gray-700 ml-5">2022</span>
                    </p>

                    <p>
                      <span className="font-medium">
                        Institution/University Name:
                      </span>
                      <span className="text-gray-700 ml-5">
                        Hindutan College of arts and science
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Location :</span>
                      <span className="text-gray-700 ml-5">Coimbatore</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            {experienceDetails && (
              <div className="bg-gray-100 p-6 ">
                <div className="border rounded-3xl shadow-md border-gray-300">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 ">
                    <h2 className="text-lg font-semibold text-blue-600 border-b-4">
                      Experience Details
                    </h2>
                    <PencilIcon
                      className="h-4 w-4 sm:h-9 sm:w-8 md:h-10 md:w-8
                  p-1 sm:p-1.5
                  rounded-full
                  bg-gray-200
                  text-blue-500
                  cursor-pointer
                  hover:bg-blue-100
                  hover:text-blue-600
                  transition"
                    />
                  </div>

                  {/* <!-- Card Body --> */}
                  <div class="grid grid-cols-2 px-6 py-4 space-y-5 text-sm">
                    <p>
                      <span class="font-medium">Employee Name :</span>
                      <span class="text-gray-700 ml-5">Mr. Subash</span>
                    </p>

                    <p>
                      <span className="font-medium">
                        Highest Qualification :
                      </span>
                      <span className="text-gray-700 ml-5">
                        Master's Degree
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Degree :</span>
                      <span className="text-gray-700 ml-5">M.Sc</span>
                    </p>

                    <p>
                      <span className="font-medium">Specialization :</span>
                      <span className="text-gray-700 ml-5">
                        Information Tecnology
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Year of Passing :</span>
                      <span className="text-gray-700 ml-5">2022</span>
                    </p>

                    <p>
                      <span className="font-medium">
                        Institution/University Name:
                      </span>
                      <span className="text-gray-700 ml-5">
                        Hindutan College of arts and science
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Location :</span>
                      <span className="text-gray-700 ml-5">Coimbatore</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            {emergencyDetails && (
              <div className="bg-gray-100 p-6 ">
                <div className="border rounded-3xl shadow-md border-gray-300 ">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 ">
                    <h2 className="text-lg font-semibold text-blue-600 border-b-4">
                      Emergency Details
                    </h2>
                    <PencilIcon
                      className="h-4 w-4 sm:h-9 sm:w-8 md:h-10 md:w-8
                  p-1 sm:p-1.5
                  rounded-full
                  bg-gray-200
                  text-blue-500
                  cursor-pointer
                  hover:bg-blue-100
                  hover:text-blue-600
                  transition"
                    />
                  </div>

                  {/* <!-- Card Body --> */}
                  <div class="grid grid-cols-2 px-6 py-4 space-y-5 text-sm">
                    <p>
                      <span class="font-medium">Employee Name :</span>
                      <span class="text-gray-700 ml-5">Mr. Subash</span>
                    </p>

                    <p>
                      <span className="font-medium">
                        Highest Qualification :
                      </span>
                      <span className="text-gray-700 ml-5">
                        Master's Degree
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Degree :</span>
                      <span className="text-gray-700 ml-5">M.Sc</span>
                    </p>

                    <p>
                      <span className="font-medium">Specialization :</span>
                      <span className="text-gray-700 ml-5">
                        Information Tecnology
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Year of Passing :</span>
                      <span className="text-gray-700 ml-5">2022</span>
                    </p>

                    <p>
                      <span className="font-medium">
                        Institution/University Name:
                      </span>
                      <span className="text-gray-700 ml-5">
                        Hindutan College of arts and science
                      </span>
                    </p>

                    <p>
                      <span className="font-medium">Location :</span>
                      <span className="text-gray-700 ml-5">Coimbatore</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsExample;
