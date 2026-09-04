import React,
{
  useEffect,
  useState
}
from "react";

import Card
from "../../components/Card";

import PurchaseBillModal
from "../../components/PurchaseBillModal";

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
  getPurchaseBills,
  createPurchaseBill,
  updatePurchaseBill,
  deletePurchaseBill
}
from "../../services/purchaseBillService";

const PurchaseBill = () =>
{

  // ==========================================
  // States
  // ==========================================

  const [purchaseBills,
    setPurchaseBills] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  const [search,
    setSearch] =
    useState("");

  const [page,
    setPage] =
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

  // ==========================================
  // Initial Form
  // ==========================================

  const initialForm =
  {
    billNumber: "",
    supplierInvoiceNo: "",
    billDate: "",
    supplier: "",
    purchaseOrder: "",
    grn: "",
    dueDate: "",
    paymentTerms: "",
    taxableAmount: 0,
    gst: 0,
    totalAmount: 0,
    paidAmount: 0,
    balanceAmount: 0,
    status: "Pending",
    remarks: ""
  };

  const [formData,
    setFormData] =
    useState(initialForm);

  // ==========================================
  // Fetch Purchase Bills
  // ==========================================

  const fetchPurchaseBills =
    async () =>
    {

      try
      {

        setLoading(true);

        const response =
          await getPurchaseBills(
            page,
            10,
            search
          );

        setPurchaseBills(
          response.data || []
        );

        setTotalPages(
          response.totalPages || 1
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

  // ==========================================
  // useEffect
  // ==========================================

  useEffect(() =>
  {

    fetchPurchaseBills();

  }, [page]);

  // ==========================================
  // Add Purchase Bill
  // ==========================================

  const handleAdd = () =>
  {

    setFormData(initialForm);

    setSelectedId(null);

    setIsEdit(false);

    setShowModal(true);

  };

  // ==========================================
  // Edit Purchase Bill
  // ==========================================

  const handleEdit =
    (bill) =>
    {

      setSelectedId(
        bill._id
      );

      setFormData(
      {
        billNumber:
          bill.billNumber,

        supplierInvoiceNo:
          bill.supplierInvoiceNo,

        billDate:
          bill.billDate
            ?.substring(0, 10),

        supplier:
          bill.supplier?._id || "",

        purchaseOrder:
          bill.purchaseOrder?._id || "",

        grn:
          bill.grn?._id || "",

        dueDate:
          bill.dueDate
            ?.substring(0, 10),

        paymentTerms:
          bill.paymentTerms || "",

        taxableAmount:
          bill.taxableAmount,

        gst:
          bill.gst,

        totalAmount:
          bill.totalAmount,

        paidAmount:
          bill.paidAmount,

        balanceAmount:
          bill.balanceAmount,

        status:
          bill.status,

        remarks:
          bill.remarks || ""
      });

      setIsEdit(true);

      setShowModal(true);

    };

  // ==========================================
  // Submit Purchase Bill
  // ==========================================

  const handleSubmit =
    async () =>
    {

      try
      {

        if (
          !formData.billNumber.trim()
        )
        {
          return alert(
            "Bill Number Required"
          );
        }

        if (isEdit)
        {

          await updatePurchaseBill(
            selectedId,
            formData
          );

        }

        else
        {

          await createPurchaseBill(
            formData
          );

        }

        setShowModal(false);

        fetchPurchaseBills();

      }

      catch (error)
      {

        alert(
          error.message ||
          error.response?.data?.message
        );

      }

    };

  // ==========================================
  // Delete Purchase Bill
  // ==========================================

  const handleDelete =
    async (id) =>
    {

      const confirmDelete =
        window.confirm(
          "Delete Purchase Bill ?"
        );

      if (!confirmDelete)
        return;

      await deletePurchaseBill(id);

      fetchPurchaseBills();

    };

  // ==========================================
  // Toggle Status
  // ==========================================

  const toggleStatus =
    async (bill) =>
    {

      let nextStatus = "Pending";

      if (
        bill.status ===
        "Pending"
      )
      {
        nextStatus =
          "Partially Paid";
      }

      else if (
        bill.status ===
        "Partially Paid"
      )
      {
        nextStatus =
          "Paid";
      }

      else if (
        bill.status ===
        "Paid"
      )
      {
        nextStatus =
          "Cancelled";
      }

      else
      {
        nextStatus =
          "Pending";
      }

      await updatePurchaseBill(
        bill._id,
        {
          status: nextStatus
        }
      );

      fetchPurchaseBills();

    };
      // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="p-6">

      {/* ==========================================
          Header
      ========================================== */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          Purchase Bills
        </h1>

        <button
          onClick={handleAdd}
          className="bg-orange-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Purchase Bill
        </button>

      </div>

      {/* ==========================================
          Statistics Cards
      ========================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

        <Card>

          <h3 className="text-gray-500 text-sm">
            Total Bills
          </h3>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {purchaseBills.length}
          </h2>

        </Card>

        <Card>

          <h3 className="text-gray-500 text-sm">
            Pending Bills
          </h3>

          <h2 className="text-3xl font-bold text-orange-500 mt-2">
            {
              purchaseBills.filter(
                bill => bill.status === "Pending"
              ).length
            }
          </h2>

        </Card>

        <Card>

          <h3 className="text-gray-500 text-sm">
            Paid Bills
          </h3>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {
              purchaseBills.filter(
                bill => bill.status === "Paid"
              ).length
            }
          </h2>

        </Card>

        <Card>

          <h3 className="text-gray-500 text-sm">
            Total Amount
          </h3>

          <h2 className="text-3xl font-bold text-purple-600 mt-2">

            ₹
            {
              purchaseBills
                .reduce(
                  (sum, bill) =>
                    sum + Number(bill.totalAmount || 0),
                  0
                )
                .toLocaleString()
            }

          </h2>

        </Card>

      </div>

      {/* ==========================================
          Search
      ========================================== */}

      <div className="bg-white rounded-lg shadow p-4 mb-6">

        <div className="relative max-w-md">

          <IoIosSearch
            className="absolute left-3 top-3 text-gray-500"
            size={22}
          />

          <input
            type="text"
            placeholder="Search Purchase Bill..."
            value={search}
            onChange={(e) =>
            {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />

        </div>

      </div>

      {/* ==========================================
          Purchase Bill Table
      ========================================== */}

      <div className="bg-white rounded-lg shadow overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-4 py-3 text-left">
                Bill No
              </th>

              <th className="px-4 py-3 text-left">
                Supplier
              </th>

              <th className="px-4 py-3 text-left">
                GRN
              </th>

              <th className="px-4 py-3 text-left">
                Bill Date
              </th>

              <th className="px-4 py-3 text-right">
                Total
              </th>

              <th className="px-4 py-3 text-right">
                Paid
              </th>

              <th className="px-4 py-3 text-right">
                Balance
              </th>

              <th className="px-4 py-3 text-center">
                Status
              </th>

              <th className="px-4 py-3 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {
              loading ?

                (
                  <tr>

                    <td
                      colSpan="9"
                      className="text-center py-10 text-gray-500"
                    >
                      Loading Purchase Bills...
                    </td>

                  </tr>
                )

                :

                purchaseBills.length === 0 ?

                  (
                    <tr>

                      <td
                        colSpan="9"
                        className="text-center py-10 text-gray-500"
                      >
                        No Purchase Bills Found
                      </td>

                    </tr>
                  )

                  :

                  purchaseBills.map((bill) => (

                    <tr
                      key={bill._id}
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="px-4 py-3">
                        {bill.billNumber}
                      </td>

                      <td className="px-4 py-3">
                        {bill.supplier?.vendorName}
                      </td>

                      <td className="px-4 py-3">
                        {bill.grn?.grnNumber}
                      </td>

                      <td className="px-4 py-3">
                        {bill.billDate?.substring(0, 10)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        ₹{bill.totalAmount}
                      </td>

                      <td className="px-4 py-3 text-right">
                        ₹{bill.paidAmount}
                      </td>

                      <td className="px-4 py-3 text-right">
                        ₹{bill.balanceAmount}
                      </td>

                      <td className="px-4 py-3 text-center">

                        <button
                          onClick={() => toggleStatus(bill)}
                          className={`px-3 py-1 rounded-full text-white text-sm
                          ${
                            bill.status === "Paid"
                              ? "bg-green-600"
                              : bill.status === "Pending"
                              ? "bg-orange-500"
                              : bill.status === "Partially Paid"
                              ? "bg-blue-600"
                              : "bg-red-600"
                          }`}
                        >
                          {bill.status}
                        </button>

                      </td>

                      <td className="px-4 py-3">

                        <div className="flex justify-center gap-3">

                          <button
                            onClick={() => handleEdit(bill)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => handleDelete(bill._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <MdDelete size={20} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

            }

          </tbody>

        </table>

      </div>
            {/* ==========================================
          Pagination
      ========================================== */}

      <div className="flex justify-between items-center mt-6">

        <p className="text-gray-600">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded-lg border
              ${
                page === 1
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            Previous
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded-lg border
              ${
                page === totalPages
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            Next
          </button>

        </div>

      </div>

      {/* ==========================================
          Purchase Bill Modal
      ========================================== */}

      <PurchaseBillModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEdit={isEdit}
      />

    </div>
  );

};

export default PurchaseBill;