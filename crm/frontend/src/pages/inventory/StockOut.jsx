import React, { useEffect, useState } from "react";

import Card from "../../components/Card";
import StockOutModal from "../../components/StockOutModal";

import { IoIosSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { PencilIcon } from "@heroicons/react/24/outline";

import {
  getStockOuts,
  createStockOut,
  updateStockOut,
  deleteStockOut,
  activateStockOut,
  deactivateStockOut
} from "../../services/stockOutService";

import {
  getRawMaterials
} from "../../services/rawMaterialService";

import {
  getWarehouses
} from "../../services/warehouseService";

const StockOut = () => {

  const [stockOuts, setStockOuts] = useState([]);

  const [materials, setMaterials] = useState([]);

  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);

  const [isEdit, setIsEdit] = useState(false);

  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({

    stockOutNumber: "",

    date: new Date().toISOString().split("T")[0],

    material: "",

    warehouse: "",

    quantity: "",

    remarks: "",

    status: "Active"

  });
    /*
  ==========================================
  FETCH STOCK OUTS
  ==========================================
  */

  const fetchStockOuts = async () => {

    try {

      setLoading(true);

      const response = await getStockOuts(
        page,
        10,
        search
      );

      console.log("========== STOCK OUT RESPONSE ==========");
      console.log(response);

      console.log("response.data:");
      console.log(response.data);

      console.log("response.pages:");
      console.log(response.pages);

      setStockOuts(
        response.data || []
      );

      setTotalPages(
        response.pages || 1
      );

    }
    catch (error) {

      console.log("ERROR:", error);

    }
    finally {

      setLoading(false);

    }

  };



  /*
  ==========================================
  FETCH RAW MATERIALS
  ==========================================
  */

  const fetchMaterials = async () => {

    try {

      const response = await getRawMaterials(
        1,
        1000,
        ""
      );

      setMaterials(
        response.data.data || []
      );

    }
    catch (error) {

      console.log(error);

    }

  };



  /*
  ==========================================
  FETCH WAREHOUSES
  ==========================================
  */

  const fetchWarehouses = async () => {

    try {

      const response = await getWarehouses(
        1,
        1000,
        ""
      );

      setWarehouses(
        response.data.data || []
      );

    }
    catch (error) {

      console.log(error);

    }

  };



  /*
  ==========================================
  LOAD STOCK OUTS WHEN PAGE CHANGES
  ==========================================
  */

  useEffect(() => {

    fetchStockOuts();

  }, [page]);



  /*
  ==========================================
  LOAD MATERIALS & WAREHOUSES ONCE
  ==========================================
  */

  useEffect(() => {

    fetchMaterials();

    fetchWarehouses();

  }, []);
    /*
  ==========================================
  STATISTICS
  ==========================================
  */

  const totalStockOuts = stockOuts.length;

  const activeStockOuts = stockOuts.filter(
    (item) => item.isActive === true
  ).length;

  const inactiveStockOuts = stockOuts.filter(
    (item) => item.isActive === false
  ).length;



  /*
  ==========================================
  SEARCH FILTER
  ==========================================
  */

  const filteredStockOuts = stockOuts.filter(

    (item) =>

      item.stockOutNumber
        ?.toLowerCase()
        .includes(search.toLowerCase())

      ||

      item.material?.materialName
        ?.toLowerCase()
        .includes(search.toLowerCase())

      ||

      item.warehouse?.warehouseName
        ?.toLowerCase()
        .includes(search.toLowerCase())

  );



  /*
  ==========================================
  LOADING SCREEN
  ==========================================
  */

  if (loading) {

    return (

      <div className="p-5">

        Loading...

      </div>

    );

  }



  /*
  ==========================================
  ADD STOCK OUT
  ==========================================
  */

  const handleAdd = () => {

    setFormData({

      stockOutNumber: "",

      date: new Date().toISOString().split("T")[0],

      material: "",

      warehouse: "",

      quantity: "",

      remarks: "",

      status: "Active"

    });

    setSelectedId(null);

    setIsEdit(false);

    setShowModal(true);

  };
    /*
  ==========================================
  EDIT STOCK OUT
  ==========================================
  */

  const handleEdit = (stockOut) => {

    setSelectedId(stockOut._id);

    setFormData({

      stockOutNumber: stockOut.stockOutNumber || "",

      date: stockOut.date
        ? stockOut.date.split("T")[0]
        : "",

      material:
        stockOut.material?._id ||
        stockOut.material ||
        "",

      warehouse:
        stockOut.warehouse?._id ||
        stockOut.warehouse ||
        "",

      quantity:
        stockOut.quantity || "",

      remarks:
        stockOut.remarks || "",

      status:
        stockOut.isActive
          ? "Active"
          : "Inactive"

    });

    setIsEdit(true);

    setShowModal(true);

  };



  /*
  ==========================================
  SAVE / UPDATE STOCK OUT
  ==========================================
  */

  const handleSubmit = async () => {

    try {

      /*
      ==========================
      VALIDATION
      ==========================
      */

      if (!formData.material) {

        return alert(
          "Material is required."
        );

      }

      if (!formData.warehouse) {

        return alert(
          "Warehouse is required."
        );

      }

      if (!formData.quantity) {

        return alert(
          "Quantity is required."
        );

      }

      /*
      ==========================
      REQUEST PAYLOAD
      ==========================
      */

      const payload = {

        date: formData.date,

        material: formData.material,

        warehouse: formData.warehouse,

        quantity: Number(
          formData.quantity
        ),

        remarks: formData.remarks

      };



      /*
      ==========================
      UPDATE
      ==========================
      */

      if (isEdit) {

        await updateStockOut(

          selectedId,

          payload

        );

      }

      /*
      ==========================
      CREATE
      ==========================
      */

      else {

        await createStockOut(
          payload
        );

      }



      /*
      ==========================
      CLOSE MODAL
      ==========================
      */

      setShowModal(false);



      /*
      ==========================
      REFRESH LIST
      ==========================
      */

      fetchStockOuts();

    }

    catch (error) {

      alert(

        error.response?.data?.message ||

        "Something went wrong."

      );

    }

  };
    /*
  ==========================================
  DELETE STOCK OUT
  ==========================================
  */

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this Stock Out entry?"
    );

    if (!confirmDelete) {

      return;

    }

    try {

      await deleteStockOut(id);

      fetchStockOuts();

    }

    catch (error) {

      alert(

        error.response?.data?.message ||

        "Delete failed."

      );

    }

  };



  /*
  ==========================================
  ACTIVATE / DEACTIVATE STOCK OUT
  ==========================================
  */

  const toggleStatus = async (stockOut) => {

    try {

      if (stockOut.isActive) {

        await deactivateStockOut(
          stockOut._id
        );

      }

      else {

        await activateStockOut(
          stockOut._id
        );

      }

      fetchStockOuts();

    }

    catch (error) {

      console.log(error);

    }

  };



  /*
  ==========================================
  DEBUG
  ==========================================
  */

  console.log("stockOuts =", stockOuts);
    return (
    <>

      {/* Statistics Cards */}

      <div className="flex flex-wrap gap-3 mt-4">

        <Card
          title="Total Stock Out"
          count={totalStockOuts}
          bg="#FFF7ED"
          color="#C2410C"
        />

        <Card
          title="Active"
          count={activeStockOuts}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Inactive"
          count={inactiveStockOuts}
          bg="#FEF2F2"
          color="#DC2626"
        />

      </div>



      {/* Search & Add Button */}

      <div className="flex justify-between items-center mt-6 mb-5">

        <div className="relative w-full max-w-md">

          <IoIosSearch
            size={22}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search Stock Out"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />

        </div>

        <div className="flex gap-2">

          <button
            onClick={fetchStockOuts}
            className="bg-gray-600 text-white px-6 py-2 rounded-md"
          >
            Search
          </button>

          <button
            onClick={handleAdd}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
          >
            + Add Stock Out
          </button>

        </div>

      </div>



      {/* Table */}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Stock Out No.
              </th>

              <th className="p-3 text-left">
                Date
              </th>

              <th className="p-3 text-left">
                Material
              </th>

              <th className="p-3 text-left">
                Warehouse
              </th>

              <th className="p-3 text-left">
                Quantity
              </th>

              <th className="p-3 text-left">
                Remarks
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
                      {filteredStockOuts.map((stockOut, index) => (

              <tr
                key={stockOut._id}
                className="border-t"
              >

                <td className="p-3">
                  {(page - 1) * 10 + index + 1}
                </td>

                <td className="p-3">
                  {stockOut.stockOutNumber}
                </td>

                <td className="p-3">
                  {
                    stockOut.date
                      ? new Date(
                          stockOut.date
                        ).toLocaleDateString("en-IN")
                      : ""
                  }
                </td>

                <td className="p-3">
                  {
                    stockOut.material?.materialName ||
                    stockOut.material
                  }
                </td>

                <td className="p-3">
                  {
                    stockOut.warehouse?.warehouseName ||
                    stockOut.warehouse
                  }
                </td>

                <td className="p-3">
                  {stockOut.quantity}
                </td>

                <td className="p-3">
                  {stockOut.remarks || "-"}
                </td>

                <td className="p-3">

                  <button
                    onClick={() =>
                      toggleStatus(stockOut)
                    }
                    className={
                      stockOut.isActive
                        ? "bg-green-100 text-green-700 px-3 py-1 rounded"
                        : "bg-red-100 text-red-700 px-3 py-1 rounded"
                    }
                  >

                    {
                      stockOut.isActive
                        ? "Active"
                        : "Inactive"
                    }

                  </button>

                </td>

                <td className="p-3">

                  <div className="flex gap-3">

                    <PencilIcon
                      className="h-5 w-5 text-yellow-500 cursor-pointer"
                      onClick={() =>
                        handleEdit(stockOut)
                      }
                    />

                    <MdDelete
                      className="text-red-500 text-xl cursor-pointer"
                      onClick={() =>
                        handleDelete(stockOut._id)
                      }
                    />

                  </div>

                </td>

              </tr>

            ))}



            {
              filteredStockOuts.length === 0 && (

                <tr>

                  <td
                    colSpan="9"
                    className="text-center py-6 text-gray-500"
                  >

                    No Stock Out Found

                  </td>

                </tr>

              )
            }

          </tbody>

        </table>



        {/* Pagination */}

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

      </div>



      {/* Stock Out Modal */}

      <StockOutModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        materials={materials}
        warehouses={warehouses}
        isEdit={isEdit}
      />

    </>

  );

};

export default StockOut;