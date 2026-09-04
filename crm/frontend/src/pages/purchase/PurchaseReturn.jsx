import React,
{
    useEffect,
    useState,
}
from "react";

import Card from "../../components/Card";

import PurchaseReturnModal from "../../components/PurchaseReturnModal";

import
{
    IoIosSearch,
}
from "react-icons/io";

import
{
    MdDelete,
}
from "react-icons/md";

import
{
    PencilIcon,
}
from "@heroicons/react/24/outline";

import
{
    getPurchaseReturns,
    createPurchaseReturn,
    updatePurchaseReturn,
    deletePurchaseReturn,
}
from "../../services/purchaseReturnService";

//=====================================================
// Purchase Return
//=====================================================

const PurchaseReturn = () =>
{
    //-------------------------------------------------
    // States
    //-------------------------------------------------

    const [purchaseReturns, setPurchaseReturns] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [selectedId, setSelectedId] = useState(null);

    //-------------------------------------------------
    // Form Data
    //-------------------------------------------------

    const initialFormData =
    {
        returnNumber: "",
        returnDate: "",
        supplier: "",
        material: "",
        quantity: "",
        returnReason: "",
        status: "Pending",
        remarks: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    //-------------------------------------------------
    // Load Data
    //-------------------------------------------------

    useEffect(() =>
    {
        fetchPurchaseReturns();
    }, []);

    //-------------------------------------------------
    // Fetch Purchase Returns
    //-------------------------------------------------

    const fetchPurchaseReturns = async () =>
    {
        try
        {
            const response = await getPurchaseReturns();

            setPurchaseReturns(
                response.data ||
                response.purchaseReturns ||
                []
            );
        }
        catch (error)
        {
            console.error(
                "Error fetching Purchase Returns:",
                error
            );
        }
    };

    //-------------------------------------------------
    // Open Add Modal
    //-------------------------------------------------

    const handleAdd = () =>
    {
        setFormData(initialFormData);

        setSelectedId(null);

        setIsEditing(false);

        setIsModalOpen(true);
    };

    //-------------------------------------------------
    // Open Edit Modal
    //-------------------------------------------------

    const handleEdit = (item) =>
    {
        setSelectedId(item._id);

        setFormData(
        {
            returnNumber: item.returnNumber || "",
            returnDate: item.returnDate
                ? item.returnDate.split("T")[0]
                : "",
            supplier: item.supplier?._id || item.supplier || "",
            material: item.material?._id || item.material || "",
            quantity: item.quantity || "",
            returnReason: item.returnReason || "",
            status: item.status || "Pending",
            remarks: item.remarks || "",
        });

        setIsEditing(true);

        setIsModalOpen(true);
    };

    //-------------------------------------------------
    // Save / Update
    //-------------------------------------------------

    const handleSubmit = async () =>
    {
        try
        {
            if (isEditing)
            {
                await updatePurchaseReturn(
                    selectedId,
                    formData
                );
            }
            else
            {
                await createPurchaseReturn(
                    formData
                );
            }

            fetchPurchaseReturns();

            setIsModalOpen(false);

            setFormData(initialFormData);

            setSelectedId(null);
        }
        catch (error)
        {
            console.error(
                "Error saving Purchase Return:",
                error
            );
        }
    };

    //-------------------------------------------------
    // Delete
    //-------------------------------------------------

    const handleDelete = async (id) =>
    {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this Purchase Return?"
        );

        if (!confirmDelete)
        {
            return;
        }

        try
        {
            await deletePurchaseReturn(id);

            fetchPurchaseReturns();
        }
        catch (error)
        {
            console.error(
                "Error deleting Purchase Return:",
                error
            );
        }
    };

    //-------------------------------------------------
    // Search Filter
    //-------------------------------------------------

    const filteredPurchaseReturns =
        purchaseReturns.filter((item) =>
        {
            const search = searchTerm.toLowerCase();

            return (
                item.returnNumber
                    ?.toLowerCase()
                    .includes(search) ||

                item.supplier?.vendorName
                    ?.toLowerCase()
                    .includes(search) ||

                item.material?.materialName
                    ?.toLowerCase()
                    .includes(search) ||

                item.returnReason
                    ?.toLowerCase()
                    .includes(search) ||

                item.status
                    ?.toLowerCase()
                    .includes(search)
            );
        });

    const totalReturns = purchaseReturns.length;

    const pendingReturns =
        purchaseReturns.filter(
            (item) => item.status === "Pending"
        ).length;

    const completedReturns =
        purchaseReturns.filter(
            (item) => item.status === "Completed"
        ).length;
             
        return (
    <>
        {/* Cards */}

        <div className="flex flex-wrap gap-3 mt-4">

            <Card
                title="Total Returns"
                count={totalReturns}
                bg="#FFF7ED"
                color="#C2410C"
            />

            <Card
                title="Pending"
                count={pendingReturns}
                bg="#FEF3C7"
                color="#D97706"
            />

            <Card
                title="Completed"
                count={completedReturns}
                bg="#F0FDF4"
                color="#15803D"
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
                    placeholder="Search Purchase Return"
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
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
                    + Add Purchase Return
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
                            Return No
                        </th>

                        <th className="p-3 text-left">
                            Date
                        </th>

                        <th className="p-3 text-left">
                            Supplier
                        </th>

                        <th className="p-3 text-left">
                            Material
                        </th>

                        <th className="p-3 text-left">
                            Qty
                        </th>

                        <th className="p-3 text-left">
                            Reason
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

                    {filteredPurchaseReturns.map(
                        (item, index) => (

                            <tr
                                key={item._id}
                                className="border-t"
                            >

                                <td className="p-3">
                                    {index + 1}
                                </td>

                                <td className="p-3">
                                    {item.returnNumber}
                                </td>

                                <td className="p-3">
                                    {item.returnDate
                                        ? new Date(
                                              item.returnDate
                                          ).toLocaleDateString()
                                        : "-"}
                                </td>

                                <td className="p-3">
                                    {item.supplier?.vendorName || "-"}
                                </td>

                                <td className="p-3">
                                    {item.material?.materialName || "-"}
                                </td>

                                <td className="p-3">
                                    {item.quantity}
                                </td>

                                <td className="p-3">
                                    {item.returnReason}
                                </td>

                                <td className="p-3">

                                    <span
                                        className={
                                            item.status === "Completed"
                                                ? "bg-green-100 text-green-700 px-3 py-1 rounded"
                                                : item.status === "Rejected"
                                                ? "bg-red-100 text-red-700 px-3 py-1 rounded"
                                                : "bg-yellow-100 text-yellow-700 px-3 py-1 rounded"
                                        }
                                    >
                                        {item.status}
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

                    {filteredPurchaseReturns.length === 0 && (

                        <tr>

                            <td
                                colSpan="9"
                                className="text-center py-5 text-gray-500"
                            >
                                No Purchase Returns Found
                            </td>

                        </tr>

                    )}

                </tbody>

            </table>

        </div>

        <PurchaseReturnModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
        />

    </>
);
    };

export default PurchaseReturn;