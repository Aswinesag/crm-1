import React,
{
  useEffect,
  useState
}
from "react";

import Card from "../../components/Card";

import HsnModal from "../../components/HsnModal";

import {
  IoIosSearch
}
from "react-icons/io";

import {
  MdDelete
}
from "react-icons/md";

import {
  PencilIcon
}
from "@heroicons/react/24/outline";

import {
  getHSNCodes,
  searchHSN,
  createHSN,
  updateHSN,
  deleteHSN
}
from "../../services/hsnService";

const HsnCodes = () => {

  const [hsnCodes, setHsnCodes] =
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
      hsnCode: "",
      description: "",
      gstPercentage: ""
    });

  /*
  |--------------------------------------------------------------------------
  | Fetch HSN Codes
  |--------------------------------------------------------------------------
  */

  const fetchHSNCodes =
    async () => {

      try {

        setLoading(true);

        const response =
          await getHSNCodes(
            page,
            10
          );

        setHsnCodes(
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

  useEffect(() => {

    fetchHSNCodes();

  }, [page]);

  /*
  |--------------------------------------------------------------------------
  | Search HSN
  |--------------------------------------------------------------------------
  */

  const handleSearch =
    async () => {

      try {

        if (
          search.trim() === ""
        ) {

          fetchHSNCodes();

          return;

        }

        const response =
          await searchHSN(
            search
          );

        setHsnCodes(
          response.data.data || []
        );

        setTotalPages(1);

      } catch (error) {

        console.log(error);

      }

    };

  /*
  |--------------------------------------------------------------------------
  | Add HSN
  |--------------------------------------------------------------------------
  */

  const handleAdd =
    () => {

      setFormData({
        hsnCode: "",
        description: "",
        gstPercentage: ""
      });

      setIsEdit(false);

      setShowModal(true);

    };

  /*
  |--------------------------------------------------------------------------
  | Edit HSN
  |--------------------------------------------------------------------------
  */

  const handleEdit =
    (item) => {

      setSelectedId(
        item._id
      );

      setFormData({

        hsnCode:
          item.hsnCode,

        description:
          item.description || "",

        gstPercentage:
          item.gstPercentage

      });

      setIsEdit(true);

      setShowModal(true);

    };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit =
    async () => {

      try {

        if (
          !formData
            .hsnCode
            .trim()
        ) {

          return alert(
            "HSN Code is required."
          );

        }

        if (isEdit) {

          await updateHSN(
            selectedId,
            formData
          );

        }

        else {

          await createHSN(
            formData
          );

        }

        setShowModal(false);

        fetchHSNCodes();

      }

      catch (error) {

        alert(
          error.response?.data?.message
        );

      }

    };

  /*
  |--------------------------------------------------------------------------
  | Delete HSN
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete HSN Code?"
        );

      if (!confirmDelete)
        return;

      await deleteHSN(id);

      fetchHSNCodes();

    };

  /*
  |--------------------------------------------------------------------------
  | Dashboard Cards
  |--------------------------------------------------------------------------
  */

  const totalHSN =
    hsnCodes.length;

  const gst5 =
    hsnCodes.filter(
      item =>
        item.gstPercentage === 5
    ).length;

  const gst12 =
    hsnCodes.filter(
      item =>
        item.gstPercentage === 12
    ).length;

  const gst18 =
    hsnCodes.filter(
      item =>
        item.gstPercentage === 18
    ).length;

  const gst28 =
    hsnCodes.filter(
      item =>
        item.gstPercentage === 28
    ).length;

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
  return (
  <>
    {/* Cards */}

    <div className="flex flex-wrap gap-3 mt-4">

      <Card
        title="Total HSN Codes"
        count={totalHSN}
        bg="#FFF7ED"
        color="#C2410C"
      />

      <Card
        title="5% GST"
        count={gst5}
        bg="#ECFDF5"
        color="#059669"
      />

      <Card
        title="12% GST"
        count={gst12}
        bg="#EFF6FF"
        color="#2563EB"
      />

      <Card
        title="18% GST"
        count={gst18}
        bg="#FEF3C7"
        color="#D97706"
      />

      <Card
        title="28% GST"
        count={gst28}
        bg="#FEF2F2"
        color="#DC2626"
      />

    </div>

    {/* Search & Buttons */}

    <div className="flex justify-between items-center mt-6 mb-5">

      <div className="relative w-full max-w-md">

        <IoIosSearch
          size={22}
          className="absolute left-3 top-3 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search HSN Code"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />

      </div>

      <div className="flex gap-2">

        <button
          onClick={handleSearch}
          className="bg-gray-600 text-white px-6 py-2 rounded-md"
        >
          Search
        </button>

        <button
          onClick={handleAdd}
          className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
        >
          + Add HSN
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
              HSN Code
            </th>

            <th className="p-3 text-left">
              Description
            </th>

            <th className="p-3 text-left">
              GST %
            </th>

            <th className="p-3 text-left">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {hsnCodes.map(
            (
              item,
              index
            ) => (

              <tr
                key={item._id}
                className="border-t"
              >

                <td className="p-3">

                  {(page - 1) * 10 +
                    index +
                    1}

                </td>

                <td className="p-3">

                  {item.hsnCode}

                </td>

                <td className="p-3">

                  {item.description || "-"}

                </td>

                <td className="p-3">

                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">

                    {item.gstPercentage}%

                  </span>

                </td>

                <td className="p-3">

                  <div className="flex gap-3">

                    <PencilIcon
                      className="h-5 w-5 text-yellow-500 cursor-pointer"
                      onClick={() =>
                        handleEdit(item)
                      }
                    />

                    <MdDelete
                      className="text-red-500 text-xl cursor-pointer"
                      onClick={() =>
                        handleDelete(item._id)
                      }
                    />

                  </div>

                </td>

              </tr>

            )
          )}

          {hsnCodes.length === 0 && (

            <tr>

              <td
                colSpan="5"
                className="text-center py-5 text-gray-500"
              >

                No HSN Codes Found

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

    {/* Modal */}

    <HsnModal
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

export default HsnCodes;