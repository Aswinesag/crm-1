import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import ComponentModal from "../../components/ComponentModal";
import { IoIosSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { PencilIcon } from "@heroicons/react/24/outline";
import {
  getComponents,
  createComponent,
  updateComponent,
  deleteComponent,
  activateComponent,
  deactivateComponent,
} from "../../services/componentService";
import { getCategories } from "../../services/categoryService";
import { getUnits } from "../../services/unitService";
import { getSuppliers } from "../../services/supplierService";
import { getWarehouses } from "../../services/warehouseService";

const Components = () => {
  const [components, setComponents] = useState([]);
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
    componentCode: "",
    componentName: "",
    category: "",
    unit: "",
    costPrice: "",
    stockQuantity: "",
    supplier: "",
    warehouse: "",
    status: "Active",
  });

  const fetchComponents = async () => {
    try {
      setLoading(true);

      const response = await getComponents(
        page,
        10,
        search
      );

      setComponents(
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

  const fetchDropdownData = async () => {
    try {
      const [
        categoryRes,
        unitRes,
        supplierRes,
        warehouseRes,
      ] = await Promise.all([
        getCategories(1, 1000, ""),
        getUnits(1, 1000, ""),
        getSuppliers(1, 1000, ""),
        getWarehouses(1, 1000, ""),
      ]);

      setCategories(
        categoryRes.data || []
      );

      setUnits(
        unitRes.data.data || []
      );

      setSuppliers(
        supplierRes.data.data || []
      );

      setWarehouses(
        warehouseRes.data.data || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [page]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

    const handleAdd = () => {
    setFormData({
      componentCode: "",
      componentName: "",
      category: "",
      unit: "",
      costPrice: "",
      stockQuantity: "",
      supplier: "",
      warehouse: "",
      status: "Active",
    });

    setSelectedId(null);

    setIsEdit(false);

    setShowModal(true);
  };

  const handleEdit = (component) => {
    setSelectedId(component._id);

    setFormData({
      componentCode:
        component.componentCode || "",

      componentName:
        component.componentName || "",

      category:
        component.category?._id ||
        component.category ||
        "",

      unit:
        component.unit?._id ||
        component.unit ||
        "",

      supplier:
        component.supplier?._id ||
        component.supplier ||
        "",

      warehouse:
        component.warehouse?._id ||
        component.warehouse ||
        "",

      costPrice:
        component.costPrice || "",

      stockQuantity:
        component.stockQuantity || "",

      status:
        component.status || "Active",
    });

    setIsEdit(true);

    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.componentName.trim()) {
        return alert(
          "Component Name is Required"
        );
      }

      if (isEdit) {
        await updateComponent(
          selectedId,
          formData
        );
      } else {
        await createComponent(
          formData
        );
      }

      setShowModal(false);

      fetchComponents();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Delete this Component?"
      );

    if (!confirmDelete) return;

    try {
      await deleteComponent(id);

      fetchComponents();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Delete Failed"
      );
    }
  };

  const toggleStatus = async (
    component
  ) => {
    try {
      if (
        component.status === "Active"
      ) {
        await deactivateComponent(
          component._id
        );
      } else {
        await activateComponent(
          component._id
        );
      }

      fetchComponents();
    } catch (error) {
      console.log(error);
    }
  };

  const totalComponents =
    components.length;

  const activeComponents =
    components.filter(
      (item) =>
        item.status === "Active"
    ).length;

  const inactiveComponents =
    components.filter(
      (item) =>
        item.status === "Inactive"
    ).length;

  const filteredComponents =
    components.filter((item) =>
      item.componentName
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  if (loading) {
    return (
      <div className="p-5">
        Loading...
      </div>
    );
  };

  console.log(JSON.stringify(components, null, 2));
    return (
    <>
      <div className="flex flex-wrap gap-3 mt-4">
        <Card
          title="Total Components"
          count={totalComponents}
          bg="#FFF7ED"
          color="#C2410C"
        />

        <Card
          title="Active"
          count={activeComponents}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Inactive"
          count={inactiveComponents}
          bg="#FEF2F2"
          color="#DC2626"
        />
      </div>

      <div className="flex justify-between items-center mt-6 mb-5">

        <div className="relative w-full max-w-md">

          <IoIosSearch
            size={22}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search Component"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />

        </div>

        <div className="flex gap-2">

          <button
            onClick={fetchComponents}
            className="bg-gray-600 text-white px-6 py-2 rounded-md"
          >
            Search
          </button>

          <button
            onClick={handleAdd}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
          >
            + Add Component
          </button>

        </div>

      </div>

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Component Code
              </th>

              <th className="p-3 text-left">
                Component Name
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
                Warehouse
              </th>

              <th className="p-3 text-left">
                Cost Price
              </th>

              <th className="p-3 text-left">
                Stock Quantity
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

            {filteredComponents.map(
              (component, index) => (

                <tr
                  key={component._id}
                  className="border-t"
                >

                  <td className="p-3">
                    {(page - 1) * 10 + index + 1}
                  </td>

                  <td className="p-3">
                    {component.componentCode}
                  </td>

                  <td className="p-3">
                    {component.componentName}
                  </td>

                  <td className="p-3">
                    {component.category?.name ||
                      component.category}
                  </td>

                  <td className="p-3">
                    {component.unit?.name ||
                      component.unit}
                  </td>

                  <td className="p-3">
                    {component.supplier?.name ||
                      component.supplier}
                  </td>

                  <td className="p-3">
                    {component.warehouse?.warehouseName ||
                      component.warehouse}
                  </td>

                  <td className="p-3">
                    ₹ {component.costPrice}
                  </td>

                  <td className="p-3">
                    {component.stockQuantity}
                  </td>

                  <td className="p-3">

                    <button
                      onClick={() =>
                        toggleStatus(component)
                      }
                      className={
                        component.status ===
                        "Active"
                          ? "bg-green-100 text-green-700 px-3 py-1 rounded"
                          : "bg-red-100 text-red-700 px-3 py-1 rounded"
                      }
                    >
                      {component.status}
                    </button>

                  </td>

                  <td className="p-3">

                    <div className="flex gap-3">

                      <PencilIcon
                        className="h-5 w-5 text-yellow-500 cursor-pointer"
                        onClick={() =>
                          handleEdit(component)
                        }
                      />

                      <MdDelete
                        className="text-red-500 text-xl cursor-pointer"
                        onClick={() =>
                          handleDelete(
                            component._id
                          )
                        }
                      />

                    </div>

                  </td>

                </tr>

              )
            )}

            {filteredComponents.length === 0 && (

              <tr>

                <td
                  colSpan="11"
                  className="text-center py-6 text-gray-500"
                >
                  No Components Found
                </td>

              </tr>

            )}

          </tbody>

        </table>
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

      <ComponentModal
        isOpen={showModal}
        onClose={() =>
          setShowModal(false)
        }
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

export default Components;