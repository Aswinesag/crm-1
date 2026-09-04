import React,
{
    useEffect,
    useState,
}
from "react";

import
{
    getGoodsReceiptNotes,
}
from "../services/goodsReceiptNoteService";

import
{
    getAllVendors,
}
from "../services/vendorService";

import
{
    getPurchaseOrders,
}
from "../services/purchaseOrderService";

const PurchaseBillModal = (
{
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    isEdit,
}) => {
   
    const [vendors, setVendors] =
        useState([]);

    const [grns, setGRNs] =
        useState([]);

    const [purchaseOrders,
        setPurchaseOrders] =
        useState([]);

    const [loading,
        setLoading] =
        useState(false);

    //--------------------------------------------------
    // Initial Form
    //--------------------------------------------------

    const initialForm =
    {
        billNumber: "",

        supplierInvoiceNo: "",

        billDate:
            new Date()
                .toISOString()
                .split("T")[0],

        supplier: "",

        purchaseOrder: "",

        grn: "",

        dueDate:
            new Date()
                .toISOString()
                .split("T")[0],

        paymentTerms: "",

        taxableAmount: 0,

        gst: 0,

        totalAmount: 0,

        paidAmount: 0,

        balanceAmount: 0,

        status: "Pending",

        remarks: "",
    };

    //--------------------------------------------------
    // Fetch Vendors
    //--------------------------------------------------

 const fetchVendors = async () =>
{
    try
    {
        const response = await getAllVendors();

        console.log("Vendor Response:", response);

        setVendors(response.data || []);
    }
    catch (error)
    {
        console.log("Vendor Error:", error);

        setVendors([]);
    }
};

    //--------------------------------------------------
    // Fetch Purchase Orders
    //--------------------------------------------------

    const fetchPurchaseOrders =
        async () =>
    {
        try
        {
            const response =
                await getPurchaseOrders();

            console.log(
                "PO Response :",
                response.data
            );

            setPurchaseOrders(
                response.data.data || []
            );
        }
        catch (error)
        {
            console.log(error);

            setPurchaseOrders([]);
        }
    };

    //--------------------------------------------------
    // Fetch GRNs
    //--------------------------------------------------

    const fetchGRNs =
        async () =>
    {
        try
        {
            const response =
                await getGoodsReceiptNotes();

            console.log(
                "GRN Response :",
                response.data
            );

            setGRNs(
                response.data.data || []
            );
        }
        catch (error)
        {
            console.log(error);

            setGRNs([]);
        }
    };

    //--------------------------------------------------
    // Load Dropdown Data
    //--------------------------------------------------

    useEffect(() =>
    {
        if (isOpen)
        {
            fetchVendors();

            fetchPurchaseOrders();

            fetchGRNs();
        }

    }, [isOpen]);

    //--------------------------------------------------
    // Reset Form
    //--------------------------------------------------

    useEffect(() =>
    {
        if (!isOpen)
            return;

        if (!isEdit)
        {
            setFormData(initialForm);
        }

    }, [isOpen]);

    //--------------------------------------------------
    // Handle Input Change
    //--------------------------------------------------

    const handleChange =
        (e) =>
    {
        const
        {
            name,
            value
        }
            = e.target;

        setFormData(
            (prev) =>
            ({
                ...prev,
                [name]: value,
            })
        );
    };

    //--------------------------------------------------
    // Handle GRN Change
    //--------------------------------------------------

    const handleGRNChange =
        (e) =>
    {
        const grnId =
            e.target.value;

        const selectedGRN =
            grns.find(
                item =>
                item._id === grnId
            );

        if (!selectedGRN)
            return;

        setFormData(
            (prev) =>
            ({
                ...prev,

                grn:
                    selectedGRN._id,

                supplier:
                    selectedGRN.supplier?._id || "",

                purchaseOrder:
                    selectedGRN.purchaseOrder?._id || "",
            })
        );
    };

    //--------------------------------------------------
    // Handle Submit
    //--------------------------------------------------

    const handleSubmit =
        async (e) =>
    {
        e.preventDefault();

        try
        {
            setLoading(true);

            await onSubmit(
                formData
            );

            onClose();
        }
        catch (error)
        {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to save Purchase Bill"
            );
        }
        finally
        {
            setLoading(false);
        }
    };
        //--------------------------------------------------
    // Don't Render When Closed
    //--------------------------------------------------

    if (!isOpen)
    {
        return null;
    }

    //--------------------------------------------------
    // Modal UI
    //--------------------------------------------------

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">

                {/* Header */}

                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEdit
                            ? "Edit Purchase Bill"
                            : "Add Purchase Bill"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-2xl text-gray-500 hover:text-red-600"
                    >
                        ×
                    </button>

                </div>

                {/* Form */}

                <form onSubmit={handleSubmit}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Bill Number */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Bill Number
                            </label>

                            <input
                                type="text"
                                name="billNumber"
                                value={formData.billNumber}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />

                        </div>

                        {/* Supplier Invoice Number */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Supplier Invoice No
                            </label>

                            <input
                                type="text"
                                name="supplierInvoiceNo"
                                value={formData.supplierInvoiceNo}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />

                        </div>

                        {/* Bill Date */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Bill Date
                            </label>

                            <input
                                type="date"
                                name="billDate"
                                value={formData.billDate}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />

                        </div>

                        {/* Due Date */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Due Date
                            </label>

                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
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
                                className="w-full border rounded-lg px-3 py-2"
                                required
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

                        {/* Purchase Order */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Purchase Order
                            </label>

                            <select
                                name="purchaseOrder"
                                value={formData.purchaseOrder}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            >

                                <option value="">
                                    Select Purchase Order
                                </option>

                                {purchaseOrders.map((po) => (

                                    <option
                                        key={po._id}
                                        value={po._id}
                                    >
                                        {po.poNumber}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* GRN */}

                        <div>

                            <label className="block mb-1 font-medium">
                                GRN
                            </label>

                            <select
                                name="grn"
                                value={formData.grn}
                                onChange={handleGRNChange}
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            >

                                <option value="">
                                    Select GRN
                                </option>

                                {grns.map((grn) => (

                                    <option
                                        key={grn._id}
                                        value={grn._id}
                                    >
                                        {grn.grnNumber}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* Payment Terms */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Payment Terms
                            </label>

                            <input
                                type="text"
                                name="paymentTerms"
                                value={formData.paymentTerms}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                                placeholder="30 Days"
                            />

                        </div>

                        {/* Taxable Amount */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Taxable Amount
                            </label>

                            <input
                                type="number"
                                name="taxableAmount"
                                value={formData.taxableAmount}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>

                        {/* GST */}

                        <div>

                            <label className="block mb-1 font-medium">
                                GST
                            </label>

                            <input
                                type="number"
                                name="gst"
                                value={formData.gst}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>

                        {/* Total Amount */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Total Amount
                            </label>

                            <input
                                type="number"
                                name="totalAmount"
                                value={formData.totalAmount}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>

                        {/* Paid Amount */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Paid Amount
                            </label>

                            <input
                                type="number"
                                name="paidAmount"
                                value={formData.paidAmount}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>

                        {/* Balance Amount */}

                        <div>

                            <label className="block mb-1 font-medium">
                                Balance Amount
                            </label>

                            <input
                                type="number"
                                name="balanceAmount"
                                value={formData.balanceAmount}
                                readOnly
                                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                            />

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
                                className="w-full border rounded-lg px-3 py-2"
                            >

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Partially Paid">
                                    Partially Paid
                                </option>

                                <option value="Paid">
                                    Paid
                                </option>

                                <option value="Cancelled">
                                    Cancelled
                                </option>

                            </select>

                        </div>

                        {/* Remarks */}

                        <div className="md:col-span-2">

                            <label className="block mb-1 font-medium">
                                Remarks
                            </label>

                            <textarea
                                rows={4}
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2"
                            />

                        </div>

                    </div>

                    {/* Footer */}

                    <div className="flex justify-end gap-3 mt-8">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-[#FB6514] text-white rounded-lg hover:bg-orange-600 disabled:opacity-60"
                        >
                            {loading
                                ? "Saving..."
                                : isEdit
                                    ? "Update Purchase Bill"
                                    : "Save Purchase Bill"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );

};

export default PurchaseBillModal;