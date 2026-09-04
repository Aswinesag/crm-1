import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { Link} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const DataLeads = () => {

  const leadsLength = 5;

  const [page,setPage]=useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalPages = Math.ceil(leadsLength / rowsPerPage);

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  const handlePrevious = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <>
      <div className="overflow-x-auto w-auto rounded-md bg-white shadow-md">
        <table className="w-full border-b border-gray-300 rounded-md text-sm text-left  ">
          <thead className="bg-white text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">Lead Name</th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">Email</th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">Phone</th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">Company Name</th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">Priority</th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">Status</th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">Assigned To</th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">Date</th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
              {/* for all users */}
              <tr className="hover:bg-gray-50">

                <td className="p-3 border-b border-gray-300 text-blue-700">
                  <Link to={'/leadsView'}>{"leadName"}</Link>
                </td>

                <td className="p-3 border-b border-gray-300">
                  {"email"}
                </td>

                <td className="p-3 border-b border-gray-300">
                  {"phone"}
                </td>

                <td className="p-3 border-b border-gray-300">
                  {"ABC Company"}
                </td>

                <td className="p-3 border-b border-gray-300">
                  {"priority"}
                </td>

                <td className="p-3 border-b border-gray-300 ">
                  <div className="bg-amber-100 text-amber-900 rounded-full max-w-fit px-2">
                    <select name="" id="" className="focus:outline-hidden">
                        <option value="Yet to Start">Yet to Start</option>
                        <option value="Work In Progress">Work In Progress</option>
                        <option value="Opportunity">Qualified</option>
                        <option value="Lost">Not Qualified</option>
                    </select>
                  </div>
                </td>

                <td className="p-3 border-b border-gray-300">
                  <select name="" id="" className="focus:outline-hidden">
                    <option value="">Select Engineer</option>
                    <option value="engineers">engineers</option>
                  </select>
                </td>

                <td className="p-3 border-b border-gray-300 ">
                  {"date"}
                </td>
                <td className="p-3 border-b border-gray-300">
                  <button className="hover:bg-gray-200 px-3 py-2 cursor-pointer"><MdDelete size={20} className="text-red-500"/></button>
                </td>

              </tr>
              <tr>
                <td className="p-4 border-b border-gray-300 text-gray-700 text-center" colSpan={8}>
                  No Leads Data Available
                </td>
              </tr>

          </tbody>
        </table>
        <div className="flex justify-between p-3">
          <div className="flex gap-2 items-center">
            <p className="text-gray-600">Rows per page</p>
            <select name="" id="" className="text-gray-600" value={rowsPerPage}
              onChange={handleRowsChange}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
          <div className="flex gap-2 text-gray-600">
            <button
              className={`px-3 py-1 rounded ${
                page === 1
                  ? "cursor-not-allowed text-gray-300"
                  : "cursor-pointer text-gray-700 hover:bg-gray-100"
              }`}
              onClick={handlePrevious}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className={`px-3 py-1 rounded ${
                page === totalPages || totalPages === 0
                  ? "cursor-not-allowed text-gray-300"
                  : "cursor-pointer text-gray-700 hover:bg-gray-100"
              }`}
              onClick={handleNext}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
        <Toaster/>
      </div>
    </>
  );
};

export default DataLeads;
