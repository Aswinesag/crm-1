import React, { useState, useEffect, useMemo } from "react";
import { LiaClipboardListSolid } from "react-icons/lia";
import { HiUsers } from "react-icons/hi";
import { IoSearchOutline } from "react-icons/io5";
import { FaFilePdf, FaFileExcel, FaSpinner } from "react-icons/fa";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const Report = () => {
  const users = useSelector((state) => state.users?.users || []);
  const [formData, setFormData] = useState({
    reportType: "overall",
    userType: "all",
    selectedUser: "all",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
    sortBy: "name"
  });

  const [loading, setLoading] = useState(false);
  const [reportPreview, setReportPreview] = useState(null);

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFormData((prev) => ({
      ...prev,
      dateFrom: firstDay.toISOString().split("T")[0],
      dateTo: lastDay.toISOString().split("T")[0]
    }));
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (formData.userType === "all") return user.role !== "Super Admin";
      if (formData.userType === "coordinator") return user.role === "Coordinator";
      if (formData.userType === "engineer") return user.role === "Engineer";
      return false;
    });
  }, [users, formData.userType]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "userType" && { selectedUser: "all" })
    }));
  };

  const validateForm = () => {
    if (!formData.dateFrom || !formData.dateTo) {
      toast.error("Please select date range");
      return false;
    }
    if (new Date(formData.dateFrom) > new Date(formData.dateTo)) {
      toast.error("Start date cannot be after end date");
      return false;
    }
    return true;
  };

  const generateReportPreview = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await axiosInstance.post("/reports/preview", formData);
      setReportPreview(response.data.data);
      toast.success("Report preview generated!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to generate preview");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/reports/download/${format}`, formData, {
        responseType: "blob"
      });

      const blob = new Blob([response.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const extensionMap = { excel: "xlsx", pdf: "pdf" };
      const fileExtension = extensionMap[format] || format;
      const fileName = `${formData.reportType}_report_${formData.dateFrom}_to_${formData.dateTo}.${fileExtension}`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const formatName = format === "excel" ? "XLSX" : format.toUpperCase();
      toast.success(`${formatName} report downloaded successfully!`);
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to download ${format} report`);
    } finally {
      setLoading(false);
    }
  };

  const shouldShowAnalysis = () => formData.reportType === "overall" || formData.reportType === "analysis-only";
  const shouldShowLeadsList = () => formData.reportType === "overall" || formData.reportType === "leads-only";

  return (
    <div className="p-6">
      <Toaster />

      <div className="flex gap-4 items-center mb-4">
        <div className="bg-orange-100 w-12 h-12 rounded-lg flex justify-center items-center text-orange-500">
          <LiaClipboardListSolid size={24} />
        </div>
        <div>
          <h1 className="font-bold text-2xl text-gray-800">Performance Reports</h1>
          <p className="text-gray-600">Generate detailed analytics and performance reports</p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Report Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Report Type</label>
            <select
              value={formData.reportType}
              onChange={(e) => handleInputChange("reportType", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            >
              <option value="overall">Overall Lead Report (Analysis + Leads)</option>
              <option value="leads-only">Leads List Only</option>
              <option value="analysis-only">Analysis Only</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Filter by Role</label>
            <select
              value={formData.userType}
              onChange={(e) => handleInputChange("userType", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            >
              <option value="all">All Users</option>
              <option value="coordinator">All Coordinators</option>
              <option value="engineer">All Engineers</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Select Specific User</label>
            <select
              value={formData.selectedUser}
              onChange={(e) => handleInputChange("selectedUser", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            >
              <option value="all">
                All{" "}
                {formData.userType === "all"
                  ? "Users"
                  : formData.userType === "coordinator"
                  ? "Coordinators"
                  : "Engineers"}
              </option>
              {filteredUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Sort By</label>
            <select
              value={formData.sortBy}
              onChange={(e) => handleInputChange("sortBy", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            >
              <option value="name">Name</option>
              <option value="performance">Performance</option>
              <option value="leads_count">Leads Count</option>
              <option value="conversion_rate">Conversion Rate</option>
              <option value="date">Date Created</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={formData.dateFrom}
              onChange={(e) => handleInputChange("dateFrom", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={formData.dateTo}
              onChange={(e) => handleInputChange("dateTo", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-medium text-gray-700">Search Filter</label>
            <div className="border border-gray-300 rounded-lg px-3 py-2 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 flex gap-2 items-center transition-all">
              <IoSearchOutline className="text-gray-400" />
              <input
                type="text"
                value={formData.searchTerm}
                onChange={(e) => handleInputChange("searchTerm", e.target.value)}
                placeholder="Search by name, company, or email..."
                className="outline-none flex-1"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-1">Report Description:</h4>
          <p className="text-sm text-blue-800">
            {formData.reportType === "overall" &&
              "Complete report with performance analysis and detailed leads list. Can be filtered by role or specific user."}
            {formData.reportType === "leads-only" &&
              "Detailed list of leads only with all lead information. Perfect for data export and lead management."}
            {formData.reportType === "analysis-only" &&
              "Performance analysis and metrics only without individual lead details. Ideal for management reviews."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
          <button
            onClick={generateReportPreview}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex gap-2 items-center transition-colors disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <HiUsers />}
            Preview Report
          </button>

          <button
            onClick={() => downloadReport("pdf")}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex gap-2 items-center transition-colors disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
            Download PDF
          </button>

          <button
            onClick={() => downloadReport("excel")}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex gap-2 items-center transition-colors disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaFileExcel />}
            Export Excel
          </button>
        </div>
      </div>

      {reportPreview && (
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Report Preview</h2>
            <div className="text-sm text-gray-500">
              Report Type:{" "}
              <span className="font-medium capitalize">
                {reportPreview.reportType?.replace("-", " ") || formData.reportType.replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600 mb-1">Total Leads</h3>
              <p className="text-2xl font-bold text-blue-700">{reportPreview.summary?.totalLeads || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600 mb-1">Converted</h3>
              <p className="text-2xl font-bold text-green-700">{reportPreview.summary?.converted || 0}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-orange-600 mb-1">In Progress</h3>
              <p className="text-2xl font-bold text-orange-700">{reportPreview.summary?.inProgress || 0}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-600 mb-1">Lost</h3>
              <p className="text-2xl font-bold text-red-700">{reportPreview.summary?.failed || 0}</p>
            </div>
          </div>

          {(formData.reportType === "overall" || formData.reportType === "analysis-only") &&
            reportPreview.performanceData?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Role</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Total Leads</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Converted</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">In Progress</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Lost</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportPreview.performanceData.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">{user.name}</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.role === "Coordinator"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-right">{user.totalLeads}</td>
                          <td className="border border-gray-200 px-4 py-2 text-right text-green-600">
                            {user.converted}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-right text-orange-600">
                            {user.inProgress}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-right text-red-600">{user.failed}</td>
                          <td className="border border-gray-200 px-4 py-2 text-right font-medium">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.conversionRate >= 50
                                  ? "bg-green-100 text-green-800"
                                  : user.conversionRate >= 25
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.conversionRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {(formData.reportType === "overall" || formData.reportType === "leads-only") &&
            reportPreview.individualLeads?.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Individual Leads ({reportPreview.individualLeads.length})
                  </h3>
                  <span className="text-sm text-gray-500">Showing first 10 records</span>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full border-collapse border border-gray-200 text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="border border-gray-200 px-3 py-2 text-left">Name</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Email</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Company</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Status</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Priority</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Source</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Assigned To</th>
                        <th className="border border-gray-200 px-3 py-2 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportPreview.individualLeads.slice(0, 10).map((lead, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-3 py-2 font-medium">{lead.name}</td>
                          <td className="border border-gray-200 px-3 py-2 text-blue-600">{lead.email}</td>
                          <td className="border border-gray-200 px-3 py-2">{lead.company}</td>
                          <td className="border border-gray-200 px-3 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                lead.status === "Converted"
                                  ? "bg-green-100 text-green-800"
                                  : lead.status === "Lost"
                                  ? "bg-red-100 text-red-800"
                                  : lead.status === "Work In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                lead.priority === "High"
                                  ? "bg-red-100 text-red-800"
                                  : lead.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {lead.priority}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-3 py-2">{lead.source}</td>
                          <td className="border border-gray-200 px-3 py-2">
                            {lead.assignedTo ? (
                              <span className="text-gray-900">{lead.assignedTo}</span>
                            ) : (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {!reportPreview.individualLeads?.length && !reportPreview.performanceData?.length && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">📊</div>
              <h3 className="text-lg font-medium text-gray-600 mb-1">No Data Available</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or date range to see results.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Report;