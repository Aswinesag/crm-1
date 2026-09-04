import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import RawMaterialModal from "../../components/RawMaterialModal";
import { IoIosSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { PencilIcon } from "@heroicons/react/24/outline";
import {
  getRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from "../../services/rawMaterialService";
import { getCategories } from "../../services/categoryService";
import { getUnits } from "../../services/unitService";
import { getSuppliers } from "../../services/supplierService";
import { getWarehouses } from "../../services/warehouseService";

const RawMaterials = () => {
  // ============================================
  // STATES
  // ============================================

  const [rawMaterials, setRawMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    materialCode: "",
    materialName: "",
    category: "",
    unit: "",
    supplier: "",
    costPrice: "",
    minimumStock: "",
    reorderLevel: "",
    warehouse: "",
    status: "Active",
  });

  // ============================================
  // FETCH RAW MATERIALS
  // ============================================

  const fetchRawMaterials = async () => {
    try {
      setLoading(true);

      const response = await getRawMaterials(
        page,
        10,
        search
      );

      setRawMaterials(
        response.data.data || []
      );

      setTotalPages(
        response.data.totalPages || 1
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
// LOAD DROPDOWNS
// ============================================

const fetchDropdownData = async () => {
  try {

    const [
      categoryRes,
      unitRes,
      supplierRes,
      warehouseRes
    ] = await Promise.all([
      getCategories(1, 1000, ""),
      getUnits(1, 1000, ""),
      getSuppliers(1, 1000, ""),
      getWarehouses(1, 1000, "")
    ]);

    console.log("CATEGORY RESPONSE:", categoryRes);
    console.log("UNIT RESPONSE:", unitRes);
    console.log("SUPPLIER RESPONSE:", supplierRes);
    console.log("WAREHOUSE RESPONSE:", warehouseRes);

   setCategories(categoryRes.data || []);

    setUnits(unitRes.data.data || []);

    setSuppliers(supplierRes.data.data || []);

    setWarehouses(warehouseRes.data.data || []);

  } catch (error) {

    console.log("Dropdown Error:", error);

  }
};

  // ============================================
  // LOAD DATA
  // ============================================

  useEffect(() => {
    fetchRawMaterials();
  }, [page]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // ============================================
  // ADD RAW MATERIAL
  // ============================================

  const handleAdd = () => {
    setFormData({
      materialCode: "",
      materialName: "",
      category: "",
      unit: "",
      supplier: "",
      costPrice: "",
      minimumStock: "",
      reorderLevel: "",
      warehouse: "",
      status: "Active",
    });

    setSelectedId(null);

    setIsEdit(false);

    setShowModal(true);
  };

  // ============================================
  // EDIT RAW MATERIAL
  // ============================================

  const handleEdit = (material) => {
    setSelectedId(material._id);

    setFormData({
      materialCode: material.materialCode || "",

      materialName: material.materialName || "",

      category:
        material.category?._id ||
        material.category ||
        "",

      unit:
        material.unit?._id ||
        material.unit ||
        "",

      supplier:
        material.supplier?._id ||
        material.supplier ||
        "",

      warehouse:
        material.warehouse?._id ||
        material.warehouse ||
        "",

      costPrice:
        material.costPrice || "",

      minimumStock:
        material.minimumStock || "",

      reorderLevel:
        material.reorderLevel || "",

      status:
        material.status || "Active",
    });

    setIsEdit(true);

    setShowModal(true);
  };

  // ============================================
  // SAVE
  // ============================================

  const handleSubmit = async () => {
    try {
      if (!formData.materialName.trim()) {
        return alert(
          "Material Name is Required"
        );
      }

      if (isEdit) {
        await updateRawMaterial(
          selectedId,
          formData
        );
      } else {
        await createRawMaterial(
          formData
        );
      }

      setShowModal(false);

      fetchRawMaterials();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // ============================================
  // DELETE
  // ============================================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Delete this Raw Material?"
      );

    if (!confirmDelete) return;

    try {
      await deleteRawMaterial(id);

      fetchRawMaterials();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Delete Failed"
      );
    }
  };

  // ============================================
  // TOGGLE STATUS
  // ============================================

  const toggleStatus = async (
    material
  ) => {
    try {
      await updateRawMaterial(
        material._id,
        {
          status:
            material.status ===
            "Active"
              ? "Inactive"
              : "Active",
        }
      );

      fetchRawMaterials();
    } catch (error) {
      console.log(error);
    }
  };

  // ============================================
  // DASHBOARD CARDS
  // ============================================

  const totalMaterials =
    rawMaterials.length;

  const activeMaterials =
    rawMaterials.filter(
      (item) =>
        item.status === "Active"
    ).length;

  const inactiveMaterials =
    rawMaterials.filter(
      (item) =>
        item.status === "Inactive"
    ).length;

  // ============================================
  // SEARCH
  // ============================================

  const filteredMaterials =
    rawMaterials.filter((item) =>
      item.materialName
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

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

  // ===================================================
  // JSX WILL START HERE
  // (Part 2)
  // ===================================================
  return (
    <>
      {/* ===========================
          DASHBOARD CARDS
      ============================ */}

      <div className="flex flex-wrap gap-3 mt-4">
        <Card
          title="Total Materials"
          count={totalMaterials}
          bg="#FFF7ED"
          color="#C2410C"
        />

        <Card
          title="Active"
          count={activeMaterials}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Inactive"
          count={inactiveMaterials}
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
            placeholder="Search Raw Material"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />

        </div>

        <div className="flex gap-2">

          <button
            onClick={fetchRawMaterials}
            className="bg-gray-600 text-white px-6 py-2 rounded-md"
          >
            Search
          </button>

          <button
            onClick={handleAdd}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
          >
            + Add Raw Material
          </button>

        </div>

      </div>

      {/* ===========================
          TABLE
      ============================ */}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Material Code
              </th>

              <th className="p-3 text-left">
                Material Name
              </th>

              <th className="p-3 text-left">
                Category
              </th>

              <th className="p-3 text-left">
                Unit
              </th>

              <th className="p-3 text-left">
                Supplier
              </th>

              <th className="p-3 text-left">
                Cost Price
              </th>

              <th className="p-3 text-left">
                Current Stock
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

            {filteredMaterials.map(
              (material, index) => (

                <tr
                  key={material._id}
                  className="border-t"
                >

                  <td className="p-3">
                    {(page - 1) * 10 + index + 1}
                  </td>

                  <td className="p-3">
                    {material.materialCode}
                  </td>

                  <td className="p-3">
                    {material.materialName}
                  </td>

                  <td className="p-3">
                    {material.category?.name ||
                      material.category}
                  </td>

                  <td className="p-3">
                    {material.unit?.name ||
                      material.unit}
                  </td>

                  <td className="p-3">
                    {material.supplier?.name ||
                      material.supplier}
                  </td>

                  <td className="p-3">
                    ₹ {material.costPrice}
                  </td>

                  <td className="p-3">
                    {material.currentStock}
                  </td>

                  <td className="p-3">

                    <button
                      onClick={() =>
                        toggleStatus(material)
                      }
                      className={
                        material.status ===
                        "Active"
                          ? "bg-green-100 text-green-700 px-3 py-1 rounded"
                          : "bg-red-100 text-red-700 px-3 py-1 rounded"
                      }
                    >
                      {material.status}
                    </button>

                  </td>

                  <td className="p-3">

                    <div className="flex gap-3">

                      <PencilIcon
                        className="h-5 w-5 text-yellow-500 cursor-pointer"
                        onClick={() =>
                          handleEdit(material)
                        }
                      />

                      <MdDelete
                        className="text-red-500 text-xl cursor-pointer"
                        onClick={() =>
                          handleDelete(
                            material._id
                          )
                        }
                      />

                    </div>

                  </td>

                </tr>

              )
            )}

            {filteredMaterials.length === 0 && (

              <tr>

                <td
                  colSpan="10"
                  className="text-center py-6 text-gray-500"
                >
                  No Raw Materials Found
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
              onClick={() =>
                setPage(page - 1)
              }
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={
                page === totalPages
              }
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

      {/* ===========================
          MODAL
      ============================ */}

      <RawMaterialModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        units={units}
        suppliers={suppliers}
        warehouses={warehouses}
        isEdit={isEdit}
      />

    </>
  );

};

export default RawMaterials;