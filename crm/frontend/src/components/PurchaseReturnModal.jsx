import React,
{
    useEffect,
    useState,
}
from "react";

import
{
    getAllVendors,
}
from "../services/vendorService";

import
{
    getAllMaterials,
}
from "../services/materialService";

//=====================================================
// Purchase Return Modal
//=====================================================

const PurchaseReturnModal = (
{
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    isEditing,
}) =>
{
    //-------------------------------------------------
    // States
    //-------------------------------------------------

    const [vendors, setVendors] = useState([]);

    const [materials, setMaterials] = useState([]);

    //-------------------------------------------------
    // Load Vendors & Materials
    //-------------------------------------------------

    useEffect(() =>
    {
        if (isOpen)
        {
            fetchVendors();
            fetchMaterials();
        }
    }, [isOpen]);

    //-------------------------------------------------
    // Fetch Vendors
    //-------------------------------------------------

    const fetchVendors = async () =>
    {
        try
        {
            const response = await getAllVendors();

            setVendors(
                response.data ||
                response.vendors ||
                []
            );
        }
        catch (error)
        {
            console.error("Error loading vendors:", error);
        }
    };

    //-------------------------------------------------
    // Fetch Materials
    //-------------------------------------------------

    const fetchMaterials = async () =>
    {
        try
        {
            const response = await getAllMaterials();

            setMaterials(
                response.materials ||
                response.data ||
                []
            );
        }
        catch (error)
        {
            console.error("Error loading materials:", error);
        }
    };

    //-------------------------------------------------
    // Handle Input Change
    //-------------------------------------------------

    const handleChange = (e) =>
    {
        const
        {
            name,
            value,
        } = e.target;

        setFormData(
        {
            ...formData,
            [name]: value,
        });
    };

    //-------------------------------------------------
    // Stop Rendering
    //-------------------------------------------------

    if (!isOpen)
    {
        return null;
    }
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">
                        {isEditing ? "Edit Purchase Return" : "Add Purchase Return"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Return Number */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Return Number
                        </label>

                        <input
                            type="text"
                            name="returnNumber"
                            value={formData.returnNumber}
                            onChange={handleChange}
                            placeholder="Enter Return Number"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Return Date */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Return Date
                        </label>

                        <input
                            type="date"
                            name="returnDate"
                            value={formData.returnDate}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Supplier */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Supplier
                        </label>

                        <select
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">
                                Select Supplier
                            </option>

                            {vendors.map((vendor) => (
                                <option
                                    key={vendor._id}
                                    value={vendor._id}
                                >
                                    {vendor.vendorName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Material */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Material
                        </label>

                        <select
                            name="material"
                            value={formData.material}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">
                                Select Material
                            </option>

                            {materials.map((material) => (
                                <option
                                    key={material._id}
                                    value={material._id}
                                >
                                    {material.materialName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Quantity
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="Enter Quantity"
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    {/* Return Reason */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Return Reason
                        </label>

                        <select
                            name="returnReason"
                            value={formData.returnReason}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">
                                Select Reason
                            </option>

                            <option value="Damaged">
                                Damaged
                            </option>

                            <option value="Wrong Material">
                                Wrong Material
                            </option>

                            <option value="Excess Quantity">
                                Excess Quantity
                            </option>

                            <option value="Quality Failure">
                                Quality Failure
                            </option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Status
                        </label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Approved">
                                Approved
                            </option>

                            <option value="Rejected">
                                Rejected
                            </option>

                            <option value="Completed">
                                Completed
                            </option>
                        </select>
                    </div>

                    {/* Remarks */}
                    <div className="md:col-span-2">
                        <label className="block mb-1 font-medium">
                            Remarks
                        </label>

                        <textarea
                            rows="4"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            placeholder="Enter Remarks"
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onSubmit}
                        className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                        {isEditing ? "Update" : "Save"}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default PurchaseReturnModal;