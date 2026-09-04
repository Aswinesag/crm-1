import React,
{
  useEffect,
  useState
}
from "react";

import Card
from "../../components/Card";

import SupplierPaymentModal
from "../../components/SupplierPaymentModal";

import
{
  IoIosSearch
}
from "react-icons/io";

import
{
  MdDelete
}
from "react-icons/md";

import
{
  PencilIcon
}
from "@heroicons/react/24/outline";

import
{
  getSupplierPayments,
  createSupplierPayment,
  updateSupplierPayment,
  deleteSupplierPayment
}
from "../../services/supplierPaymentService";

//=====================================================
// Supplier Payment
//=====================================================

const SupplierPayment = () =>
{

  //---------------------------------------------------
  // States
  //---------------------------------------------------

  const
  [
    supplierPayments,
    setSupplierPayments
  ] = useState([]);

  const
  [
    loading,
    setLoading
  ] = useState(false);

  const
  [
    search,
    setSearch
  ] = useState("");

  const
  [
    page,
    setPage
  ] = useState(1);

  const
  [
    totalPages,
    setTotalPages
  ] = useState(1);

  const
  [
    showModal,
    setShowModal
  ] = useState(false);

  const
  [
    isEdit,
    setIsEdit
  ] = useState(false);

  const
  [
    selectedId,
    setSelectedId
  ] = useState(null);

  const [formData, setFormData] = useState({

    paymentNumber: "",

    paymentDate: "",

    supplier: "",

    billNumber: "",

    amount: "",

    paymentMethod: "",

    transactionNumber: "",

    remarks: "",

    status: "Active"

});
    
  //---------------------------------------------------
  // Fetch Supplier Payments
  //---------------------------------------------------

  const fetchSupplierPayments =
    async () =>
    {

      try
      {

        setLoading(true);

        const response =
          await getSupplierPayments(
            page,
            10,
            search
          );

        setSupplierPayments(
          response.data.data || []
        );

        setTotalPages(
          response.data.totalPages || 1
        );

      }

      catch (error)
      {

        console.log(error);

      }

      finally
      {

        setLoading(false);

      }

    };

  useEffect(() =>
  {

    fetchSupplierPayments();

  }, [page]);

  //---------------------------------------------------
  // Add
  //---------------------------------------------------

  const handleAdd = () =>
  {

    setFormData({

      paymentNumber: "",

      paymentDate: "",

      vendor: "",

      amount: "",

      paymentMethod: "",

      referenceNumber: "",

      status: "Pending",

      remarks: ""

    });

    setIsEdit(false);

    setShowModal(true);

  };

  //---------------------------------------------------
  // Edit
  //---------------------------------------------------

  const handleEdit =
    (
      payment
    ) =>
    {

      setSelectedId(
        payment._id
      );

      setFormData({

        paymentNumber:
          payment.paymentNumber,

        paymentDate:
          payment.paymentDate
            ?.substring(0, 10),

        supplier:
          payment.supplier?._id,

        amount:
          payment.amount,

        paymentMethod:
          payment.paymentMethod,

        referenceNumber:
          payment.referenceNumber,

        status:
          payment.status,

        remarks:
          payment.remarks || ""

      });

      setIsEdit(true);

      setShowModal(true);

    };

  //---------------------------------------------------
  // Save
  //---------------------------------------------------

  const handleSubmit =
    async () =>
    {

      try
      {

        if (
          !formData.paymentNumber
        )
        {

          return alert(
            "Payment Number Required"
          );

        }

        if (isEdit)
        {

          await updateSupplierPayment(
            selectedId,
            formData
          );

        }

        else
        {

          await createSupplierPayment(
            formData
          );

        }

        setShowModal(false);

        fetchSupplierPayments();

      }

      catch (error)
      {

        alert(
          error.response?.data
            ?.message
        );

      }

    };

  //---------------------------------------------------
  // Delete
  //---------------------------------------------------

  const handleDelete =
    async (
      id
    ) =>
    {

      const confirmDelete =
        window.confirm(
          "Delete Supplier Payment?"
        );

      if (!confirmDelete)
        return;

      await deleteSupplierPayment(
        id
      );

      fetchSupplierPayments();

    };

  //---------------------------------------------------
  // Dashboard Cards
  //---------------------------------------------------

  const totalPayments =
    supplierPayments.length;

  const completedPayments =
    supplierPayments.filter(
      item =>
        item.status ===
        "Completed"
    ).length;

  const pendingPayments =
    supplierPayments.filter(
      item =>
        item.status ===
        "Pending"
    ).length;

  //---------------------------------------------------
  // Search
  //---------------------------------------------------

  const filteredPayments =
    supplierPayments.filter(
      item =>

        item.paymentNumber
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

        ||

        item.vendor
          ?.vendorName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  //---------------------------------------------------
  // Loading
  //---------------------------------------------------

  if (loading)
  {

    return (
      <div className="p-5">
        Loading...
      </div>
    );

  }

  //---------------------------------------------------
  // JSX Starts Here
  //---------------------------------------------------

  return ( <>
  {/* Cards */}

  <div className="flex flex-wrap gap-3 mt-4">

    <Card
      title="Total Payments"
      count={totalPayments}
      bg="#FFF7ED"
      color="#C2410C"
    />

    <Card
      title="Completed"
      count={completedPayments}
      bg="#F0FDF4"
      color="#15803D"
    />

    <Card
      title="Pending"
      count={pendingPayments}
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
        placeholder="Search Supplier Payment"
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
        + Add Supplier Payment
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
            Payment No
          </th>

          <th className="p-3 text-left">
            Date
          </th>

          <th className="p-3 text-left">
            Vendor
          </th>

          <th className="p-3 text-left">
            Amount
          </th>

          <th className="p-3 text-left">
            Method
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

        {
          filteredPayments.map(
            (
              payment,
              index
            ) =>
            (
              <tr
                key={payment._id}
                className="border-t"
              >

                <td className="p-3">
                  {(page - 1) * 10 + index + 1}
                </td>

                <td className="p-3">
                  {payment.paymentNumber}
                </td>

                <td className="p-3">
                  {
                    payment.paymentDate
                      ?.substring(0, 10)
                  }
                </td>

                <td className="p-3">
                  {
                    payment.supplier?.vendorName
                  }
                </td>

                <td className="p-3">
                  ₹ {payment.amount}
                </td>

                <td className="p-3">
                  {payment.paymentMethod}
                </td>

                <td className="p-3">

                  <span
                    className={
                      payment.status === "Completed"
                        ? "bg-green-100 text-green-700 px-3 py-1 rounded"
                        : payment.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700 px-3 py-1 rounded"
                        : "bg-red-100 text-red-700 px-3 py-1 rounded"
                    }
                  >
                    {payment.status}
                  </span>

                </td>

                <td className="p-3">

                  <div className="flex gap-3">

                    <PencilIcon
                      className="h-5 w-5 text-yellow-500 cursor-pointer"
                      onClick={() =>
                        handleEdit(payment)
                      }
                    />

                    <MdDelete
                      className="text-red-500 text-xl cursor-pointer"
                      onClick={() =>
                        handleDelete(payment._id)
                      }
                    />

                  </div>

                </td>

              </tr>
            )
          )
        }

        {
          filteredPayments.length === 0 &&
          (
            <tr>

              <td
                colSpan="8"
                className="text-center py-5 text-gray-500"
              >
                No Supplier Payments Found
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

  <SupplierPaymentModal
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

export default SupplierPayment;