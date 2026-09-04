import React, {
  useEffect,
  useState,
} from "react";

import Card from "../../components/Card";

import StockTransferModal from "../../components/StockTransferModal";

import { IoIosSearch } from "react-icons/io";

import { MdDelete } from "react-icons/md";

import {
  createStockTransfer,
  getStockTransfers,
  deleteStockTransfer,
} from "../../services/stockTransferService";

const StockTransfer = () => {

  // ==========================================
  // STATE VARIABLES
  // ==========================================

  const [stockTransfers, setStockTransfers] =
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

      date: "",

      material: "",

      fromWarehouse: "",

      toWarehouse: "",

      quantity: "",

      notes: "",

    });

  // ==========================================
  // FETCH STOCK TRANSFERS
  // ==========================================

  const fetchStockTransfers = async () => {

    try {

      setLoading(true);

     const response =
        await getStockTransfers(page,10,search);

        console.log(response);

        setStockTransfers(
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
        "Failed to load Stock Transfers."
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

    fetchStockTransfers();

  }, [page]);

  // ==========================================
  // ADD BUTTON
  // ==========================================

  const handleAdd = () => {

    setFormData({

      date: new Date()
        .toISOString()
        .split("T")[0],

      material: "",

      fromWarehouse: "",

      toWarehouse: "",

      quantity: "",

      notes: "",

    });

    setShowModal(true);

  };

  // ==========================================
  // SAVE STOCK TRANSFER
  // ==========================================

  const handleSubmit = async () => {

    try {

      // Basic Validation

      if (!formData.date) {

        return alert(
          "Transfer Date is required."
        );

      }

      if (!formData.material) {

        return alert(
          "Please select Raw Material."
        );

      }

      if (!formData.fromWarehouse) {

        return alert(
          "Please select From Warehouse."
        );

      }

      if (!formData.toWarehouse) {

        return alert(
          "Please select To Warehouse."
        );

      }

      if (
        formData.fromWarehouse ===
        formData.toWarehouse
      ) {

        return alert(
          "From Warehouse and To Warehouse cannot be the same."
        );

      }

      if (
        !formData.quantity ||
        Number(formData.quantity) <= 0
      ) {

        return alert(
          "Quantity must be greater than zero."
        );

      }

    console.log({

    date: formData.date,

    item: formData.material,

    fromWarehouse: formData.fromWarehouse,

    toWarehouse: formData.toWarehouse,

    quantity: Number(formData.quantity),

    remarks: formData.notes

});

    await createStockTransfer({

    date: formData.date,

    item: formData.material,

    fromWarehouse: formData.fromWarehouse,

    toWarehouse: formData.toWarehouse,

    quantity: Number(formData.quantity),

    remarks: formData.notes

});

      alert(
        "Stock Transfer Created Successfully."
      );

      setShowModal(false);

      fetchStockTransfers();

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Unable to create Stock Transfer."

      );

    }

  };

  // ==========================================
  // DELETE STOCK TRANSFER
  // ==========================================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this Stock Transfer?"
      );

    if (!confirmDelete)
      return;

    try {

      await deleteStockTransfer(id);

      alert(
        "Stock Transfer Deleted Successfully."
      );

      fetchStockTransfers();

    }

    catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Unable to delete Stock Transfer."

      );

    }

  };

  // ==========================================
  // CARD CALCULATIONS
  // ==========================================

  const totalTransfers =
    stockTransfers.length;

  const totalQuantity =
    stockTransfers.reduce(

      (total, item) =>

        total +
        Number(item.quantity || 0),

      0

    );

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const todayTransfers =
    stockTransfers.filter(

      (item) =>

        item.date?.substring(0, 10) === today

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
          title="Total Transfers"
          count={totalTransfers}
          bg="#EFF6FF"
          color="#2563EB"
        />

        <Card
          title="Today's Transfers"
          count={todayTransfers}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Total Quantity"
          count={totalQuantity}
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
            placeholder="Search Transfer Number / Material"
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
            onClick={fetchStockTransfers}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >

            Search

          </button>

          <button
            onClick={handleAdd}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md hover:bg-orange-600"
          >

            + Add Transfer

          </button>

        </div>

      </div>
            {/* ==========================================
          STOCK TRANSFER TABLE
      ========================================== */}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Transfer No.
              </th>

              <th className="p-3 text-left">
                Date
              </th>

              <th className="p-3 text-left">
                Material
              </th>

              <th className="p-3 text-left">
                From Warehouse
              </th>

              <th className="p-3 text-left">
                To Warehouse
              </th>

              <th className="p-3 text-right">
                Quantity
              </th>

              <th className="p-3 text-left">
                Notes
              </th>

              <th className="p-3 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {

              stockTransfers.length > 0 ?

              (

                stockTransfers.map(

                  (transfer, index) => (

                    <tr
                      key={transfer._id}
                      className="border-t hover:bg-gray-50"
                    >

                      {/* Serial Number */}

                      <td className="p-3">

                        {(page - 1) * 10 + index + 1}

                      </td>

                      {/* Transfer Number */}

                      <td className="p-3 font-medium">

                        {transfer.transferNumber}

                      </td>

                      {/* Date */}

                      <td className="p-3">

                        {

                          transfer.date
                            ? new Date(
                                transfer.date
                              ).toLocaleDateString()
                            : "-"

                        }

                      </td>

                      {/* Material */}

                      <td className="p-3">

                        {

                          transfer.item?.materialName ||

                          transfer.destinationMaterial?.materialName ||

                            "-" ||

                          transfer.material?.name ||

                          "-"

                        }

                      </td>

                      {/* From Warehouse */}

                      <td className="p-3">

                        {

                          transfer.fromWarehouse?.warehouseName ||

                          "-"

                        }

                      </td>

                      {/* To Warehouse */}

                      <td className="p-3">

                        {

                          transfer.toWarehouse?.warehouseName ||

                          "-"

                        }

                      </td>

                      {/* Quantity */}

                      <td className="p-3 text-right font-semibold">

                        {transfer.quantity}

                      </td>

                      {/* Notes */}

                      <td className="p-3">

                        {

                          transfer.remarks ||

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
                                transfer._id
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
                    colSpan="9"
                    className="text-center py-8 text-gray-500"
                  >

                    No Stock Transfers Found

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
          STOCK TRANSFER MODAL
      ========================================== */}

      <StockTransferModal
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

export default StockTransfer;