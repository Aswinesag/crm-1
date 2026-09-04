import React, { useEffect, useState } from "react";

import {
  autoGeneratePR,
  getAllPR,
  approvePR,
} from "../api/procurementApi";

const PurchaseRequest = () => {
  const [prs, setPRs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(null);
  const [error, setError] = useState("");

  // ==============================
  // LOAD PURCHASE REQUESTS
  // ==============================

  const fetchPRs = async () => {
    
    try {
      setLoading(true);
      setError("");

      const response = await getAllPR();

      // SAFE DATA HANDLING
      const prData = response?.data || [];

      console.log("PR API Response:", response);
      console.log("PR Data:", response?.data);

      setPRs(Array.isArray(prData) ? prData : []);

      console.log("prData =", prData);
      console.log("Is Array =", Array.isArray(prData));
    } catch (error) {
      console.error("Fetch PR Error:", error);

      setError(
        error?.response?.data?.message |
          "Failed to load Purchase Requests"
      );

      setPRs([]);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // AUTO GENERATE PR
  // ==============================

  const handleGeneratePR = async () => {
    try {
      setGenerateLoading(true);

      await autoGeneratePR();

      await fetchPRs();

      alert("Purchase Request Generated Successfully");
    } catch (error) {
      console.error("Generate PR Error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to Generate PR"
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  // ==============================
  // APPROVE PR
  // ==============================

  const handleApprove = async (id) => {
    try {
      setApproveLoading(id);

      await approvePR(id);

      await fetchPRs();

      alert("PR Approved Successfully");
    } catch (error) {
      console.error("Approve PR Error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to Approve PR"
      );
    } finally {
      setApproveLoading(null);
    }
  };

  // ==============================
  // PAGE LOAD
  // ==============================

  useEffect(() => {
    fetchPRs();
  }, []);

  return (
    <div className="p-5">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-5">

        <h1 className="text-2xl font-bold">
          Purchase Requests
        </h1>

        <button
          onClick={handleGeneratePR}
          disabled={generateLoading}
          className={`px-4 py-2 rounded text-white ${
            generateLoading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {generateLoading
            ? "Generating..."
            : "Generate PR"}
        </button>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="text-center py-10 text-lg font-semibold">
          Loading Purchase Requests...
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full border border-gray-300">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-3 text-left">
                  PR Number
                </th>

                <th className="border p-3 text-left">
                  Material
                </th>

                <th className="border p-3 text-left">
                  Quantity
                </th>

                <th className="border p-3 text-left">
                  Status
                </th>

                <th className="border p-3 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {Array.isArray(prs) && prs.length > 0 ? (
                prs.map((pr) => (

                  <tr
                    key={pr._id}
                    className="hover:bg-gray-50"
                  >

                    <td className="border p-3">
                      {pr?.prNumber || "N/A"}
                    </td>

                    <td className="border p-3">
                      {pr?.materialId?.materialName || "No Material"}
                    </td>

                    <td className="border p-3">
                      {pr?.quantity || 0}
                    </td>

                    <td className="border p-3">

                      <span
                        className={`px-2 py-1 rounded text-white text-sm ${
                          pr?.status === "APPROVED"
                            ? "bg-green-500"
                            : pr?.status === "REJECTED"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {pr?.status || "Pending"}
                      </span>

                    </td>

                    <td className="border p-3 text-center">

                      <button
                        onClick={() =>
                          handleApprove(pr._id)
                        }
                        disabled={
                          approveLoading === pr._id ||
                          pr?.status ===
                            "APPROVED"
                        }
                        className={`px-3 py-1 rounded text-white ${
                          pr?.status ===
                          "APPROVED"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {approveLoading === pr._id
                          ? "Approving..."
                          : pr?.status ===
                            "APPROVED"
                          ? "Approved"
                          : "Approve"}
                      </button>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>

                  <td
                    colSpan="5"
                    className="text-center p-5 text-gray-500"
                  >
                    No Purchase Requests Found
                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}
    </div>
  );
};

export default PurchaseRequest;