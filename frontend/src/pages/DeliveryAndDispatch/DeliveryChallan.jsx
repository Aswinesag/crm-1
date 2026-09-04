import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";
import DummyTrackingProvider from "../../services/DummyTrackingProvider.js";
import { normalizeId } from "../../utils/deliveryWorkflowStatus.js";
import {
    getDeliveryChallanStatus,
    getDeliveryChallanStatusColor
} from "../../utils/shipmentStatusMapper.js";

const DeliveryChallan = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState(null);

  // Sample delivery challan data
  const [deliveryChallans, setDeliveryChallans] = useState(() => {
    const stored = localStorage.getItem("crm_delivery_challans");
    if (stored) {
      try { return JSON.parse(stored); } catch { /* use backward-compatible samples */ }
    }
    return [
    {
      id: "DC-001",
      challanNumber: "DC-2024-001",
      dispatchOrderNumber: "DISP-2024-001",
      challanDate: "2024-01-15",
      customerName: "ABC Corporation",
      customerCode: "CUST-001",
      billingAddress: "123 Business Street, Chennai - 600001",
      shippingAddress: "123 Business Street, Chennai - 600001",
      gstin: "29ABCDE1234F1Z5",
      contactPerson: "John Doe",
      contactNumber: "9876543210",
      vehicleNumber: "TN-01-AB-1234",
      lrNumber: "LR-2024-001",
      totalQuantity: 100,
      totalWeight: 500,
      cgst: 4500,
      sgst: 4500,
      igst: 0,
      grandTotal: 54000,
      status: "Delivered",
      remarks: "Standard delivery",
      items: [
        {
          id: "ITEM-001",
          productCode: "PROD-001",
          productName: "Industrial Pump",
          description: "High capacity industrial pump",
          hsnCode: "8413",
          quantity: 50,
          unit: "Nos",
          rate: 500,
          cgstPercent: 9,
          sgstPercent: 9,
          igstPercent: 0,
          cgstAmount: 2250,
          sgstAmount: 2250,
          igstAmount: 0,
          totalAmount: 27000
        },
        {
          id: "ITEM-002",
          productCode: "PROD-002",
          productName: "Motor Assembly",
          description: "Electric motor assembly unit",
          hsnCode: "8501",
          quantity: 50,
          unit: "Nos",
          rate: 540,
          cgstPercent: 9,
          sgstPercent: 9,
          igstPercent: 0,
          cgstAmount: 2430,
          sgstAmount: 2430,
          igstAmount: 0,
          totalAmount: 27000
        }
      ]
    },
    {
      id: "DC-002",
      challanNumber: "DC-2024-002",
      dispatchOrderNumber: "DISP-2024-002",
      challanDate: "2024-01-20",
      customerName: "XYZ Industries",
      customerCode: "CUST-002",
      billingAddress: "456 Industrial Area, Coimbatore - 641001",
      shippingAddress: "456 Industrial Area, Coimbatore - 641001",
      gstin: "29FGHIJ5678K2L6",
      contactPerson: "Jane Smith",
      contactNumber: "8765432109",
      vehicleNumber: "TN-02-CD-5678",
      lrNumber: "LR-2024-002",
      totalQuantity: 75,
      totalWeight: 375,
      cgst: 0,
      sgst: 0,
      igst: 6750,
      grandTotal: 40500,
      status: "In Transit",
      remarks: "Inter-state delivery",
      items: [
        {
          id: "ITEM-003",
          productCode: "PROD-003",
          productName: "Control Panel",
          description: "Automated control panel system",
          hsnCode: "8537",
          quantity: 75,
          unit: "Nos",
          rate: 540,
          cgstPercent: 0,
          sgstPercent: 0,
          igstPercent: 18,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 6750,
          totalAmount: 40500
        }
      ]
    },
    {
      id: "DC-003",
      challanNumber: "DC-2024-003",
      dispatchOrderNumber: "DISP-2024-003",
      challanDate: "2024-01-25",
      customerName: "Global Tech Solutions",
      customerCode: "CUST-003",
      billingAddress: "789 Tech Park, Bangalore - 560001",
      shippingAddress: "789 Tech Park, Bangalore - 560001",
      gstin: "29KLMNO3456M3N7",
      contactPerson: "Mike Johnson",
      contactNumber: "7654321098",
      vehicleNumber: "KA-01-EF-9012",
      lrNumber: "LR-2024-003",
      totalQuantity: 200,
      totalWeight: 1000,
      cgst: 0,
      sgst: 0,
      igst: 9000,
      grandTotal: 54000,
      status: "Pending",
      remarks: "Bulk order",
      items: [
        {
          id: "ITEM-004",
          productCode: "PROD-004",
          productName: "Sensors Kit",
          description: "Industrial sensor kit",
          hsnCode: "9031",
          quantity: 200,
          unit: "Nos",
          rate: 270,
          cgstPercent: 0,
          sgstPercent: 0,
          igstPercent: 18,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 9000,
          totalAmount: 54000
        }
      ]
    }
    ];
  });

  useEffect(() => {
    localStorage.setItem("crm_delivery_challans", JSON.stringify(deliveryChallans));
  }, [deliveryChallans]);

  const [linkedShipments, setLinkedShipments] = useState([]);

  // Load shipment statuses on mount and when shipments change
  useEffect(() => {
    const loadShipmentStatuses = () => {
      const shipments = DummyTrackingProvider.getAllShipments();
      setLinkedShipments(shipments);
    };

    loadShipmentStatuses();

    // Listen for shipment update events (same-tab)
    const handleShipmentUpdate = () => {
      loadShipmentStatuses();
    };

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'crm_shipments') {
        loadShipmentStatuses();
      }
    };

    window.addEventListener('shipment-created', handleShipmentUpdate);
    window.addEventListener('shipment-updated', handleShipmentUpdate);
    window.addEventListener('shipment-delivered', handleShipmentUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('shipment-created', handleShipmentUpdate);
      window.removeEventListener('shipment-updated', handleShipmentUpdate);
      window.removeEventListener('shipment-delivered', handleShipmentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [deliveryChallans]);

  const formalChallansByDispatch = new Map(
    deliveryChallans.map((challan) => [normalizeId(challan.dispatchOrderNumber), challan])
  );
  const shipmentDispatches = new Set();
  const challanRows = linkedShipments.map((shipment) => {
    const key = normalizeId(shipment.dispatchOrderNumber);
    shipmentDispatches.add(key);
    const formal = formalChallansByDispatch.get(key);
    if (formal) {
      return {
        ...formal,
        trackingNumber: formal.trackingNumber || shipment.trackingNumber,
        shipmentStatus: shipment.status || "Not Created",
        currentLocation: shipment.currentLocation || "",
      };
    }
    return {
      id: `candidate-${key}`,
      isCandidate: true,
      challanNumber: "Not Generated",
      challanDate: "—",
      dispatchOrderNumber: shipment.dispatchOrderNumber || "",
      trackingNumber: shipment.trackingNumber || "",
      customerName: shipment.customerName || "Unknown Customer",
      customerCode: "",
      billingAddress: shipment.deliveryAddress || "",
      shippingAddress: shipment.deliveryAddress || "",
      vehicleNumber: shipment.vehicleNumber || "",
      driverName: shipment.driverName || "",
      transporterName: shipment.transporterName || "",
      shipmentStatus: shipment.status || "Not Created",
      currentLocation: shipment.currentLocation || "",
      totalQuantity: 0,
      grandTotal: 0,
      lrNumber: "",
      items: [],
    };
  });
  deliveryChallans.forEach((challan) => {
    if (!shipmentDispatches.has(normalizeId(challan.dispatchOrderNumber))) {
      challanRows.push({ ...challan, shipmentStatus: "Not Created" });
    }
  });

  const [formData, setFormData] = useState({
    challanNumber: "",
    dispatchOrderNumber: "",
    challanDate: "",
    customerName: "",
    customerCode: "",
    billingAddress: "",
    shippingAddress: "",
    gstin: "",
    contactPerson: "",
    contactNumber: "",
    vehicleNumber: "",
    lrNumber: "",
    remarks: "",
    items: [
      {
        productCode: "",
        productName: "",
        description: "",
        hsnCode: "",
        quantity: 0,
        unit: "Nos",
        rate: 0,
        cgstPercent: 9,
        sgstPercent: 9,
        igstPercent: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalAmount: 0
      }
    ]
  });

  const filteredChallans = challanRows.filter((challan) => {
    const matchesSearch =
      String(challan.challanNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(challan.dispatchOrderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(challan.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(challan.vehicleNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(challan.lrNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by derived shipment status
    const shipmentStatus = challan.shipmentStatus;
    const derivedStatus = getDeliveryChallanStatus(shipmentStatus);
    const matchesStatus = statusFilter ? derivedStatus === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const totalChallans = challanRows.length;
  const pendingChallans = challanRows.filter((c) => {
    const shipmentStatus = c.shipmentStatus;
    const status = getDeliveryChallanStatus(shipmentStatus);
    return status === "Pending";
  }).length;
  const inTransitChallans = challanRows.filter((c) => {
    const shipmentStatus = c.shipmentStatus;
    const status = getDeliveryChallanStatus(shipmentStatus);
    return status === "In Transit";
  }).length;
  const deliveredChallans = challanRows.filter((c) => {
    const shipmentStatus = c.shipmentStatus;
    const status = getDeliveryChallanStatus(shipmentStatus);
    return status === "Completed";
  }).length;
  const totalAmount = deliveryChallans.reduce((sum, c) => sum + c.grandTotal, 0);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productCode: "",
          productName: "",
          description: "",
          hsnCode: "",
          quantity: 0,
          unit: "Nos",
          rate: 0,
          cgstPercent: 9,
          sgstPercent: 9,
          igstPercent: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalAmount: 0
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    } else {
      toast.error("At least one item is required");
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amounts when rate or GST changes
    if (field === 'rate' || field === 'quantity' || field === 'cgstPercent' || field === 'sgstPercent' || field === 'igstPercent') {
      const qty = newItems[index].quantity || 0;
      const rate = newItems[index].rate || 0;
      const baseAmount = qty * rate;
      const cgstPct = newItems[index].cgstPercent || 0;
      const sgstPct = newItems[index].sgstPercent || 0;
      const igstPct = newItems[index].igstPercent || 0;
      
      newItems[index].cgstAmount = (baseAmount * cgstPct) / 100;
      newItems[index].sgstAmount = (baseAmount * sgstPct) / 100;
      newItems[index].igstAmount = (baseAmount * igstPct) / 100;
      newItems[index].totalAmount = baseAmount + newItems[index].cgstAmount + newItems[index].sgstAmount + newItems[index].igstAmount;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleCreateChallan = (e) => {
    e.preventDefault();
    if (deliveryChallans.some((challan) =>
      normalizeId(challan.dispatchOrderNumber) === normalizeId(formData.dispatchOrderNumber)
    )) {
      toast.error("A delivery challan already exists for this dispatch order.");
      return;
    }
    const totalQty = formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalWeight = formData.items.reduce((sum, item) => sum + (item.quantity || 0) * 5, 0); // Assuming 5kg per unit
    const totalCgst = formData.items.reduce((sum, item) => sum + (item.cgstAmount || 0), 0);
    const totalSgst = formData.items.reduce((sum, item) => sum + (item.sgstAmount || 0), 0);
    const totalIgst = formData.items.reduce((sum, item) => sum + (item.igstAmount || 0), 0);
    const grandTotal = formData.items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    const newChallan = {
      ...formData,
      id: `DC-${String(deliveryChallans.length + 1).padStart(3, '0')}`,
      totalQuantity: totalQty,
      totalWeight: totalWeight,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      grandTotal: grandTotal,
      status: "Generated",
      generatedAt: Date.now()
    };
    const nextChallans = [...deliveryChallans, newChallan];
    // Persist before notifying sibling modules so event handlers always read
    // the newly generated formal record.
    localStorage.setItem("crm_delivery_challans", JSON.stringify(nextChallans));
    setDeliveryChallans(nextChallans);
    window.dispatchEvent(
      new CustomEvent("challan-generated", {
        detail: {
          dispatchOrderNumber: newChallan.dispatchOrderNumber,
          trackingNumber: newChallan.trackingNumber || "",
          challan: newChallan,
        },
      })
    );
    setShowCreateModal(false);
    setFormData({
      challanNumber: "",
      dispatchOrderNumber: "",
      challanDate: "",
      customerName: "",
      customerCode: "",
      billingAddress: "",
      shippingAddress: "",
      gstin: "",
      contactPerson: "",
      contactNumber: "",
      vehicleNumber: "",
      lrNumber: "",
      remarks: "",
      items: [
        {
          productCode: "",
          productName: "",
          description: "",
          hsnCode: "",
          quantity: 0,
          unit: "Nos",
          rate: 0,
          cgstPercent: 9,
          sgstPercent: 9,
          igstPercent: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalAmount: 0
        }
      ]
    });
    toast.success("Delivery challan created successfully!");
  };

  const handleGenerateCandidate = (challan) => {
    setFormData((current) => ({
      ...current,
      challanNumber: `DC-${Date.now()}`,
      dispatchOrderNumber: challan.dispatchOrderNumber,
      trackingNumber: challan.trackingNumber || "",
      challanDate: new Date().toISOString().slice(0, 10),
      customerName: challan.customerName || "",
      billingAddress: challan.billingAddress || challan.shippingAddress || "",
      shippingAddress: challan.shippingAddress || "",
      vehicleNumber: challan.vehicleNumber || "",
      remarks: `Tracking: ${challan.trackingNumber || "Not available"}`,
    }));
    setShowCreateModal(true);
  };

  const handleViewChallan = (challan) => {
    setSelectedChallan(challan);
    setShowViewModal(true);
  };

  const handleDeleteChallan = (id) => {
    if (window.confirm("Are you sure you want to delete this delivery challan?")) {
      setDeliveryChallans(deliveryChallans.filter((c) => c.id !== id));
      toast.success("Delivery challan deleted successfully!");
    }
  };

  return (
    <div className="mt-4">
      <Toaster />

      {/* Breadcrumb */}
      <div>
        <Link to="/" className="hover:text-[#C2410C]">
          Dashboard
        </Link>{" "}
        / <span className="text-[#C2410C]"> Delivery & Dispatch </span> /{" "}
        <span className="text-[#C2410C]"> Delivery Challan </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Challans"
          count={totalChallans}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Pending"
          count={pendingChallans}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="In Transit"
          count={inTransitChallans}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Delivered"
          count={deliveredChallans}
          bg="#ECFDF5"
          color="#059669"
        />
        <Card
          title="Total Amount"
          count={`₹${totalAmount.toLocaleString()}`}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
      </div>

      {/* Search + Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-6 mt-6">
        <div className="relative w-full max-w-md cursor-pointer">
          <IoIosSearch
            size={22}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search delivery challans..."
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-col xl:flex-row items-center">
          <select
            className="w-64 border bg-white border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending Dispatch">Pending Dispatch</option>
            <option value="In Transit">In Transit</option>
            <option value="Ready for Delivery">Ready for Delivery</option>
            <option value="Completed">Completed</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Challan</button>
          </div>
        </div>
      </div>

      {/* Delivery Challans Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Challan No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Dispatch Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Customer
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Challan Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Vehicle No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Quantity
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Amount
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Status
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tr-md">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredChallans.length > 0 ? (
              filteredChallans.map((challan) => (
                <tr key={challan.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {challan.challanNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {challan.dispatchOrderNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{challan.customerName}</p>
                      <p className="text-xs text-gray-500">{challan.customerCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {challan.challanDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {challan.vehicleNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {challan.totalQuantity}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    ₹{challan.grandTotal.toLocaleString()}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {/* Display derived shipment status */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${
                        getDeliveryChallanStatusColor(
                          challan.shipmentStatus
                        )
                      }`}
                    >
                      {getDeliveryChallanStatus(
                        challan.shipmentStatus
                      )}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      {challan.isCandidate && challan.shipmentStatus === "Out For Delivery" && (
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-orange-500 text-white text-xs whitespace-nowrap"
                          onClick={() => handleGenerateCandidate(challan)}
                        >
                          Generate Challan
                        </button>
                      )}
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewChallan(challan)}
                      />
                      <FiEdit
                        className="text-green-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Edit functionality coming soon")}
                      />
                      <FiPrinter
                        className="text-purple-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Print functionality coming soon")}
                      />
                      <FiDownload
                        className="text-cyan-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Download functionality coming soon")}
                      />
                      {!challan.isCandidate && <FiTrash2
                        className="text-red-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleDeleteChallan(challan.id)}
                      />}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 bg-white border-gray-300 text-gray-700 text-center"
                  colSpan={9}
                >
                  No Delivery Challan Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Delivery Challan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-7xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Delivery Challan</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChallan}>
              {/* Challan Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Challan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Challan Number</label>
                    <input
                      type="text"
                      name="challanNumber"
                      value={formData.challanNumber}
                      onChange={(e) => setFormData({ ...formData, challanNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="DC-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Dispatch Order Number</label>
                    <input
                      type="text"
                      name="dispatchOrderNumber"
                      value={formData.dispatchOrderNumber}
                      onChange={(e) => setFormData({ ...formData, dispatchOrderNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="DISP-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Challan Date</label>
                    <input
                      type="date"
                      name="challanDate"
                      value={formData.challanDate}
                      onChange={(e) => setFormData({ ...formData, challanDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Customer Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Customer Code</label>
                    <input
                      type="text"
                      name="customerCode"
                      value={formData.customerCode}
                      onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="CUST-001"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">GSTIN</label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="29ABCDE1234F1Z5"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter contact person"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Contact Number</label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Billing Address</label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter billing address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Shipping Address</label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter shipping address"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Transport Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Transport Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Vehicle Number</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="TN-01-AB-1234"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">LR Number</label>
                    <input
                      type="text"
                      name="lrNumber"
                      value={formData.lrNumber}
                      onChange={(e) => setFormData({ ...formData, lrNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="LR-2024-001"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer text-sm"
                  >
                    <FiPlus />
                    Add Item
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Product Code</th>
                        <th className="p-2 text-left">Product Name</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-left">HSN Code</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-right">CGST %</th>
                        <th className="p-2 text-right">SGST %</th>
                        <th className="p-2 text-right">IGST %</th>
                        <th className="p-2 text-right">CGST Amt</th>
                        <th className="p-2 text-right">SGST Amt</th>
                        <th className="p-2 text-right">IGST Amt</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.productCode}
                              onChange={(e) => handleItemChange(index, 'productCode', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="PROD-001"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.productName}
                              onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="Product name"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="Description"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.hsnCode}
                              onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="HSN"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                            >
                              <option value="Nos">Nos</option>
                              <option value="Kg">Kg</option>
                              <option value="Ltr">Ltr</option>
                              <option value="Mtr">Mtr</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.cgstPercent}
                              onChange={(e) => handleItemChange(index, 'cgstPercent', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.sgstPercent}
                              onChange={(e) => handleItemChange(index, 'sgstPercent', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.igstPercent}
                              onChange={(e) => handleItemChange(index, 'igstPercent', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            {item.cgstAmount.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-medium">
                            {item.sgstAmount.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-medium">
                            {item.igstAmount.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-medium">
                            {item.totalAmount.toFixed(2)}
                          </td>
                          <td className="p-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              <div className="mb-6">
                <label className="block mb-1 font-medium text-sm">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                  rows="3"
                  placeholder="Enter any additional remarks"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-400 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FB6514] text-white rounded-md cursor-pointer hover:bg-[#e55a0d]"
                >
                  Create Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Delivery Challan Modal */}
      {showViewModal && selectedChallan && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-7xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Delivery Challan Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Challan Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Challan Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Challan Number</p>
                    <p className="font-medium">{selectedChallan.challanNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dispatch Order No</p>
                    <p className="font-medium">{selectedChallan.dispatchOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Challan Date</p>
                    <p className="font-medium">{selectedChallan.challanDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedChallan.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : selectedChallan.status === "In Transit"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {selectedChallan.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium">{selectedChallan.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer Code</p>
                    <p className="font-medium">{selectedChallan.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GSTIN</p>
                    <p className="font-medium">{selectedChallan.gstin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{selectedChallan.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{selectedChallan.contactNumber}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-500">Billing Address</p>
                    <p className="font-medium">{selectedChallan.billingAddress}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="font-medium">{selectedChallan.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {/* Transport Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Transport Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Number</p>
                    <p className="font-medium">{selectedChallan.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">LR Number</p>
                    <p className="font-medium">{selectedChallan.lrNumber}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Product Code</th>
                        <th className="p-2 text-left">Product Name</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-left">HSN Code</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-right">Rate</th>
                        <th className="p-2 text-right">CGST %</th>
                        <th className="p-2 text-right">SGST %</th>
                        <th className="p-2 text-right">IGST %</th>
                        <th className="p-2 text-right">CGST Amt</th>
                        <th className="p-2 text-right">SGST Amt</th>
                        <th className="p-2 text-right">IGST Amt</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedChallan.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productCode}</td>
                          <td className="p-2 font-medium">{item.productName}</td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2">{item.hsnCode}</td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2">{item.unit}</td>
                          <td className="p-2 text-right">₹{item.rate.toFixed(2)}</td>
                          <td className="p-2 text-right">{item.cgstPercent}%</td>
                          <td className="p-2 text-right">{item.sgstPercent}%</td>
                          <td className="p-2 text-right">{item.igstPercent}%</td>
                          <td className="p-2 text-right">₹{item.cgstAmount.toFixed(2)}</td>
                          <td className="p-2 text-right">₹{item.sgstAmount.toFixed(2)}</td>
                          <td className="p-2 text-right">₹{item.igstAmount.toFixed(2)}</td>
                          <td className="p-2 text-right font-medium">₹{item.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-green-50 p-4 rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Quantity</p>
                    <p className="font-bold text-lg">{selectedChallan.totalQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Weight</p>
                    <p className="font-bold text-lg">{selectedChallan.totalWeight}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CGST</p>
                    <p className="font-bold text-lg">₹{selectedChallan.cgst.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SGST</p>
                    <p className="font-bold text-lg">₹{selectedChallan.sgst.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IGST</p>
                    <p className="font-bold text-lg">₹{selectedChallan.igst.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2 md:col-span-5 border-t pt-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 font-medium">Grand Total</p>
                      <p className="font-bold text-2xl text-green-600">₹{selectedChallan.grandTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-purple-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedChallan.remarks || '-'}</p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-400 rounded-md cursor-pointer hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => toast.info("Print functionality coming soon")}
                  className="px-6 py-2 bg-[#FB6514] text-white rounded-md cursor-pointer hover:bg-[#e55a0d]"
                >
                  Print Challan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryChallan;
