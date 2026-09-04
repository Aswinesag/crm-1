import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";

const UserDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state?.userObj;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-800 font-semibold mb-4">No user data found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition duration-150 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>

    {/* <div className="mt-5">
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        {/* / <Link to='/trash'><span className="hover:text-[#C2410C]"> Users & leads </span></Link> */}
        {/* / <span className="text-[#C2410C]"> View Users </span>
    </div> */} 

    <div className="flex justify-center py-12 bg-gray-100">
      <div className="bg-white rounded-xl w-full max-w-md p-3">
        <div className="flex flex-col items-center gap-2">
          {/* Profile image */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-28 h-28 rounded-full border-4 border-orange-400 shadow-sm object-cover"
            />
          ) : (
            <FaRegUser className="w-28 h-28 rounded-full border-4 border-orange-400 shadow-sm p-2 text-gray-400 bg-white" />
          )}

          <h2 className="text-xl font-bold text-orange-600">{user.name}</h2>
          <p className="text-base text-gray-700">{user.email}</p>
          <span className="text-sm px-4 py-1 rounded-full bg-orange-100 text-orange-500 font-semibold">
            {user.role}
          </span>
          <p className="text-sm">
            <span className={user.isWork ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              Work: {user.isWork ? "Active ✅" : "Inactive ❌"}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-2 w-full mt-4">
            <div className="text-center">
              <span className="block text-xs text-gray-500">Tasks Assigned</span>
              <span className="text-lg text-orange-600 font-bold">{user.tasksAssigned}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs text-gray-500">Phone</span>
              <span className="text-md text-gray-600">{user.phoneNum || "N/A"}</span>
            </div>
          </div>
          <div className="text-center w-full mt-2">
            <span className="block text-xs text-gray-500">Location</span>
            <span className="text-md text-gray-600">{user.location || "N/A"}</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full py-2 bg-orange-500 hover:bg-orange-600 cursor-pointer text-white font-semibold rounded-lg transition duration-150"
          >
            Back
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default UserDetails;
