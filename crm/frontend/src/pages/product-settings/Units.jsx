import React,
{
  useEffect,
  useState
}
from "react";

import Card from "../../components/Card";

import UnitModal from "../../components/UnitModal";

import { IoIosSearch }
from "react-icons/io";

import { MdDelete }
from "react-icons/md";

import {
  PencilIcon
}
from "@heroicons/react/24/outline";

import {

  getUnits,

  createUnit,

  updateUnit,

  deleteUnit,

  changeUnitStatus

}
from "../../services/unitService";

const Units = () => {

  /*
  |--------------------------------------------------------------------------
  | States
  |--------------------------------------------------------------------------
  */

  const [units, setUnits] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages,
    setTotalPages] =
    useState(1);

  const [showModal,
    setShowModal] =
    useState(false);

  const [isEdit,
    setIsEdit] =
    useState(false);

  const [selectedId,
    setSelectedId] =
    useState(null);

  const [formData,
    setFormData] =
    useState({

      name: "",

      shortName: "",

      status: "Active"

    });

  /*
  |--------------------------------------------------------------------------
  | Fetch Units
  |--------------------------------------------------------------------------
  */

  const fetchUnits =
    async () => {

      try {

        setLoading(true);

        const response =
          await getUnits(
            page,
            10,
            search
          );

        setUnits(
          response.data.data || []
        );

        setTotalPages(
          response.data.totalPages || 1
        );

      }

      catch (error) {

        console.log(error);

      }

      finally {

        setLoading(false);

      }

    };

  /*
  |--------------------------------------------------------------------------
  | useEffect
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    fetchUnits();

  }, [page]);

  /*
  |--------------------------------------------------------------------------
  | Add Unit
  |--------------------------------------------------------------------------
  */

  const handleAdd =
    () => {

      setFormData({

        name: "",

        shortName: "",

        status: "Active"

      });

      setIsEdit(false);

      setSelectedId(null);

      setShowModal(true);

    };

  /*
  |--------------------------------------------------------------------------
  | Edit Unit
  |--------------------------------------------------------------------------
  */

  const handleEdit =
    (unit) => {

      setSelectedId(
        unit._id
      );

      setFormData({

        name: unit.name,

        shortName:
          unit.shortName || "",

        status:
          unit.status

      });

      setIsEdit(true);

      setShowModal(true);

    };

  /*
  |--------------------------------------------------------------------------
  | Save / Update
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async () => {

      try {

        if (
          !formData.name.trim()
        ) {

          return alert(
            "Unit Name is Required"
          );

        }

        if (isEdit) {

          await updateUnit(

            selectedId,

            formData

          );

        }

        else {

          await createUnit(

            formData

          );

        }

        setShowModal(false);

        fetchUnits();

      }

      catch (error) {

        alert(

          error.response?.data?.message ||

          "Something went wrong."

        );

      }

    };

  /*
  |--------------------------------------------------------------------------
  | Delete Unit
  |--------------------------------------------------------------------------
  */
  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete Unit ?"
        );

      if (!confirmDelete)
        return;

      try {

        await deleteUnit(id);

        fetchUnits();

      }

      catch (error) {

        alert(
          error.response?.data?.message ||
          "Error deleting unit."
        );

      }

    };

  /*
  |--------------------------------------------------------------------------
  | Change Status
  |--------------------------------------------------------------------------
  */

  const toggleStatus =
    async (unit) => {

      try {

        await changeUnitStatus(

          unit._id,

          unit.status === "Active"
            ? "Inactive"
            : "Active"

        );

        fetchUnits();

      }

      catch (error) {

        alert(
          error.response?.data?.message ||
          "Error updating status."
        );

      }

    };

  /*
  |--------------------------------------------------------------------------
  | Dashboard Cards
  |--------------------------------------------------------------------------
  */

  const totalUnits =
    units.length;

  const activeUnits =
    units.filter(
      item =>
        item.status ===
        "Active"
    ).length;

  const inactiveUnits =
    units.filter(
      item =>
        item.status ===
        "Inactive"
    ).length;

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredUnits =
    units.filter(
      item =>

        item.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

        ||

        item.shortName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

    );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="p-5">

        Loading...

      </div>

    );

  }

  /*
  |--------------------------------------------------------------------------
  | JSX
  |--------------------------------------------------------------------------
  */

  return (

    <>

      {/* Cards */}

      <div className="flex flex-wrap gap-3 mt-4">

        <Card
          title="Total Units"
          count={totalUnits}
          bg="#FFF7ED"
          color="#C2410C"
        />

        <Card
          title="Active"
          count={activeUnits}
          bg="#F0FDF4"
          color="#15803D"
        />

        <Card
          title="Inactive"
          count={inactiveUnits}
          bg="#FEF2F2"
          color="#DC2626"
        />

      </div>

      {/* Search */}

      <div className="flex justify-between items-center mt-6 mb-5">

        <div className="relative w-full max-w-md">

          <IoIosSearch
            size={22}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search Unit"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />

        </div>

        <div className="flex gap-2">

          <button
            className="bg-gray-600 text-white px-6 py-2 rounded-md"
          >
            Search
          </button>

          <button
            onClick={handleAdd}
            className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
          >
            + Add Unit
          </button>

        </div>

      </div>

      {/* Table */}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Unit Name
              </th>

              <th className="p-3 text-left">
                Short Name
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

            {filteredUnits.map(

              (unit, index) => (

                <tr
                  key={unit._id}
                  className="border-t"
                >

                  <td className="p-3">

                    {(page - 1) * 10 +
                      index +
                      1}

                  </td>

                  <td className="p-3">

                    {unit.name}

                  </td>

                  <td className="p-3">

                    {unit.shortName || "-"}

                  </td>

                  <td className="p-3">

                    <button

                      onClick={() =>
                        toggleStatus(unit)
                      }

                      className={
                        unit.status ===
                        "Active"

                          ? "bg-green-100 text-green-700 px-3 py-1 rounded"

                          : "bg-red-100 text-red-700 px-3 py-1 rounded"
                      }

                    >

                      {unit.status}

                    </button>

                  </td>

                  <td className="p-3">

                    <div className="flex gap-3">

                      <PencilIcon

                        className="h-5 w-5 text-yellow-500 cursor-pointer"

                        onClick={() =>
                          handleEdit(unit)
                        }

                      />

                      <MdDelete

                        className="text-red-500 text-xl cursor-pointer"

                        onClick={() =>
                          handleDelete(
                            unit._id
                          )
                        }

                      />

                    </div>

                  </td>

                </tr>

              )

            )}

            {filteredUnits.length === 0 && (

              <tr>

                <td
                  colSpan="5"
                  className="text-center py-5 text-gray-500"
                >

                  No Units Found

                </td>

              </tr>

            )}

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

    {/* Unit Modal */}

    <UnitModal
      isOpen={showModal}
      onClose={() =>
        setShowModal(false)
      }
      onSubmit={handleSubmit}
      formData={formData}
      setFormData={setFormData}
      isEdit={isEdit}
    />

    </>

  );

};

export default Units;