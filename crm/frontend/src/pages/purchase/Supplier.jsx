import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import SupplierModal from "../../components/SupplierModal";

import { IoIosSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { PencilIcon } from "@heroicons/react/24/outline";

import {
  getSuppliers,
  deleteSupplier,
  activateSupplier,
  deactivateSupplier,
} from "../../services/supplierService";

const Supplier = () => {

  // ============================================
  // STATES
  // ============================================

  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const limit = 10;

  const [totalPages, setTotalPages] = useState(1);

  const [totalRecords, setTotalRecords] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // ============================================
  // FETCH SUPPLIERS
  // ============================================

  const fetchSuppliers = async () => {

    try {

      setLoading(true);

      const response = await getSuppliers(
        page,
        limit,
        search
      );

      setSuppliers(response.data.data || []);

      setTotalPages(response.data.totalPages || 1);

      setTotalRecords(response.data.totalRecords || 0);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  // ============================================
  // LOAD DATA
  // ============================================

  useEffect(() => {

    fetchSuppliers();

  }, [page, search]);

  // ============================================
  // DELETE SUPPLIER
  // ============================================

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this Supplier?"
    );

    if (!confirmDelete) return;

    try {

      await deleteSupplier(id);

      fetchSuppliers();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Delete Failed"
      );

    }

  };

  // ============================================
  // ACTIVATE SUPPLIER
  // ============================================

  const handleActivate = async (id) => {

    try {

      await activateSupplier(id);

      fetchSuppliers();

    } catch (error) {

      console.log(error);

    }

  };

  // ============================================
  // DEACTIVATE SUPPLIER
  // ============================================

  const handleDeactivate = async (id) => {

    try {

      await deactivateSupplier(id);

      fetchSuppliers();

    } catch (error) {

      console.log(error);

    }

  };

  // ============================================
  // DASHBOARD CARDS
  // ============================================

  const totalSuppliers = totalRecords;

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Active"
  ).length;

  const inactiveSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Inactive"
  ).length;

  // ============================================
  // LOADING
  // ============================================

  if (loading) {

    return (
      <div className="p-5">
        Loading...
      </div>
    );

  }

  // ============================================
  // JSX STARTS HERE
  // ============================================

  return (
    <>

      {/* ===========================
          DASHBOARD CARDS
      =========================== */}

      <div className="flex flex-wrap gap-3 mt-4">

        <Card
          title="Total Suppliers"
          count={totalSuppliers}
          bg="#FFF7ED"
          color="#C2410C"
        />

        <Card
          title="Active"
          count={activeSuppliers}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Inactive"
          count={inactiveSuppliers}
          bg="#FEF2F2"
          color="#DC2626"
        />

      </div>

           {/* ===========================
          SEARCH BAR
      ============================ */}

      <div className="flex justify-between items-center mt-6 mb-5">

        <div className="relative w-full max-w-md">

          <IoIosSearch
            size={22}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search Supplier"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />

        </div>

        <div className="flex gap-2">

          <button
            onClick={fetchSuppliers}
            className="bg-gray-600 text-white px-6 py-2 rounded-md"
          >
            Search
          </button>

          <button
            onClick={() => {
              setSelectedSupplier(null);
              setShowModal(true);
            }}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
          >
            + Add Supplier
          </button>

        </div>

      </div>

      {/* ===========================
          TABLE
      ============================ */}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">

        <table className="w-full">
                  {/* ===========================
              TABLE HEADER
          ============================ */}

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Supplier Code
              </th>

              <th className="p-3 text-left">
                Supplier Name
              </th>

              <th className="p-3 text-left">
                Contact Person
              </th>

              <th className="p-3 text-left">
                Phone
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                GST Number
              </th>

              <th className="p-3 text-left">
                City
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>
                      {suppliers.map((supplier, index) => (

              <tr
                key={supplier._id}
                className="border-t"
              >

                {/* Serial Number */}

                <td className="p-3">
                  {(page - 1) * limit + index + 1}
                </td>

                {/* Supplier Code */}

                <td className="p-3">
                  {supplier.supplierCode}
                </td>

                {/* Supplier Name */}

                <td className="p-3">
                  {supplier.name}
                </td>

                {/* Contact Person */}

                <td className="p-3">
                  {supplier.contactPerson || "-"}
                </td>

                {/* Phone */}

                <td className="p-3">
                  {supplier.phone || "-"}
                </td>

                {/* Email */}

                <td className="p-3">
                  {supplier.email || "-"}
                </td>

                {/* GST Number */}

                <td className="p-3">
                  {supplier.gstNumber || "-"}
                </td>

                {/* City */}

                <td className="p-3">
                  {supplier.city || "-"}
                </td>

                {/* Status */}

                <td className="p-3">

                  <button
                    onClick={() => {

                      if (supplier.status === "Active") {

                        handleDeactivate(supplier._id);

                      } else {

                        handleActivate(supplier._id);

                      }

                    }}
                    className={
                      supplier.status === "Active"
                        ? "bg-green-100 text-green-700 px-3 py-1 rounded"
                        : "bg-red-100 text-red-700 px-3 py-1 rounded"
                    }
                  >

                    {supplier.status}

                  </button>

                </td>

                {/* Actions */}

                <td className="p-3">

                  <div className="flex gap-3">

                    {/* Edit */}

                    <PencilIcon
                      className="h-5 w-5 text-yellow-500 cursor-pointer"
                      onClick={() => {

                        setSelectedSupplier(supplier);

                        setShowModal(true);

                      }}
                    />

                    {/* Delete */}

                    <MdDelete
                      className="text-red-500 text-xl cursor-pointer"
                      onClick={() =>
                        handleDelete(supplier._id)
                      }
                    />

                  </div>

                </td>

              </tr>

            ))}

            {suppliers.length === 0 && (

              <tr>

                <td
                  colSpan="10"
                  className="text-center py-6 text-gray-500"
                >

                  No Suppliers Found

                </td>

              </tr>

            )}

          </tbody>
                  </table>

        {/* ===========================
            PAGINATION
        ============================ */}

        <div className="flex justify-between items-center p-4 border-t">

          <span>
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-3">

            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* ===========================
          SUPPLIER MODAL
      ============================ */}

      {showModal && (

        <SupplierModal

          supplier={selectedSupplier}

          onClose={() => {

            setShowModal(false);

            setSelectedSupplier(null);

          }}

          onSuccess={() => {

            setShowModal(false);

            setSelectedSupplier(null);

            fetchSuppliers();

          }}

        />

      )}

    </>

  );

};

export default Supplier;