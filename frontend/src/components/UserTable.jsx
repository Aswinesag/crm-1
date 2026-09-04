import React, { useMemo, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { FiUserPlus } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, putUser } from "../redux/userSlice.jsx";
import axiosInstance from "../api/axiosInstance.jsx";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { fetchEngineersWithTaskCount } from "../api/fetchdata.jsx";
import { setEngineerTaskCounts } from "../redux/leadSlice.jsx";
import { useEffect } from "react";

const UserTable = ({ users }) => {
  const dispatch = useDispatch();

  const [editOpen, setEditOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowPerPage] = useState(5);

  const totalUsers = users.length;

  const startIndex = (page - 1) * rowsPerPage + 1;

  const endIndex = Math.min(page * rowsPerPage, totalUsers);

  const totalPages = Math.ceil(users.length / rowsPerPage);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "",
    isWork: "",
  });

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return users.slice(start, end);
  }, [users, rowsPerPage, page]);

  const handleRowsChange = (e) => {
    setRowPerPage(Number(e.target.value));
    setPage(1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleEditOpen = (u) => {
    setEditOpen(true);
    setEditUser({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      isWork: u.isWork,
    });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEditUser = async (uid, editUser) => {
    if (!validateEmail(editUser.email)) {
      toast.error("Please enter valid email address");
      return false;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.put(`/users/${uid}`, editUser);
      dispatch(putUser(data));
      toast.success(data.message);
      setEditOpen(!editOpen);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid) => {
    try {
      const { data } = await axiosInstance.delete(`/users/${uid}`);
      dispatch(deleteUser(data));
      const engineersWithTaskCount = await fetchEngineersWithTaskCount();
      dispatch(setEngineerTaskCounts(engineersWithTaskCount));
      toast.success(data.message);
      setDeleteOpen(false);
      setUserToDelete(null);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Somthing went wrong");
      }
    }
  };

  const me = useSelector((state) => state.users.currentUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get("/users");
        dispatch(setUsers(data.data));
      } catch (err) {
        console.log(`Fetch data error : ${err.message}`);
      }
    };
    fetchData();
  }, [dispatch]);





  return (
    <>
      <div className="rounded-md w-auto bg-white shadow-md mt-6 overflow-x-auto">
        <table className="w-full border-b border-gray-300 rounded-md text-sm text-left">
          <thead className="bg-white text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Profile
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                userName
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Email
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Phone
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Role
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Status
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Tasks
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td
                    className="border-b border-gray-300 text-gray-400 rounded-full cursor-pointer"
                    onClick={() => setSelectedUser(u)}
                  >
                    <Link to="/usersView" state={{ userObj: u }}>
                      <div className="relative inline-block">
                        {u?.avatar ? (
                          <img
                            src={u?.avatar}
                            alt={u?.name}
                            className="w-10 h-10 ms-4 border rounded-full border-gray-300"
                          />
                        ) : (
                          <FaRegUser className="w-10 h-10 ms-4 border rounded-full border-gray-300" />
                        )}

                        {u?.isOnline && (
                          <span
                            className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-green-400"
                            style={{ boxShadow: "0 0 2px rgba(0, 0, 0, 0.3)" }}
                          ></span>
                        )}
                      </div>
                    </Link>
                  </td>

                  <td className="p-4 border-b border-gray-300 text-blue-700">
                    {u?.name}
                  </td>
                  <td className="p-4 border-b border-gray-300">
                    <a
                      href={`mailto:${u?.email}`}
                      className="outline-none w-full hover:text-blue-600 hover:underline"
                    >
                      {u?.email}
                    </a>
                  </td>
                  <td className="p-4 border-b border-gray-300">
                    <a
                      href={`tel:${u?.phoneNum}`}
                      className="outline-none w-full hover:text-blue-600 hover:underline"
                    >
                      {u?.phoneNum}
                    </a>
                  </td>
                  <td className="p-4 border-b border-gray-300">
                    {u?.role &&
                      (u?.role === "Super Admin" ? (
                        <p className="bg-fuchsia-100 rounded-3xl text-fuchsia-700 w-23 text-center">
                          Super Admin
                        </p>
                      ) : u?.role === "Coordinator" ? (
                        <p className="bg-blue-100 rounded-3xl text-blue-700 w-23 text-center">
                          Coordinator
                        </p>
                      ) : u?.role === "Engineer" ? (
                        <p className="bg-green-100 rounded-3xl text-green-700 w-20 text-center">
                          Engineer
                        </p>
                      ) : u?.role === "Admin" ? (
                        <p className="rounded-3xl text-orange-600 bg-amber-100 w-15 text-center">
                          Admin
                        </p>
                      ) : null)}
                  </td>
                  <td className="p-4 border-b border-gray-300">
                    {u?.isWork ? (
                      <p className="bg-green-100 rounded-3xl text-green-700 w-15 text-center">
                        Active
                      </p>
                    ) : (
                      <p className="bg-red-100 rounded-3xl text-red-700 w-15 text-center">
                        Inactive
                      </p>
                    )}
                  </td>
                  <td className="p-4 border-b border-gray-300">
                    {u?.tasksAssigned}
                  </td>
                  <td className="p-4 border-b border-gray-300">
                    <div className="flex flex-row gap-4">
                      <div onClick={() => handleEditOpen(u)}>
                        <FiEdit
                          size={15}
                          style={{ color: "orange", cursor: "pointer" }}
                        />
                      </div>
                      {me?.role === "Super Admin" && (
                        <div 
                          onClick={() => { setUserToDelete(u); setDeleteOpen(true); }}
                        >
                          <FaRegTrashAlt
                            size={15}
                            style={{ color: "red", cursor: "pointer" }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 border-b border-gray-300 text-gray-700 text-center"
                  colSpan={8}
                >
                  No Users Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* edit user control */}

        {editOpen && (
          <div className="absolute right-0 top-20 w-75 h-130 md:h-164 md:w-100 bg-white shadow-lg rounded-md z-10 p-4">
            <div className="flex flex-row items-center justify-between mb-5 mt-3">
              <h4 className="text-xl text-gray-700 font-medium">Edit User</h4>
              <div
                className="text-gray-500 mt-1 cursor-pointer"
                onClick={() => setEditOpen(!editOpen)}
              >
                <RxCross1 size={15} />
              </div>
            </div>

            <hr className="text-gray-200" />

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="un"
                  className="text-gray-700 font-medium text-sm"
                >
                  Username
                </label>
                <input
                  type="text"
                  value={editUser?.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  id="un"
                  className="border border-gray-300 cursor-pointer rounded-md px-2 py-2 focus:border-[#FB6514] outline-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label
                  htmlFor="em"
                  className="text-gray-700 font-medium text-sm"
                >
                  Email
                </label>
                <input
                  type="email"
                  value={editUser?.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                  id="em"
                  className="border border-gray-300 cursor-pointer rounded-md px-2 py-2 focus:border-[#FB6514] outline-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label
                  htmlFor="ur"
                  className="text-gray-700 font-medium text-sm"
                >
                  Role
                </label>
                <select
                  id="ur"
                  value={editUser?.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                  className="border border-gray-300 rounded-md cursor-pointer px-2 py-3 focus:border-[#FB6514] outline-none"
                >
                  <option value="">select user role</option>
                  {/* <option value="Super Admin">Super Admin</option> */}
                  <option value="Coordinator">Coordinator</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <input
                  type="radio"
                  id="tr"
                  name="radio_isWork"
                  className="w-4 h-4 cursor-pointer"
                  checked={editUser?.isWork === true}
                  onChange={() => setEditUser({ ...editUser, isWork: true })}
                />
                <label htmlFor="tr" className="cursor-pointer">
                  Active
                </label>
                <input
                  type="radio"
                  id="fa"
                  name="radio_isWork"
                  className="w-4 h-4 cursor-pointer"
                  checked={editUser?.isWork === false}
                  onChange={() => setEditUser({ ...editUser, isWork: false })}
                />
                <label htmlFor="fa" className="cursor-pointer">
                  Inactive
                </label>
              </div>

              <div
                className={`bg-[#FB6514] text-white px-4 py-3 rounded-md flex justify-center absolute bottom-0 w-65 md:w-90 mb-5 ${
                  loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() =>
                  !loading && handleEditUser(editUser._id, editUser)
                }
              >
                <button className="flex gap-3 items-center font-semibold cursor-pointer">
                  {loading ? (
                    "Editing..."
                  ) : (
                    <>
                      <FiUserPlus />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <div
                className={`bg-[#FB6514] text-white px-4 py-3 rounded-md flex justify-center absolute bottom-0 w-65 md:w-90 mb-5 ${
                  loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() =>
                  !loading && handleEditUser(editUser._id, editUser)
                }
              >
                <button className="flex gap-3 items-center font-semibold cursor-pointer">
                  {loading ? (
                    "Editing..."
                  ) : (
                    <>
                      <FiUserPlus />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center p-3 gap-3 md:gap-0">
          <div className="flex gap-2 items-center">
            <p className="text-gray-600">Rows per page:</p>
            <select
              value={rowsPerPage}
              onChange={handleRowsChange}
              className="text-gray-700 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-orange-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md border ${
                page === 1
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-black border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md border ${
                page === totalPages
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-black border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="text-gray-600 text-end mt-3">
        {totalUsers > 0
          ? `${startIndex}–${endIndex} of ${totalUsers} users`
          : "No users available"}
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete user "{userToDelete?.name}"? This
              will mark the user as Deleted.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={()=>setDeleteOpen(!deleteOpen)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={()=>handleDeleteUser(userToDelete?._id)}
                className="px-4 py-2 rounded-md bg-red-600 text-white disabled:opacity-60 cursor-pointer"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserTable;
