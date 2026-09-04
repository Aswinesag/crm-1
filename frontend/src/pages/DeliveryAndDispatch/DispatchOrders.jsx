import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";
import DummyTrackingProvider from "../../services/DummyTrackingProvider.js";
import {
  getDispatchOrderDeliveryStatus,
  getStatusColor,
  normalizeId
} from "../../utils/deliveryWorkflowStatus.js";

const DISPATCH_ORDERS_KEY = "crm_dispatch_orders";

const DispatchOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sample dispatch order data
  const [dispatchOrders, setDispatchOrders] = useState(() => {
    try {
      const stored = localStorage.getItem(DISPATCH_ORDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fall through to backward-compatible sample data.
    }
    return [
    {
      id: "DISP-001",
      dispatchOrderNumber: "DISP-2024-001",
      salesOrderNumber: "SO-2024-001",
      dispatchDate: "2024-01-15",
      customerName: "ABC Corporation",
      customerCode: "CUST-001",
      deliveryAddress: "123 Business Street, Chennai - 600001",
      contactPerson: "John Doe",
      contactNumber: "9876543210",
      vehicleNumber: "TN-01-AB-1234",
      driverName: "Raj Kumar",
      driverNumber: "8765432109",
      transporterName: "Fast Logistics",
      lrNumber: "LR-2024-001",
      lrDate: "2024-01-15",
      totalQuantity: 100,
      totalWeight: 500,
      status: "Dispatched",
      remarks: "Urgent delivery",
      items: [
        {
          id: "ITEM-001",
          productCode: "PROD-001",
          productName: "Industrial Pump",
          description: "High capacity industrial pump",
          quantity: 50,
          unit: "Nos",
          weight: 250,
          remarks: "Standard packaging"
        },
        {
          id: "ITEM-002",
          productCode: "PROD-002",
          productName: "Motor Assembly",
          description: "Electric motor assembly unit",
          quantity: 50,
          unit: "Nos",
          weight: 250,
          remarks: "Fragile - handle with care"
        }
      ]
    },
    {
      id: "DISP-002",
      dispatchOrderNumber: "DISP-2024-002",
      salesOrderNumber: "SO-2024-002",
      dispatchDate: "2024-01-20",
      customerName: "XYZ Industries",
      customerCode: "CUST-002",
      deliveryAddress: "456 Industrial Area, Coimbatore - 641001",
      contactPerson: "Jane Smith",
      contactNumber: "8765432109",
      vehicleNumber: "TN-02-CD-5678",
      driverName: "Suresh Kumar",
      driverNumber: "7654321098",
      transporterName: "Safe Transport",
      lrNumber: "LR-2024-002",
      lrDate: "2024-01-20",
      totalQuantity: 75,
      totalWeight: 375,
      status: "In Transit",
      remarks: "Partial delivery",
      items: [
        {
          id: "ITEM-003",
          productCode: "PROD-003",
          productName: "Control Panel",
          description: "Automated control panel system",
          quantity: 75,
          unit: "Nos",
          weight: 375,
          remarks: "Custom configuration"
        }
      ]
    },
    {
      id: "DISP-003",
      dispatchOrderNumber: "DISP-2024-003",
      salesOrderNumber: "SO-2024-003",
      dispatchDate: "2024-01-25",
      customerName: "Global Tech Solutions",
      customerCode: "CUST-003",
      deliveryAddress: "789 Tech Park, Bangalore - 560001",
      contactPerson: "Mike Johnson",
      contactNumber: "7654321098",
      vehicleNumber: "KA-01-EF-9012",
      driverName: "Venkat",
      driverNumber: "6543210987",
      transporterName: "Express Delivery",
      lrNumber: "LR-2024-003",
      lrDate: "2024-01-25",
      totalQuantity: 200,
      totalWeight: 1000,
      status: "Delivered",
      remarks: "Complete order",
      items: [
        {
          id: "ITEM-004",
          productCode: "PROD-004",
          productName: "Sensors Kit",
          description: "Industrial sensor kit",
          quantity: 200,
          unit: "Nos",
          weight: 1000,
          remarks: "Bulk packaging"
        }
      ]
    }
    ];
  });

  useEffect(() => {
    localStorage.setItem(DISPATCH_ORDERS_KEY, JSON.stringify(dispatchOrders));
  }, [dispatchOrders]);

  // State to hold derived shipment statuses
  const [shipmentStatuses, setShipmentStatuses] = useState({});

  // Load shipment statuses on mount and when shipments change
  useEffect(() => {
    const loadShipmentStatuses = () => {
      const statuses = {};
      dispatchOrders.forEach(order => {
        const shipmentStatus = DummyTrackingProvider.getShipmentStatusByDispatchOrder(
          order.dispatchOrderNumber
        );
        statuses[order.dispatchOrderNumber] = shipmentStatus;
      });
      setShipmentStatuses(statuses);
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
      } else if (e.key === DISPATCH_ORDERS_KEY) {
        handleDispatchOrderUpdate();
      }
    };
    const handleDispatchOrderUpdate = () => {
      try {
        const stored = localStorage.getItem(DISPATCH_ORDERS_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        if (Array.isArray(parsed)) setDispatchOrders(parsed);
      } catch {
        // Retain the current valid state.
      }
    };

    window.addEventListener('shipment-updated', handleShipmentUpdate);
    window.addEventListener('shipment-created', handleShipmentUpdate);
    window.addEventListener('shipment-delivered', handleShipmentUpdate);
    window.addEventListener('dispatch-order-updated', handleDispatchOrderUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('shipment-updated', handleShipmentUpdate);
      window.removeEventListener('shipment-created', handleShipmentUpdate);
      window.removeEventListener('shipment-delivered', handleShipmentUpdate);
      window.removeEventListener('dispatch-order-updated', handleDispatchOrderUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatchOrders]);

  const [formData, setFormData] = useState({
    dispatchOrderNumber: "",
    salesOrderNumber: "",
    dispatchDate: "",
    customerName: "",
    customerCode: "",
    deliveryAddress: "",
    contactPerson: "",
    contactNumber: "",
    vehicleNumber: "",
    driverName: "",
    driverNumber: "",
    transporterName: "",
    lrNumber: "",
    lrDate: "",
    remarks: "",
    items: [
      {
        productCode: "",
        productName: "",
        description: "",
        quantity: 0,
        unit: "Nos",
        weight: 0,
        remarks: ""
      }
    ]
  });

  const filteredOrders = dispatchOrders.filter((order) => {
    const matchesSearch =
      order.dispatchOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.salesOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.lrNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = dispatchOrders.length;
  const dispatchedOrders = dispatchOrders.filter((o) => o.status === "Dispatched").length;
  const inTransitOrders = dispatchOrders.filter((o) => o.status === "In Transit").length;
  const deliveredOrders = dispatchOrders.filter((o) => o.status === "Delivered").length;
  const totalQuantity = dispatchOrders.reduce((sum, o) => sum + o.totalQuantity, 0);

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
          weight: 0,
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

  const handleCreateDispatchOrder = (e) => {
    e.preventDefault();
    if (dispatchOrders.some((order) =>
      normalizeId(order.dispatchOrderNumber) === normalizeId(formData.dispatchOrderNumber)
    )) {
      toast.error("A dispatch order with this number already exists.");
      return;
    }
    const totalQty = formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalWeight = formData.items.reduce((sum, item) => sum + (item.weight || 0), 0);

    const newOrder = {
      ...formData,
      id: `DISP-${String(dispatchOrders.length + 1).padStart(3, '0')}`,
      totalQuantity: totalQty,
      totalWeight: totalWeight,
      status: "Dispatched"
    };
    setDispatchOrders([...dispatchOrders, newOrder]);
    setShowCreateModal(false);
    setFormData({
      dispatchOrderNumber: "",
      salesOrderNumber: "",
      dispatchDate: "",
      customerName: "",
      customerCode: "",
      deliveryAddress: "",
      contactPerson: "",
      contactNumber: "",
      vehicleNumber: "",
      driverName: "",
      driverNumber: "",
      transporterName: "",
      lrNumber: "",
      lrDate: "",
      remarks: "",
      items: [
        {
          productCode: "",
          productName: "",
          description: "",
          quantity: 0,
          unit: "Nos",
          weight: 0,
          remarks: ""
        }
      ]
    });
    toast.success("Dispatch order created successfully!");
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleDeleteOrder = (id) => {
    if (window.confirm("Are you sure you want to delete this dispatch order?")) {
      setDispatchOrders(dispatchOrders.filter((o) => o.id !== id));
      toast.success("Dispatch order deleted successfully!");
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
        <span className="text-[#C2410C]"> Dispatch Orders </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Orders"
          count={totalOrders}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Dispatched"
          count={dispatchedOrders}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="In Transit"
          count={inTransitOrders}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Delivered"
          count={deliveredOrders}
          bg="#ECFDF5"
          color="#059669"
        />
        <Card
          title="Total Quantity"
          count={totalQuantity}
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
            placeholder="Search dispatch orders..."
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
            <option value="Dispatched">Dispatched</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Dispatch Order</button>
          </div>
        </div>
      </div>

      {/* Dispatch Orders Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Dispatch No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Sales Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Customer
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Dispatch Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Vehicle No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                LR Number
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Quantity
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Tracking No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Shipment Status
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tr-md">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {order.dispatchOrderNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {order.salesOrderNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.contactPerson}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {order.dispatchDate}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {order.vehicleNumber}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {order.lrNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {order.totalQuantity}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {(() => {
                      const shipment = DummyTrackingProvider.getShipmentByDispatchOrder(order.dispatchOrderNumber);
                      return shipment ? (
                        <span className="text-xs text-blue-600 font-mono">{shipment.trackingNumber}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Not Allocated</span>
                      );
                    })()}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${
                        getStatusColor(
                          getDispatchOrderDeliveryStatus(shipmentStatuses[order.dispatchOrderNumber])
                        )
                      }`}
                    >
                      {getDispatchOrderDeliveryStatus(shipmentStatuses[order.dispatchOrderNumber])}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewOrder(order)}
                      />
                      <FiEdit
                        className="text-green-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast("Edit functionality coming soon")}
                      />
                      <FiPrinter
                        className="text-purple-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast("Print functionality coming soon")}
                      />
                      <FiDownload
                        className="text-cyan-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast("Download functionality coming soon")}
                      />
                      <FiTrash2
                        className="text-red-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleDeleteOrder(order.id)}
                      />
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
                  No Dispatch Order Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dispatch Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Dispatch Order</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispatchOrder}>
              {/* Order Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block mb-1 font-medium text-sm">Sales Order Number</label>
                    <input
                      type="text"
                      name="salesOrderNumber"
                      value={formData.salesOrderNumber}
                      onChange={(e) => setFormData({ ...formData, salesOrderNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="SO-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Dispatch Date</label>
                    <input
                      type="date"
                      name="dispatchDate"
                      value={formData.dispatchDate}
                      onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })}
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
                  <div className="md:col-span-2">
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
                    <label className="block mb-1 font-medium text-sm">Transporter Name</label>
                    <input
                      type="text"
                      name="transporterName"
                      value={formData.transporterName}
                      onChange={(e) => setFormData({ ...formData, transporterName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter transporter name"
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
                  <div>
                    <label className="block mb-1 font-medium text-sm">LR Date</label>
                    <input
                      type="date"
                      name="lrDate"
                      value={formData.lrDate}
                      onChange={(e) => setFormData({ ...formData, lrDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
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
                        <th className="p-2 text-left">Quantity</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-left">Weight</th>
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
                              <option value="Box">Box</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.weight}
                              onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="0"
                              min="0"
                            />
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
                  Create Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Dispatch Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Dispatch Order Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Order Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Dispatch Order No</p>
                    <p className="font-medium">{selectedOrder.dispatchOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sales Order No</p>
                    <p className="font-medium">{selectedOrder.salesOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dispatch Date</p>
                    <p className="font-medium">{selectedOrder.dispatchDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === "Dispatched"
                        ? "bg-blue-100 text-blue-700"
                        : selectedOrder.status === "In Transit"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {selectedOrder.status}
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
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer Code</p>
                    <p className="font-medium">{selectedOrder.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{selectedOrder.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{selectedOrder.contactNumber}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Transport Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Transport Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Number</p>
                    <p className="font-medium">{selectedOrder.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Name</p>
                    <p className="font-medium">{selectedOrder.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Number</p>
                    <p className="font-medium">{selectedOrder.driverNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transporter Name</p>
                    <p className="font-medium">{selectedOrder.transporterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">LR Number</p>
                    <p className="font-medium">{selectedOrder.lrNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">LR Date</p>
                    <p className="font-medium">{selectedOrder.lrDate}</p>
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
                        <th className="p-2 text-right">Weight</th>
                        <th className="p-2 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productCode}</td>
                          <td className="p-2 font-medium">{item.productName}</td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2">{item.unit}</td>
                          <td className="p-2 text-right">{item.weight}</td>
                          <td className="p-2">{item.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-green-50 p-4 rounded-md">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Quantity</p>
                    <p className="font-bold text-lg">{selectedOrder.totalQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Weight</p>
                    <p className="font-bold text-lg">{selectedOrder.totalWeight}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="font-medium">{selectedOrder.remarks || '-'}</p>
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
                  Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchOrders;
