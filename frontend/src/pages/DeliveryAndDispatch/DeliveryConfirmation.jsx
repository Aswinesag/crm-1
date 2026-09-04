import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter, FiCheck } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";
import DummyTrackingProvider from "../../services/DummyTrackingProvider.js";
import { normalizeId } from "../../utils/deliveryWorkflowStatus.js";
import {
    getDeliveryConfirmationStatus,
    getDeliveryConfirmationStatusColor,
    isDeliveryConfirmationAllowed,
    isShipmentComplete
} from "../../utils/shipmentStatusMapper.js";

const DeliveryConfirmation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedConfirmation, setSelectedConfirmation] = useState(null);

  // Sample delivery confirmation data
  const [deliveryConfirmations, setDeliveryConfirmations] = useState(() => {
    const stored = localStorage.getItem("crm_delivery_confirmations");
    if (stored) {
      try { return JSON.parse(stored); } catch { /* use backward-compatible samples */ }
    }
    return [
    {
      id: "DCONF-001",
      confirmationNumber: "DCONF-2024-001",
      dispatchOrderNumber: "DISP-2024-001",
      deliveryChallanNumber: "DC-2024-001",
      confirmationDate: "2024-01-15",
      customerName: "ABC Corporation",
      customerCode: "CUST-001",
      deliveryAddress: "123 Business Street, Chennai - 600001",
      contactPerson: "John Doe",
      contactNumber: "9876543210",
      vehicleNumber: "TN-01-AB-1234",
      driverName: "Raj Kumar",
      driverNumber: "8765432109",
      deliveryDate: "2024-01-15",
      deliveryTime: "14:30",
      receivedBy: "John Doe",
      receivedSignature: "Pending",
      totalQuantity: 100,
      totalWeight: 500,
      condition: "Good",
      status: "Confirmed",
      remarks: "Delivered successfully",
      items: [
        {
          id: "ITEM-001",
          productCode: "PROD-001",
          productName: "Industrial Pump",
          description: "High capacity industrial pump",
          quantity: 50,
          unit: "Nos",
          receivedQuantity: 50,
          condition: "Good",
          remarks: "No damages"
        },
        {
          id: "ITEM-002",
          productCode: "PROD-002",
          productName: "Motor Assembly",
          description: "Electric motor assembly unit",
          quantity: 50,
          unit: "Nos",
          receivedQuantity: 50,
          condition: "Good",
          remarks: "Packaging intact"
        }
      ]
    },
    {
      id: "DCONF-002",
      confirmationNumber: "DCONF-2024-002",
      dispatchOrderNumber: "DISP-2024-002",
      deliveryChallanNumber: "DC-2024-002",
      confirmationDate: "2024-01-20",
      customerName: "XYZ Industries",
      customerCode: "CUST-002",
      deliveryAddress: "456 Industrial Area, Coimbatore - 641001",
      contactPerson: "Jane Smith",
      contactNumber: "8765432109",
      vehicleNumber: "TN-02-CD-5678",
      driverName: "Suresh Kumar",
      driverNumber: "7654321098",
      deliveryDate: "2024-01-20",
      deliveryTime: "16:00",
      receivedBy: "Jane Smith",
      receivedSignature: "Pending",
      totalQuantity: 75,
      totalWeight: 375,
      condition: "Good",
      status: "Pending",
      remarks: "Awaiting confirmation",
      items: [
        {
          id: "ITEM-003",
          productCode: "PROD-003",
          productName: "Control Panel",
          description: "Automated control panel system",
          quantity: 75,
          unit: "Nos",
          receivedQuantity: 75,
          condition: "Good",
          remarks: "Inspection pending"
        }
      ]
    },
    {
      id: "DCONF-003",
      confirmationNumber: "DCONF-2024-003",
      dispatchOrderNumber: "DISP-2024-003",
      deliveryChallanNumber: "DC-2024-003",
      confirmationDate: "2024-01-25",
      customerName: "Global Tech Solutions",
      customerCode: "CUST-003",
      deliveryAddress: "789 Tech Park, Bangalore - 560001",
      contactPerson: "Mike Johnson",
      contactNumber: "7654321098",
      vehicleNumber: "KA-01-EF-9012",
      driverName: "Venkat",
      driverNumber: "6543210987",
      deliveryDate: "2024-01-26",
      deliveryTime: "10:00",
      receivedBy: "",
      receivedSignature: "Pending",
      totalQuantity: 200,
      totalWeight: 1000,
      condition: "Good",
      status: "Pending",
      remarks: "Scheduled for delivery",
      items: [
        {
          id: "ITEM-004",
          productCode: "PROD-004",
          productName: "Sensors Kit",
          description: "Industrial sensor kit",
          quantity: 200,
          unit: "Nos",
          receivedQuantity: 0,
          condition: "Good",
          remarks: ""
        }
      ]
    }
    ];
  });

  useEffect(() => {
    localStorage.setItem("crm_delivery_confirmations", JSON.stringify(deliveryConfirmations));
  }, [deliveryConfirmations]);

  const [linkedShipments, setLinkedShipments] = useState([]);

  // Load shipment statuses on mount and when shipments change
  useEffect(() => {
    const loadWorkflowRows = ({ reloadConfirmations = false } = {}) => {
      const shipments = DummyTrackingProvider.getAllShipments();
      setLinkedShipments(shipments);
      if (reloadConfirmations) {
        try {
          const stored = localStorage.getItem("crm_delivery_confirmations");
          if (stored) setDeliveryConfirmations(JSON.parse(stored));
        } catch {
          // Retain the current valid in-memory records if legacy JSON is malformed.
        }
      }
    };

    loadWorkflowRows({ reloadConfirmations: true });

    const handleShipmentUpdate = () => {
      loadWorkflowRows({ reloadConfirmations: true });
    };

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'crm_shipments' || e.key === 'crm_delivery_confirmations') {
        loadWorkflowRows({ reloadConfirmations: true });
      }
    };

    window.addEventListener('shipment-created', handleShipmentUpdate);
    window.addEventListener('shipment-updated', handleShipmentUpdate);
    window.addEventListener('shipment-delivered', handleShipmentUpdate);
    window.addEventListener('challan-generated', handleShipmentUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('shipment-created', handleShipmentUpdate);
      window.removeEventListener('shipment-updated', handleShipmentUpdate);
      window.removeEventListener('shipment-delivered', handleShipmentUpdate);
      window.removeEventListener('challan-generated', handleShipmentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const formalConfirmationsByDispatch = new Map(
    deliveryConfirmations.map((record) => [normalizeId(record.dispatchOrderNumber), record])
  );
  const confirmationShipmentDispatches = new Set();
  const confirmationRows = linkedShipments.map((shipment) => {
    const key = normalizeId(shipment.dispatchOrderNumber);
    confirmationShipmentDispatches.add(key);
    const formal = formalConfirmationsByDispatch.get(key);
    const liveFields = {
      trackingNumber: shipment.trackingNumber || "",
      shipmentStatus: shipment.status || "Not Created",
      currentLocation: shipment.currentLocation || "",
      customerName: shipment.customerName || "Unknown Customer",
      deliveryAddress: shipment.deliveryAddress || "",
      vehicleNumber: shipment.vehicleNumber || "",
      driverName: shipment.driverName || "",
      driverNumber: shipment.driverNumber || "",
      deliveredAt: shipment.deliveredAt || null,
      confirmationStatus: getDeliveryConfirmationStatus(shipment.status || "Not Created"),
    };
    return formal
      ? { ...liveFields, ...formal, shipmentStatus: liveFields.shipmentStatus, currentLocation: liveFields.currentLocation }
      : {
          ...liveFields,
          id: `candidate-${key}`,
          isCandidate: true,
          confirmationNumber: "Not Confirmed",
          dispatchOrderNumber: shipment.dispatchOrderNumber || "",
          deliveryChallanNumber: "",
          deliveryDate: "",
          deliveryTime: "",
          receivedBy: "",
          totalQuantity: 0,
          items: [],
          status: "Pending",
        };
  });
  deliveryConfirmations.forEach((record) => {
    if (!confirmationShipmentDispatches.has(normalizeId(record.dispatchOrderNumber))) {
      confirmationRows.push({ ...record, shipmentStatus: "Not Created" });
    }
  });

  const [formData, setFormData] = useState({
    confirmationNumber: "",
    dispatchOrderNumber: "",
    deliveryChallanNumber: "",
    confirmationDate: "",
    customerName: "",
    customerCode: "",
    deliveryAddress: "",
    contactPerson: "",
    contactNumber: "",
    vehicleNumber: "",
    driverName: "",
    driverNumber: "",
    deliveryDate: "",
    deliveryTime: "",
    receivedBy: "",
    condition: "Good",
    remarks: "",
    items: [
      {
        productCode: "",
        productName: "",
        description: "",
        quantity: 0,
        unit: "Nos",
        receivedQuantity: 0,
        condition: "Good",
        remarks: ""
      }
    ]
  });

  const filteredConfirmations = confirmationRows.filter((confirmation) => {
    const matchesSearch =
      String(confirmation.confirmationNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(confirmation.dispatchOrderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(confirmation.deliveryChallanNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(confirmation.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(confirmation.vehicleNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by derived shipment status
    const shipmentStatus = confirmation.shipmentStatus;
    const derivedStatus = getDeliveryConfirmationStatus(shipmentStatus);
    const matchesStatus = statusFilter ? derivedStatus === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const totalConfirmations = confirmationRows.length;
  const confirmedDeliveries = confirmationRows.filter((c) => {
    const shipmentStatus = c.shipmentStatus;
    return isShipmentComplete(shipmentStatus);
  }).length;
  const pendingConfirmations = confirmationRows.filter((c) => {
    const shipmentStatus = c.shipmentStatus;
    return isDeliveryConfirmationAllowed(shipmentStatus);
  }).length;
  const rejectedConfirmations = deliveryConfirmations.filter((c) => c.status === "Rejected").length;
  const totalQuantity = deliveryConfirmations.reduce((sum, c) => sum + c.totalQuantity, 0);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productCode: "",
          productName: "",
          description: "",
          quantity: 0,
          unit: "Nos",
          receivedQuantity: 0,
          condition: "Good",
          remarks: ""
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
    setFormData({ ...formData, items: newItems });
  };

  const handleCreateConfirmation = (e) => {
    e.preventDefault();
    
    // Check if shipment status allows confirmation
    const shipmentStatus = DummyTrackingProvider.getShipmentStatusByDispatchOrder(
      formData.dispatchOrderNumber
    );
    
    if (!isDeliveryConfirmationAllowed(shipmentStatus)) {
      toast.error(`Cannot create confirmation. Shipment status is "${shipmentStatus}". Confirmation is only allowed when shipment is "Out For Delivery".`);
      return;
    }
    
    // Check if shipment is already delivered
    if (isShipmentComplete(shipmentStatus)) {
      toast.error("Shipment is already delivered. Cannot create duplicate confirmation.");
      return;
    }
    
    // Check if confirmation already exists for this dispatch order
    const existingConfirmation = deliveryConfirmations.find(
      c => normalizeId(c.dispatchOrderNumber) === normalizeId(formData.dispatchOrderNumber)
    );
    if (existingConfirmation) {
      toast.error("Delivery confirmation already exists for this dispatch order.");
      return;
    }
    
    // Mark shipment as delivered
    DummyTrackingProvider.markDeliveredByDispatchOrder(formData.dispatchOrderNumber);
    
    const totalQty = formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalWeight = formData.items.reduce((sum, item) => sum + (item.quantity || 0) * 5, 0);

    const newConfirmation = {
      ...formData,
      id: `DCONF-${String(deliveryConfirmations.length + 1).padStart(3, '0')}`,
      totalQuantity: totalQty,
      totalWeight: totalWeight,
      status: "Confirmed",
      receivedSignature: "Signed"
    };
    setDeliveryConfirmations([...deliveryConfirmations, newConfirmation]);
    setShowCreateModal(false);
    setFormData({
      confirmationNumber: "",
      dispatchOrderNumber: "",
      deliveryChallanNumber: "",
      confirmationDate: "",
      customerName: "",
      customerCode: "",
      deliveryAddress: "",
      contactPerson: "",
      contactNumber: "",
      vehicleNumber: "",
      driverName: "",
      driverNumber: "",
      deliveryDate: "",
      deliveryTime: "",
      receivedBy: "",
      condition: "Good",
      remarks: "",
      items: [
        {
          productCode: "",
          productName: "",
          description: "",
          quantity: 0,
          unit: "Nos",
          receivedQuantity: 0,
          condition: "Good",
          remarks: ""
        }
      ]
    });
    toast.success("Delivery confirmed successfully!");
  };

  const handleViewConfirmation = (confirmation) => {
    setSelectedConfirmation(confirmation);
    setShowViewModal(true);
  };

  const handleDeleteConfirmation = (id) => {
    if (window.confirm("Are you sure you want to delete this delivery confirmation?")) {
      setDeliveryConfirmations(deliveryConfirmations.filter((c) => c.id !== id));
      toast.success("Delivery confirmation deleted successfully!");
    }
  };

  const handleConfirmDelivery = (confirmation) => {
    // Check if shipment status allows confirmation
    const shipmentStatus = DummyTrackingProvider.getShipmentStatusByDispatchOrder(
      confirmation.dispatchOrderNumber
    );
    
    if (!isDeliveryConfirmationAllowed(shipmentStatus)) {
      toast.error(`Cannot confirm delivery. Shipment status is "${shipmentStatus}". Confirmation is only allowed when shipment is "Out For Delivery".`);
      return;
    }
    
    // Check if shipment is already delivered
    if (isShipmentComplete(shipmentStatus)) {
      toast.error("Shipment is already delivered.");
      return;
    }
    
    const deliveredShipment = DummyTrackingProvider.markDeliveredByDispatchOrder(
      confirmation.dispatchOrderNumber
    );
    if (!deliveredShipment) {
      toast.error("Linked shipment could not be delivered.");
      return;
    }

    const existing = deliveryConfirmations.find((record) =>
      normalizeId(record.dispatchOrderNumber) === normalizeId(confirmation.dispatchOrderNumber)
    );
    if (existing) {
      setDeliveryConfirmations(deliveryConfirmations.map((record) =>
        record.id === existing.id
          ? {
              ...record,
              trackingNumber: record.trackingNumber || deliveredShipment.trackingNumber,
              status: "Confirmed",
              deliveredAt: deliveredShipment.deliveredAt,
              receivedSignature: "Signed",
            }
          : record
      ));
    } else {
      setDeliveryConfirmations([
        ...deliveryConfirmations,
        {
          ...confirmation,
          id: `DCONF-${Date.now()}`,
          isCandidate: false,
          confirmationNumber: `DCONF-${Date.now()}`,
          confirmationDate: new Date().toISOString().slice(0, 10),
          deliveryDate: new Date().toISOString().slice(0, 10),
          deliveryTime: new Date().toLocaleTimeString(),
          trackingNumber: deliveredShipment.trackingNumber,
          status: "Confirmed",
          deliveredAt: deliveredShipment.deliveredAt,
          receivedSignature: "Signed",
        },
      ]);
    }
    toast.success("Delivery confirmed successfully!");
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
        <span className="text-[#C2410C]"> Delivery Confirmation </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Confirmations"
          count={totalConfirmations}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Confirmed"
          count={confirmedDeliveries}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="Pending"
          count={pendingConfirmations}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Rejected"
          count={rejectedConfirmations}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Quantity"
          count={totalQuantity}
          bg="#ECFDF5"
          color="#059669"
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
            placeholder="Search delivery confirmations..."
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
            <option value="Not Ready">Not Ready</option>
            <option value="Pending Confirmation">Pending Confirmation</option>
            <option value="Confirmed">Confirmed</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Confirmation</button>
          </div>
        </div>
      </div>

      {/* Delivery Confirmations Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Confirmation No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Dispatch Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Customer
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Delivery Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Vehicle No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Received By
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Quantity
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
            {filteredConfirmations.length > 0 ? (
              filteredConfirmations.map((confirmation) => (
                <tr key={confirmation.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {confirmation.confirmationNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {confirmation.dispatchOrderNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{confirmation.customerName}</p>
                      <p className="text-xs text-gray-500">{confirmation.customerCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{confirmation.deliveryDate}</p>
                  <p className="text-xs text-gray-500">{confirmation.deliveryTime}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {confirmation.vehicleNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {confirmation.receivedBy || '-'}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {confirmation.totalQuantity}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {/* Display derived shipment status */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${
                        getDeliveryConfirmationStatusColor(
                          confirmation.shipmentStatus
                        )
                      }`}
                    >
                      {getDeliveryConfirmationStatus(
                        confirmation.shipmentStatus
                      )}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewConfirmation(confirmation)}
                      />
                      {/* Only show confirm button if shipment is Out For Delivery and not yet confirmed */}
                      {isDeliveryConfirmationAllowed(confirmation.shipmentStatus) && confirmation.status !== "Confirmed" && (
                        <FiCheck
                          className="text-green-500 cursor-pointer hover:scale-110 transition"
                          onClick={() => handleConfirmDelivery(confirmation)}
                          title="Confirm Delivery"
                        />
                      )}
                      <FiEdit
                        className="text-purple-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Edit functionality coming soon")}
                      />
                      <FiPrinter
                        className="text-cyan-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast.info("Print functionality coming soon")}
                      />
                      {!confirmation.isCandidate && <FiTrash2
                        className="text-red-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleDeleteConfirmation(confirmation.id)}
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
                  No Delivery Confirmation Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Delivery Confirmation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Delivery Confirmation</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConfirmation}>
              {/* Confirmation Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Confirmation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Confirmation Number</label>
                    <input
                      type="text"
                      name="confirmationNumber"
                      value={formData.confirmationNumber}
                      onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="DCONF-2024-001"
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
                    <label className="block mb-1 font-medium text-sm">Delivery Challan Number</label>
                    <input
                      type="text"
                      name="deliveryChallanNumber"
                      value={formData.deliveryChallanNumber}
                      onChange={(e) => setFormData({ ...formData, deliveryChallanNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="DC-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Confirmation Date</label>
                    <input
                      type="date"
                      name="confirmationDate"
                      value={formData.confirmationDate}
                      onChange={(e) => setFormData({ ...formData, confirmationDate: e.target.value })}
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
                  <div className="md:col-span-3">
                    <label className="block mb-1 font-medium text-sm">Delivery Address</label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter delivery address"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Delivery Details</h3>
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
                    <label className="block mb-1 font-medium text-sm">Driver Name</label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter driver name"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Driver Number</label>
                    <input
                      type="text"
                      name="driverNumber"
                      value={formData.driverNumber}
                      onChange={(e) => setFormData({ ...formData, driverNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter driver number"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Delivery Date</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Delivery Time</label>
                    <input
                      type="time"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Received By</label>
                    <input
                      type="text"
                      name="receivedBy"
                      value={formData.receivedBy}
                      onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter receiver name"
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
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-right">Received Qty</th>
                        <th className="p-2 text-left">Condition</th>
                        <th className="p-2 text-left">Remarks</th>
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
                              value={item.receivedQuantity}
                              onChange={(e) => handleItemChange(index, 'receivedQuantity', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.condition}
                              onChange={(e) => handleItemChange(index, 'condition', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                            >
                              <option value="Good">Good</option>
                              <option value="Damaged">Damaged</option>
                              <option value="Partial">Partial</option>
                              <option value="Missing">Missing</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.remarks}
                              onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="Remarks"
                            />
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

              {/* Overall Condition */}
              <div className="mb-6">
                <label className="block mb-1 font-medium text-sm">Overall Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                  required
                >
                  <option value="Good">Good</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Partial">Partial</option>
                  <option value="Missing">Missing</option>
                </select>
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
                  Create Confirmation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Delivery Confirmation Modal */}
      {showViewModal && selectedConfirmation && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Delivery Confirmation Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Confirmation Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Confirmation Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Confirmation Number</p>
                    <p className="font-medium">{selectedConfirmation.confirmationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dispatch Order No</p>
                    <p className="font-medium">{selectedConfirmation.dispatchOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Challan No</p>
                    <p className="font-medium">{selectedConfirmation.deliveryChallanNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Confirmation Date</p>
                    <p className="font-medium">{selectedConfirmation.confirmationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedConfirmation.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : selectedConfirmation.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {selectedConfirmation.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Signature Status</p>
                    <p className="font-medium">{selectedConfirmation.receivedSignature}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium">{selectedConfirmation.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer Code</p>
                    <p className="font-medium">{selectedConfirmation.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{selectedConfirmation.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{selectedConfirmation.contactNumber}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium">{selectedConfirmation.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Delivery Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Number</p>
                    <p className="font-medium">{selectedConfirmation.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Name</p>
                    <p className="font-medium">{selectedConfirmation.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Number</p>
                    <p className="font-medium">{selectedConfirmation.driverNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Date & Time</p>
                    <p className="font-medium">{selectedConfirmation.deliveryDate} {selectedConfirmation.deliveryTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Received By</p>
                    <p className="font-medium">{selectedConfirmation.receivedBy || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Overall Condition</p>
                    <p className="font-medium">{selectedConfirmation.condition}</p>
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
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-right">Received Qty</th>
                        <th className="p-2 text-left">Condition</th>
                        <th className="p-2 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedConfirmation.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productCode}</td>
                          <td className="p-2 font-medium">{item.productName}</td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2">{item.unit}</td>
                          <td className="p-2 text-right">{item.receivedQuantity}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.condition === "Good" ? "bg-green-100 text-green-700" :
                              item.condition === "Damaged" ? "bg-red-100 text-red-700" :
                              item.condition === "Partial" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {item.condition}
                            </span>
                          </td>
                          <td className="p-2">{item.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-green-50 p-4 rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Quantity</p>
                    <p className="font-bold text-lg">{selectedConfirmation.totalQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Weight</p>
                    <p className="font-bold text-lg">{selectedConfirmation.totalWeight}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="font-medium">{selectedConfirmation.remarks || '-'}</p>
                  </div>
                </div>
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
                  Print Confirmation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryConfirmation;
