import React, { useState } from 'react'
import { useMemo } from 'react';
import { FaRegUser } from "react-icons/fa";
import { Link } from 'react-router-dom';


const DeletedUserTable = ({users}) => {

    const [page,setPage] = useState(1)
    
    const [rowsPerPage,setRowPerPage] = useState(5)
    
    const totalUsers = users.length;
    
    const startIndex = (page -1) * rowsPerPage + 1;
    
    const endIndex = Math.min(page * rowsPerPage,totalUsers)
    
    const totalPages = Math.ceil(users.length / rowsPerPage)

    const paginatedUsers = useMemo(()=>{
      const start = (page -1) * rowsPerPage;
      const end = start + rowsPerPage;
      return users.slice(start,end)
    },[users,rowsPerPage,page])

    const handleRowsChange = (e) => {
        setRowPerPage(Number(e.target.value))
        setPage(1)
    }

    const handlePrevious = () => {
        if(page > 1){
            setPage((prev) => prev -1)
        }
    }

    const handleNext = () => {
        if(page < totalPages){
            setPage((prev) => prev + 1)
        }
    }
  return (
    <>
        <div className="rounded-md w-auto bg-white shadow-md mt-6 overflow-x-auto">
    
            <table className="w-full border-b border-gray-300 rounded-md text-sm text-left">
                <thead className="bg-red-100 text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-b border-gray-300 text-center md:text-start">Profile</th>
                      <th className="p-3 border-b border-gray-300 text-center md:text-start">userName</th>
                      <th className="p-3 border-b border-gray-300 text-center md:text-start">Email</th>
                      <th className="p-3 border-b border-gray-300 text-center md:text-start">Phone</th>
                      <th className="p-3 border-b border-gray-300 text-center md:text-start">Role</th>
                      <th className="p-3 border-b border-gray-300 text-center md:text-start">Status</th>
                      <th className="p-3 border-b border-gray-300 text-center md:text-start">Tasks</th>
                    </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((u)=>( 
                    <tr key={u._id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-300 text-gray-400 rounded-full cursor-pointer">
                      <Link to='/usersView' state={{userObj: u}}>
                      {u?.avatar ? (
                        <img src={u?.avatar} alt={u?.name} className='w-10 h-10 ms-4 border rounded-full border-gray-300' />
                      ):(
                        <FaRegUser className='w-10 h-10 ms-4 border rounded-full border-gray-300' />
                      )}
                      </Link>
                    </td>
                    
                    
                    <td className="p-4 border-b border-gray-300 text-blue-700">
                      {u?.name} 
                    </td>
                    <td className="p-4 border-b border-gray-300">
                      <a href={`mailto:${u?.email}`} className="outline-none w-full hover:text-blue-600 hover:underline">{u?.email}</a>
                    </td>
                    <td className="p-4 border-b border-gray-300">
                      <a href={`tel:${u?.phoneNum}`} className="outline-none w-full hover:text-blue-600 hover:underline">{u?.phoneNum}</a>
                    </td>
                    <td className="p-4 border-b border-gray-300">
                      {u?.role && (
                        u?.role === "Super Admin" ? (
                          <p className="bg-fuchsia-100 rounded-3xl text-fuchsia-700 w-23 text-center">Super Admin</p>
                        ) : u?.role === "Coordinator" ? (
                          <p className="bg-blue-100 rounded-3xl text-blue-700 w-23 text-center">Coordinator</p>
                        ) : u?.role === "Engineer" ? (
                          <p className="bg-green-100 rounded-3xl text-green-700 w-20 text-center">Engineer</p>
                        ) : u?.role === "Admin" ? (
                          <p className="rounded-3xl text-orange-600 bg-amber-100 w-15 text-center">Admin</p>
                        ) : null
                      )}
                    </td>
                    <td className="p-4 border-b border-gray-300">
                      {u?.isWork ? (
                        <p className="bg-green-100 rounded-3xl text-green-700 w-15 text-center">Active</p>
                      ) : (
                        <p className="bg-red-100 rounded-3xl text-red-700 w-15 text-center">Inactive</p>
                      )}
                    </td>
                    <td className="p-4 border-b border-gray-300">
                      {u?.tasksAssigned} 
                    </td>
                  </tr>
                   ))
                 ):( 
                  <tr>
                    <td className="p-4 border-b border-gray-300 text-gray-700 text-center" colSpan={8}>
                      No Users Data Available
                    </td>
                  </tr>
                )} 
              </tbody>
            </table>
    
            {/*  user deatils */} 
    
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
                      ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'text-black border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer'
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-600">{page} / {totalPages}</span>
                <button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-md border ${
                    page === totalPages
                      ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                      : 'text-black border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer'
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
                : 'No users available'}
          </div>
        </>
  )
}

export default DeletedUserTable