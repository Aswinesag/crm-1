import React, {
  useEffect,
  useState,
} from "react";

import Card from "../../components/Card";

import StockAuditModal from "../../components/StockAuditModal";

import { IoIosSearch } from "react-icons/io";

import { MdDelete } from "react-icons/md";

import {
  createStockAudit,
  getStockAudits,
  deleteStockAudit,
} from "../../services/stockAuditService";

const StockAudit = () => {

  // ==========================================
  // STATE VARIABLES
  // ==========================================

  const [stockAudits, setStockAudits] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [showModal, setShowModal] =
    useState(false);

  const [formData, setFormData] =
    useState({

      auditDate: "",

      warehouse: "",

      material: "",

      systemStock: "",

      physicalStock: "",

      difference: "",

      auditor: "",

      status: "Pending",

      remarks: "",

    });

  // ==========================================
  // FETCH STOCK AUDITS
  // ==========================================

  const fetchStockAudits = async () => {

    try {

      setLoading(true);

      const response =
        await getStockAudits(
          page,
          10,
          search
        );

      console.log(response);

      setStockAudits(
        response.data || []
      );

      setTotalPages(
        response.totalPages || 1
      );

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Failed to load Stock Audits."

      );

    }

    finally {

      setLoading(false);

    }

  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {

    fetchStockAudits();

  }, [page]);
    // ==========================================
  // ADD BUTTON
  // ==========================================

  const handleAdd = () => {

    setFormData({

      auditDate: new Date()
        .toISOString()
        .split("T")[0],

      warehouse: "",

      material: "",

      systemStock: "",

      physicalStock: "",

      difference: 0,

      auditor: "",

      status: "Pending",

      remarks: "",

    });

    setShowModal(true);

  };

  // ==========================================
  // SAVE STOCK AUDIT
  // ==========================================

  const handleSubmit = async () => {

    try {

      // ===============================
      // VALIDATION
      // ===============================

      if (!formData.auditDate) {

        return alert(
          "Audit Date is required."
        );

      }

      if (!formData.warehouse) {

        return alert(
          "Please select Warehouse."
        );

      }

      if (!formData.material) {

        return alert(
          "Please select Raw Material."
        );

      }

      if (
        formData.systemStock === "" ||
        Number(formData.systemStock) < 0
      ) {

        return alert(
          "Please enter a valid System Stock."
        );

      }

      if (
        formData.physicalStock === "" ||
        Number(formData.physicalStock) < 0
      ) {

        return alert(
          "Please enter a valid Physical Stock."
        );

      }

      if (!formData.auditor.trim()) {

        return alert(
          "Auditor Name is required."
        );

      }

      console.log({

        auditDate: formData.auditDate,

        warehouse: formData.warehouse,

        material: formData.material,

        systemStock: Number(
          formData.systemStock
        ),

        physicalStock: Number(
          formData.physicalStock
        ),

        difference:
          Number(formData.physicalStock) -
          Number(formData.systemStock),

        auditor: formData.auditor,

        status: formData.status,

        remarks: formData.remarks,

      });

      await createStockAudit({

        auditDate: formData.auditDate,

        warehouse: formData.warehouse,

        material: formData.material,

        systemStock: Number(
          formData.systemStock
        ),

        physicalStock: Number(
          formData.physicalStock
        ),

        difference:
          Number(formData.physicalStock) -
          Number(formData.systemStock),

        auditor: formData.auditor,

        status: formData.status,

        remarks: formData.remarks,

      });

      alert(
        "Stock Audit Created Successfully."
      );

      setShowModal(false);

      fetchStockAudits();

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Unable to create Stock Audit."

      );

    }

  };
    // ==========================================
  // DELETE STOCK AUDIT
  // ==========================================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this Stock Audit?"
      );

    if (!confirmDelete)
      return;

    try {

      await deleteStockAudit(id);

      alert(
        "Stock Audit Deleted Successfully."
      );

      fetchStockAudits();

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Unable to delete Stock Audit."

      );

    }

  };

  // ==========================================
  // CARD CALCULATIONS
  // ==========================================

  const totalAudits =
    stockAudits.length;

  const totalDifference =
    stockAudits.reduce(

      (total, item) =>

        total +
        Number(item.difference || 0),

      0

    );

  const pendingAudits =
    stockAudits.filter(

      (item) =>

        item.status === "Pending"

    ).length;

  const completedAudits =
    stockAudits.filter(

      (item) =>

        item.status === "Completed"

    ).length;

  const approvedAudits =
    stockAudits.filter(

      (item) =>

        item.status === "Approved"

    ).length;

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const todayAudits =
    stockAudits.filter(

      (item) =>

        item.auditDate?.substring(0, 10) === today

    ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="p-5">

        Loading...

      </div>

    );

  }
    // ==========================================
  // JSX
  // ==========================================

  return (

    <>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="flex flex-wrap gap-3 mt-4">

        <Card
          title="Total Audits"
          count={totalAudits}
          bg="#EFF6FF"
          color="#2563EB"
        />

        <Card
          title="Today's Audits"
          count={todayAudits}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Pending Audits"
          count={pendingAudits}
          bg="#FEF3C7"
          color="#D97706"
        />

        <Card
          title="Completed Audits"
          count={completedAudits}
          bg="#ECFDF5"
          color="#059669"
        />

        <Card
          title="Approved Audits"
          count={approvedAudits}
          bg="#EEF2FF"
          color="#4338CA"
        />

        <Card
          title="Total Difference"
          count={totalDifference}
          bg="#FFF7ED"
          color="#EA580C"
        />

      </div>

      {/* ==========================================
          SEARCH & ADD BUTTON
      ========================================== */}

      <div className="flex justify-between items-center mt-6 mb-5">

        {/* Search Box */}

        <div className="relative w-full max-w-md">

          <IoIosSearch
            size={22}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search Audit Number / Material / Auditor"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />

        </div>

        {/* Buttons */}

        <div className="flex gap-2">

          <button
            onClick={fetchStockAudits}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >

            Search

          </button>

          <button
            onClick={handleAdd}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md hover:bg-orange-600"
          >

            + Add Audit

          </button>

        </div>

      </div>
            {/* ==========================================
          STOCK AUDIT TABLE
      ========================================== */}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Audit No.
              </th>

              <th className="p-3 text-left">
                Audit Date
              </th>

              <th className="p-3 text-left">
                Warehouse
              </th>

              <th className="p-3 text-left">
                Material
              </th>

              <th className="p-3 text-right">
                System Stock
              </th>

              <th className="p-3 text-right">
                Physical Stock
              </th>

              <th className="p-3 text-right">
                Difference
              </th>

              <th className="p-3 text-left">
                Auditor
              </th>

              <th className="p-3 text-center">
                Status
              </th>

              <th className="p-3 text-left">
                Remarks
              </th>

              <th className="p-3 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {

              stockAudits.length > 0 ?

              (

                stockAudits.map(

                  (audit, index) => (

                    <tr
                      key={audit._id}
                      className="border-t hover:bg-gray-50"
                    >

                      {/* Serial Number */}

                      <td className="p-3">

                        {(page - 1) * 10 + index + 1}

                      </td>

                      {/* Audit Number */}

                      <td className="p-3 font-medium">

                        {audit.auditNumber}

                      </td>

                      {/* Audit Date */}

                      <td className="p-3">

                        {

                          audit.auditDate

                            ? new Date(
                                audit.auditDate
                              ).toLocaleDateString()

                            : "-"

                        }

                      </td>

                      {/* Warehouse */}

                      <td className="p-3">

                        {

                          audit.warehouse?.warehouseName ||

                          "-"

                        }

                      </td>

                      {/* Material */}

                      <td className="p-3">

                        {

                          audit.material?.materialName ||

                          "-"

                        }

                      </td>

                      {/* System Stock */}

                      <td className="p-3 text-right">

                        {audit.systemStock}

                      </td>

                      {/* Physical Stock */}

                      <td className="p-3 text-right">

                        {audit.physicalStock}

                      </td>

                      {/* Difference */}

                      <td
                        className={`p-3 text-right font-semibold ${
                          Number(audit.difference) > 0
                            ? "text-green-600"
                            : Number(audit.difference) < 0
                            ? "text-red-600"
                            : "text-gray-700"
                        }`}
                      >

                        {audit.difference}

                      </td>

                      {/* Auditor */}

                      <td className="p-3">

                        {audit.auditor}

                      </td>

                      {/* Status */}

                      <td className="p-3 text-center">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium
                          ${
                            audit.status === "Pending"

                              ? "bg-yellow-100 text-yellow-700"

                              : audit.status === "Completed"

                              ? "bg-green-100 text-green-700"

                              : "bg-blue-100 text-blue-700"
                          }`}
                        >

                          {audit.status}

                        </span>

                      </td>

                      {/* Remarks */}

                      <td className="p-3">

                        {

                          audit.remarks ||

                          "-"

                        }

                      </td>

                      {/* Actions */}

                      <td className="p-3">

                        <div className="flex justify-center">

                          <MdDelete
                            className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                            onClick={() =>
                              handleDelete(
                                audit._id
                              )
                            }
                          />

                        </div>

                      </td>

                    </tr>

                  )

                )

              )

              :

              (

                <tr>

                  <td
                    colSpan="12"
                    className="text-center py-8 text-gray-500"
                  >

                    No Stock Audits Found

                  </td>

                </tr>

              )

            }

          </tbody>

        </table>

      </div>
            {/* ==========================================
          PAGINATION
      ========================================== */}

      <div className="flex justify-between items-center p-4 border-t">

        <span>

          Page {page} of {totalPages}

        </span>

        <div className="flex gap-3">

          <button
            disabled={page === 1}
            onClick={() =>
              setPage(page - 1)
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >

            Previous

          </button>

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage(page + 1)
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >

            Next

          </button>

        </div>

      </div>

      {/* ==========================================
          STOCK AUDIT MODAL
      ========================================== */}

      <StockAuditModal
        isOpen={showModal}
        onClose={() =>
          setShowModal(false)
        }
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
      />

    </>

  );

};

export default StockAudit;