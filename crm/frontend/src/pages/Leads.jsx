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
  updateAssignedToapi
} from "../api/fetchdata.jsx";
import { setEngineerTaskCounts } from "../redux/leadSlice.jsx";
import axiosInstance from "../api/axiosInstance.jsx";
import { PencilIcon } from "@heroicons/react/24/outline";
import { FaEye } from "react-icons/fa";


const Leads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // NEW state for upload loader
  const [uploading, setUploading] = useState(false);

  const updateAssignedTo = async (leadId, newAssignedTo) => {
    try {
      console.log("Updating lead:", leadId, "to", newAssignedTo);
      const updated = await updateAssignedToapi(leadId, {
        assignedTo: newAssignedTo.name,
        engineer_id: newAssignedTo.id,
      });

      if (updated) {
        dispatch(
          updateLead({
            id: leadId,
            changes: {
              assignedTo: newAssignedTo.name,
              engineer_id: newAssignedTo.id,
            },
          })
        );
      }
      toast.success("Engineer assigned successfully")
      const data = await fetchEngineersWithTaskCount();
      dispatch(setEngineerTaskCounts(data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update assigned engineer");
    }
  };

  const dummyLeads = useSelector((state) => state.leads.leads);
  console.log(dummyLeads);
  const engineerTaskCounts = useSelector(
    (state) => state.leads.engineer_taskCounts
  );

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const LeadsFiltered = dummyLeads.filter((lead) =>
    ["Yet to Start", "Work In Progress", "Lost"].includes(lead.status)
  );

  const filteredLeads = LeadsFiltered.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter ? lead.status === statusFilter : true;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [showNotQualifiedModal, setShowNotQualifiedModal] = useState(false);
  const [notQualifiedLead, setNotQualifiedLead] = useState(null);
  const [failedReason, setFailedReason] = useState("");
  const [failedMessage, setFailedMessage] = useState("");
  const [failedDate, setFailedDate] = useState(new Date().toISOString().slice(0, 10));

  const openDeleteModal = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  const totalLeads = dummyLeads.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayLeads = dummyLeads.filter(l => l.createdAt?.split("T")[0] === today).length;
  const inProgress = dummyLeads.filter(
    (l) => l.status === "Work In Progress"
  ).length;
  const qualifiedLeads = dummyLeads.filter(
    (l) => ['Opportunity','Enquiry','Quotation','Follow-up','Converted'].includes(l.status)
  ).length;
  const notQualified = dummyLeads.filter((l) => ["Lost"].includes(l.status)).length;

  const closeDeleteModal = () => {
    setLeadToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      const updated = await updateLeadStatus(leadToDelete._id, {
        status: "deleted",
      });
      dispatch(updateLead({ id: leadToDelete._id, changes: updated }));
      toast.success(`Lead "${leadToDelete.name}" marked as Deleted`);
      closeDeleteModal();
    } catch (error) {
      toast.error("Lost to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  const sortedLeads = [...filteredLeads].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const paginatedLeads = sortedLeads.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleChange = (lead) => async (e) => {
    try {
      const newStatus = e.target.value;

      if (newStatus === "Lost") {
        setNotQualifiedLead(lead);
        setFailedReason("");
        setFailedMessage("");
        setFailedDate(new Date().toISOString().slice(0, 10));
        setShowNotQualifiedModal(true);
        return;
      }

      if (newStatus === "Opportunity" && !lead.assignedTo) {
        toast('Please assign an engineer before changing status to Qualified.', {
          icon: '⚠️',
          style: {
            color: 'black',
          },
        });
        return;
      }

      const updated = await updateLeadStatus(lead._id, { status: newStatus });
      dispatch(updateLead({ id: lead._id, changes: { status: updated.status } }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error("Not authorized to update this lead.");
      } else {
        toast.error("Failed to update lead.");
      }
    }
  };

  const handleUploadLeads = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setUploading(true); // show loader

        const formData = new FormData();
        formData.append("excel", file);

        const res = await axiosInstance.post('/leads/upload-Leads', formData,{
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(res.data.message);
        window.location.reload()
      } catch (err) {
        if(err?.response?.data?.message){
          toast.error(err.response.data.message)
        }
      } finally {
        setUploading(false); // hide loader
      }
    };
    input.click();
  };

  return (
    <div className="mt-4" id="table-width-fixed">
      <Toaster />

      {/* Upload Loader Overlay */}
      {uploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="loader border-4 border-t-4 border-orange-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
            <p className="text-gray-700">Uploading Leads...</p>
          </div>
        </div>
      )}

      {/* rest of your original JSX below … */}
      {/* I didn’t touch anything else here */}


      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Leads </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total leads"
          count={totalLeads}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Today Leads"
          count={todayLeads}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="In Progress"
          count={inProgress}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        {/* Uncomment if needed: */}
         <Card title="Qualified Leads" count={qualifiedLeads} bg="#F0FDF4" color="#15803D" />
        {/* <Card title="Recently Modified Leads" count={recentlyModified} bg="#EEF2FF" color="#4338CA" /> */}
        <Card
          title="Not Qualified"
          count={notQualified}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
      </div>

      {/* Search + Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-6 mt-6">
        <div className="relative w-full max-w-md cursor-pointer">
          <IoIosSearch
            size={22}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex gap-2 flex-col xl:flex-row items-center">
          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            {/* <option value="Yet to Start">Yet </option> */}
            <option value="Work In Progress">Work In Progress</option>
            {/* <option value="Qualified">Qualified</option> */}
            <option value="Lost">Not Qualified</option>
          </select>

          <Link to="/leads/create">
            <div className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer">
              <div>+</div>
              <button className="cursor-pointer">Create Leads</button>
            </div>
          </Link>

          <div className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer">
            <GoUpload />
            <button type="button" className="cursor-pointer" onClick={handleUploadLeads}>Upload Leads</button>
          </div>
        </div>
      </div>

      {/* Leads Table Wrapper */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Lead Name
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Email
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Phone
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Company Name
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Priority
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Status
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Assigned To
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tr-md">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.length > 0 ? (
              paginatedLeads.map((lead, index) => (
                <tr key={index} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700">
                    <Link to={`/view/lead/${lead._id}`}>{lead.name}</Link>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <a
                      href={`mailto:${lead.email}`}
                      className="outline-none w-full hover:text-blue-600 hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <a
                      href={`tel:${lead.phone}`}
                      className="outline-none w-full hover:text-blue-600 hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {lead.company}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {lead.priority}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      className="bg-blue-100 border-2 border-blue-300 rounded-md px-2 py-1 focus:outline-none"
                      value={lead.status}
                      onChange={handleChange(lead)}
                    >
                      {/* <option value="Yet to Start">Yet to Start</option> */}
                      <option value="Work In Progress">Work In Progress</option>
                      <option value="Opportunity">Qualified</option>
                      <option value="Lost">Not Qualified</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      className="bg-yellow-100 border-2 border-yellow-300 rounded-md px-2 py-1 focus:outline-none"
                      value={
                        lead.assignedTo
                          ? JSON.stringify({
                              name: lead.assignedTo,
                              id: lead.engineer_id,
                            })
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          // Clear assignment or handle unassigning engineer
                          updateAssignedTo(lead._id, { name: "", id: null });
                          return;
                        }
                        try {
                          const selectedEngineer = JSON.parse(value);
                          console.log("Selected Engineer:", selectedEngineer);
                          updateAssignedTo(lead._id, selectedEngineer);
                        } catch {
                          toast.error("Invalid engineer selection");
                        }
                      }}
                    >
                      <option value="">Select Engineer</option>
                      {engineerTaskCounts.map((eng, idx) => (
                        <option
                          key={idx}
                          value={JSON.stringify({
                            name: eng.name,
                            id: eng._id,
                          })}
                        >
                          {eng.name} ({eng.assignedTaskCount})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {lead.createdAt?.split("T")[0]}
                  </td>
                      <td className="p-3 border-b border-gray-300">
                  <div className="flex items-center gap-3">
                    
                    {/* VIEW ICON */}
                    <FaEye
                      className="text-blue-500 cursor-pointer hover:scale-110 transition"
                      onClick={() => navigate(`/view/lead/${lead._id}`)}
                    />

                    {/* DELETE ICON */}
                    <MdDelete
                      className="text-red-500 cursor-pointer hover:scale-110 transition"
                      onClick={() => openDeleteModal(lead)}
                    />

                  </div>
                </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 bg-white border-gray-300 text-gray-700 text-center"
                  colSpan={9}
                >
                  No Leads Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNotQualifiedModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4 text-center">Not Qualified Details</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Lost Reason</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                  type="text"
                  className="outline-none w-full"
                  value={failedReason} onChange={e => setFailedReason(e.target.value)}
                  placeholder="Lost Reason"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Lost Message</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                  type="text"
                  className="outline-none w-full"
                  value={failedMessage} onChange={e => setFailedMessage(e.target.value)}
                  placeholder="Lost Message"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Date</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                  type="date"
                  className="outline-none w-full"
                  value={failedDate} onChange={e => setFailedDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setShowNotQualifiedModal(false)} className="px-4 py-2 border border-gray-400 rounded cursor-pointer">Cancel</button>
              <button
                onClick={async () => {
                  if (!failedReason || !failedDate) {
                    toast.error("Please enter required fields.");
                    return;
                  }
                  try {
                    const updated = await updateLeadStatus(notQualifiedLead._id, {
                      status: "Lost",
                      failedReason,
                      failedMessage,
                      failedDate,
                    });
                    dispatch(updateLead({ id: notQualifiedLead._id, changes: updated }));
                    setShowNotQualifiedModal(false);
                    toast.success("Lead marked as Not Qualified.");
                  } catch (err) {
                    toast.error("Lost to update lead.");
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Pagination */}
      <div className="flex flex-col bg-white md:flex-row justify-between items-center p-3 gap-3 md:gap-0 rounded-b-md shadow-md border-gray-300">
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete lead "{leadToDelete?.name}"? This
              will mark the lead as Deleted.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white disabled:opacity-60 cursor-pointer"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default Leads;


//   const [basicDetails,setBasicDetails] = useState(true)
//   const [qualificationDetails,setQualificationDetails] = useState(false)
//   const [experienceDetails,setExperienceDetails] = useState(false)
//   const [emergencyDetails,setEmergencyDetails] = useState(false)

//   return(
//     <>
//     <div>
//       <h1>Employee Details</h1>
//       <div>
//         <div onClick={()=>{
//         setBasicDetails(true);
//         setQualificationDetails(false);
//         setExperienceDetails(false);
//         setEmergencyDetails(false);
//         }}>Basic Details
//         </div>

//         <div onClick={()=>{
//         setBasicDetails(false);
//         setQualificationDetails(true);
//         setExperienceDetails(false);
//         setEmergencyDetails(false);
//         }}>Qualification Details
//         </div>

//         <div onClick={()=>{
//         setBasicDetails(false);
//         setQualificationDetails(false);
//         setExperienceDetails(true);
//         setEmergencyDetails(false); 
//         }}>Experience Details
//         </div>

//         <div onClick={()=>{
//         setBasicDetails(false);
//         setQualificationDetails(false);
//         setExperienceDetails(false);
//         setEmergencyDetails(true); 
//         }}>Emergency Details
//         </div>
//       </div>

//       <div>
//         {basicDetails && (
//           <div>
//             <span>Employee Name: Subash L</span>
//             <span>Date of Birth: 12/05/1998</span>
//             <span>Gender: Male</span>
//             <span>Blood Group: A+</span>
//             <span>Addres: 93, MGR Nagar, kovaipudur, covai-42</span>
//             <span>Marital Status: Single</span>
//             <span>Nationality : India</span>
//           </div>
//         )}
//         {qualificationDetails && (
//           <div>
//             <span>Employee Name: Subash L</span>
//             <span>Highest Qualification : Mater's Degree</span>
//             <span>Degree : M.Sc</span>
//             <span>Specialization : Information Technology</span>
//             <span>Year of Passing : 2022</span>
//             <span>Institution/University Name: Hindustan College of arts and Science</span>
//             <span>Location : Coimbatore</span>
//           </div>
//         )}
//         {experienceDetails && (
//           <div>
//             <span>Employee Name : Subash L</span>
//             <span>Company Name: xxxx</span>
//             <span>Job Role: xxxx</span>
//             <span>Dates : 12/05/2016 to present</span>
//           </div> 
//         )}
//         {emergencyDetails && (
//           <div>
//             <span>emergencyDetails details</span>
//           </div>  
//         )}
//       </div>
//     </div> 
//     </>
//   )