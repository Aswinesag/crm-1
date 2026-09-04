import React, { useEffect, useState } from "react";
import { TbUsers } from "react-icons/tb";
import { IoIosSearch } from "react-icons/io";
import UserTable from "../components/UserTable";
import "../css/scrollbar.css";
import { Link } from "react-router-dom";
import { setUsers, selectUsersWithStatus } from "../redux/userSlice.jsx";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance.jsx";

const Users = () => {
  const dispatch = useDispatch();

  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Fetch users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axiosInstance.get("/users");
        dispatch(setUsers(data.data));
      } catch (err) {
        console.log(`Fetching all users error: ${err.message}`);
      }
    };
    fetchUsers();
  }, [dispatch]);

  // Get users merged with online status
  const usersWithStatus = useSelector(selectUsersWithStatus);

  // Filter users
  const filteredUsers = usersWithStatus.filter((u) => {
    const matchSearch = u.name
      .toLowerCase()
      .includes(searchUser.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const reversedUsers = [...filteredUsers].reverse();

  return (
    <div id="table-width-fixed">
      {/* Breadcrumb */}
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Users </span>
      </div>

      {/* Header */}
      <div className="flex flex-row gap-4 items-center mt-4">
        <TbUsers
          size={40}
          className="bg-orange-100 text-orange-500 rounded p-2"
        />
        <p className="text-gray-700 font-extrabold text-lg">Users</p>
      </div>

      <p className="text-gray-600 mt-3 ml-1">
        Manage system users and their roles
      </p>

      {/* ✅ Top Controls (Updated Layout) */}
      <div className="mt-5 flex flex-col lg:flex-row justify-between items-center gap-4">

        {/* 🔍 LEFT: Search */}
        <div className="relative w-full max-w-md">
          <IoIosSearch
            size={22}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* 👉 RIGHT: Role Filter + Create Button */}
        <div className="flex flex-row items-center gap-3">

          {/* Role Filter */}
          <select
            name="userRole"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-300 bg-white rounded-md px-4 py-2 focus:border-orange-500 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Engineer">Engineer</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Create User Button */}
          <Link
            to="/createuser"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
          >
            + Create User
          </Link>
        </div>
      </div>

      {/* Table */}
      <UserTable users={reversedUsers} />
    </div>
  );
};

export default Users;