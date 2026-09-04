import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";
import DummyTrackingProvider from "../../services/DummyTrackingProvider.js";
import { normalizeId } from "../../utils/deliveryWorkflowStatus.js";

const PACKING_LISTS_KEY = "crm_packing_lists";
const DISPATCH_ORDERS_KEY = "crm_dispatch_orders";

const PackingList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPacking, setSelectedPacking] = useState(null);

  // Sample packing list data
  const [packingLists, setPackingLists] = useState(() => {
    try {
      const stored = localStorage.getItem(PACKING_LISTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fall through to backward-compatible sample data.
    }
    return [
    {
      id: "PACK-001",
      packingListNumber: "PACK-2024-001",
      dispatchOrderNumber: "DISP-2024-001",
      salesOrderNumber: "SO-2024-001",
      packingDate: "2024-01-15",
      customerName: "ABC Corporation",
      customerCode: "CUST-001",
      deliveryAddress: "123 Business Street, Chennai - 600001",
      totalPackages: 5,
      totalQuantity: 100,
      totalWeight: 500,
      status: "Completed",
      remarks: "Standard packaging",
      items: [
        {
          id: "ITEM-001",
          productCode: "PROD-001",
          productName: "Industrial Pump",
          description: "High capacity industrial pump",
          quantity: 50,
          unit: "Nos",
          weight: 250,
          packageNumber: "PKG-001",
          packageType: "Box",
          dimensions: "50x40x30",
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
          packageNumber: "PKG-002",
          packageType: "Box",
          dimensions: "45x35x25",
          remarks: "Fragile - handle with care"
        }
      ]
    },
    {
      id: "PACK-002",
      packingListNumber: "PACK-2024-002",
      dispatchOrderNumber: "DISP-2024-002",
      salesOrderNumber: "SO-2024-002",
      packingDate: "2024-01-20",
      customerName: "XYZ Industries",
      customerCode: "CUST-002",
      deliveryAddress: "456 Industrial Area, Coimbatore - 641001",
      totalPackages: 3,
      totalQuantity: 75,
      totalWeight: 375,
      status: "In Progress",
      remarks: "Custom packaging required",
      items: [
        {
          id: "ITEM-003",
          productCode: "PROD-003",
          productName: "Control Panel",
          description: "Automated control panel system",
          quantity: 75,
          unit: "Nos",
          weight: 375,
          packageNumber: "PKG-003",
          packageType: "Crate",
          dimensions: "60x50x40",
          remarks: "Custom configuration"
        }
      ]
    },
    {
      id: "PACK-003",
      packingListNumber: "PACK-2024-003",
      dispatchOrderNumber: "DISP-2024-003",
      salesOrderNumber: "SO-2024-003",
      packingDate: "2024-01-25",
      customerName: "Global Tech Solutions",
      customerCode: "CUST-003",
      deliveryAddress: "789 Tech Park, Bangalore - 560001",
      totalPackages: 10,
      totalQuantity: 200,
      totalWeight: 1000,
      status: "Pending",
      remarks: "Bulk packaging",
      items: [
        {
          id: "ITEM-004",
          productCode: "PROD-004",
          productName: "Sensors Kit",
          description: "Industrial sensor kit",
          quantity: 200,
          unit: "Nos",
          weight: 1000,
          packageNumber: "PKG-004",
          packageType: "Box",
          dimensions: "40x30x20",
          remarks: "Bulk packaging"
        }
      ]
    }
    ];
  });

  useEffect(() => {
    localStorage.setItem(PACKING_LISTS_KEY, JSON.stringify(packingLists));
  }, [packingLists]);

  // State to hold derived shipment statuses
  const [shipmentStatuses, setShipmentStatuses] = useState({});

  // Load shipment statuses on mount and when shipments change
  useEffect(() => {
    const loadShipmentStatuses = () => {
      const statuses = {};
      packingLists.forEach(list => {
        const shipmentStatus = DummyTrackingProvider.getShipmentStatusByDispatchOrder(
          list.dispatchOrderNumber
        );
        statuses[list.dispatchOrderNumber] = shipmentStatus;
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
      } else if (e.key === PACKING_LISTS_KEY) {
        try {
          const stored = localStorage.getItem(PACKING_LISTS_KEY);
          const parsed = stored ? JSON.parse(stored) : null;
          if (Array.isArray(parsed)) setPackingLists(parsed);
        } catch {
          // Retain the current valid state.
        }
      }
    };

    window.addEventListener('shipment-updated', handleShipmentUpdate);
    window.addEventListener('shipment-created', handleShipmentUpdate);
    window.addEventListener('shipment-delivered', handleShipmentUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('shipment-updated', handleShipmentUpdate);
      window.removeEventListener('shipment-created', handleShipmentUpdate);
      window.removeEventListener('shipment-delivered', handleShipmentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [packingLists]);

  const [formData, setFormData] = useState({
    packingListNumber: "",
    dispatchOrderNumber: "",
    salesOrderNumber: "",
    packingDate: "",
    customerName: "",
    customerCode: "",
    deliveryAddress: "",
    remarks: "",
    items: [
      {
        productCode: "",
        productName: "",
        description: "",
        quantity: 0,
        unit: "Nos",
        weight: 0,
        packageNumber: "",
        packageType: "Box",
        dimensions: "",
        remarks: ""
      }
    ]
  });

  const filteredLists = packingLists.filter((list) => {
    const matchesSearch =
      list.packingListNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.dispatchOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.salesOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? list.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalLists = packingLists.length;
  const completedLists = packingLists.filter((l) => l.status === "Completed").length;
  const inProgressLists = packingLists.filter((l) => l.status === "In Progress").length;
  const pendingLists = packingLists.filter((l) => l.status === "Pending").length;
  const totalPackages = packingLists.reduce((sum, l) => sum + l.totalPackages, 0);

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
          packageNumber: "",
          packageType: "Box",
          dimensions: "",
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

  const handleCreatePackingList = (e) => {
    e.preventDefault();
    if (packingLists.some((list) =>
      normalizeId(list.dispatchOrderNumber) === normalizeId(formData.dispatchOrderNumber)
    )) {
      toast.error("A packing list already exists for this dispatch order.");
      return;
    }
    const totalQty = formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalWeight = formData.items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalPkgs = formData.items.length;

    const newList = {
      ...formData,
      id: `PACK-${String(packingLists.length + 1).padStart(3, '0')}`,
      totalQuantity: totalQty,
      totalWeight: totalWeight,
      totalPackages: totalPkgs,
      status: "Pending"
    };
    setPackingLists([...packingLists, newList]);

    // Enrich the parent record; never consume or remove it.
    try {
      const storedOrders = localStorage.getItem(DISPATCH_ORDERS_KEY);
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      if (Array.isArray(orders)) {
        const nextOrders = orders.map((order) =>
          normalizeId(order.dispatchOrderNumber) === normalizeId(newList.dispatchOrderNumber)
            ? { ...order, packingStatus: "Packed", status: "Packing Completed" }
            : order
        );
        localStorage.setItem(DISPATCH_ORDERS_KEY, JSON.stringify(nextOrders));
        window.dispatchEvent(new CustomEvent("dispatch-order-updated", {
          detail: { dispatchOrderNumber: newList.dispatchOrderNumber }
        }));
      }
    } catch {
      console.warn("Packing list created, but the linked dispatch order could not be updated.");
    }
    setShowCreateModal(false);
    setFormData({
      packingListNumber: "",
      dispatchOrderNumber: "",
      salesOrderNumber: "",
      packingDate: "",
      customerName: "",
      customerCode: "",
      deliveryAddress: "",
      remarks: "",
      items: [
        {
          productCode: "",
          productName: "",
          description: "",
          quantity: 0,
          unit: "Nos",
          weight: 0,
          packageNumber: "",
          packageType: "Box",
          dimensions: "",
          remarks: ""
        }
      ]
    });
    toast.success("Packing list created successfully!");
  };

  const handleViewPacking = (packing) => {
    setSelectedPacking(packing);
    setShowViewModal(true);
  };

  const handleDeletePacking = (id) => {
    if (window.confirm("Are you sure you want to delete this packing list?")) {
      setPackingLists(packingLists.filter((l) => l.id !== id));
      toast.success("Packing list deleted successfully!");
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
        <span className="text-[#C2410C]"> Packing List </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Lists"
          count={totalLists}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Completed"
          count={completedLists}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="In Progress"
          count={inProgressLists}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Pending"
          count={pendingLists}
          bg="#FAF0F0"
          color="#BA1D1D"
        />
        <Card
          title="Total Packages"
          count={totalPackages}
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
            placeholder="Search packing lists..."
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
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Create Packing List</button>
          </div>
        </div>
      </div>

      {/* Packing Lists Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Packing List No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Dispatch Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Customer
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Packing Date
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Packages
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
            {filteredLists.length > 0 ? (
              filteredLists.map((list) => (
                <tr key={list.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {list.packingListNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {list.dispatchOrderNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{list.customerName}</p>
                      <p className="text-xs text-gray-500">{list.customerCode}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {list.packingDate}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {list.totalPackages}
                  </td>
                  <td className="p-3 border-b border-gray-300 font-medium">
                    {list.totalQuantity}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {(() => {
                      const shipment = DummyTrackingProvider.getShipmentByDispatchOrder(list.dispatchOrderNumber);
                      return shipment ? (
                        <span className="text-xs text-blue-600 font-mono">{shipment.trackingNumber}</span>
                      ) : (
                        <span className="text-xs text-gray-400">Not Allocated</span>
                      );
                    })()}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <span className="text-xs text-gray-600">
                      {shipmentStatuses[list.dispatchOrderNumber] || "Not Created"}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewPacking(list)}
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
                      <FiTrash2
                        className="text-red-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleDeletePacking(list.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-4 bg-white border-gray-300 text-gray-700 text-center"
                  colSpan={8}
                >
                  No Packing List Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Packing List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create Packing List</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePackingList}>
              {/* Packing Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Packing Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Packing List Number</label>
                    <input
                      type="text"
                      name="packingListNumber"
                      value={formData.packingListNumber}
                      onChange={(e) => setFormData({ ...formData, packingListNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="PACK-2024-001"
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
                    <label className="block mb-1 font-medium text-sm">Sales Order Number</label>
                    <input
                      type="text"
                      name="salesOrderNumber"
                      value={formData.salesOrderNumber}
                      onChange={(e) => setFormData({ ...formData, salesOrderNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="SO-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Packing Date</label>
                    <input
                      type="date"
                      name="packingDate"
                      value={formData.packingDate}
                      onChange={(e) => setFormData({ ...formData, packingDate: e.target.value })}
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
                        <th className="p-2 text-left">Package No</th>
                        <th className="p-2 text-left">Package Type</th>
                        <th className="p-2 text-left">Dimensions</th>
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
                              value={item.packageNumber}
                              onChange={(e) => handleItemChange(index, 'packageNumber', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="PKG-001"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.packageType}
                              onChange={(e) => handleItemChange(index, 'packageType', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                            >
                              <option value="Box">Box</option>
                              <option value="Crate">Crate</option>
                              <option value="Pallet">Pallet</option>
                              <option value="Bundle">Bundle</option>
                              <option value="Bag">Bag</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.dimensions}
                              onChange={(e) => handleItemChange(index, 'dimensions', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="50x40x30"
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
                  Create Packing List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Packing List Modal */}
      {showViewModal && selectedPacking && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Packing List Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Packing Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Packing Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Packing List No</p>
                    <p className="font-medium">{selectedPacking.packingListNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dispatch Order No</p>
                    <p className="font-medium">{selectedPacking.dispatchOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sales Order No</p>
                    <p className="font-medium">{selectedPacking.salesOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Packing Date</p>
                    <p className="font-medium">{selectedPacking.packingDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPacking.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : selectedPacking.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {selectedPacking.status}
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
                    <p className="font-medium">{selectedPacking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer Code</p>
                    <p className="font-medium">{selectedPacking.customerCode}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium">{selectedPacking.deliveryAddress}</p>
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
                        <th className="p-2 text-left">Package No</th>
                        <th className="p-2 text-left">Package Type</th>
                        <th className="p-2 text-left">Dimensions</th>
                        <th className="p-2 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPacking.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.productCode}</td>
                          <td className="p-2 font-medium">{item.productName}</td>
                          <td className="p-2">{item.description}</td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2">{item.unit}</td>
                          <td className="p-2 text-right">{item.weight}</td>
                          <td className="p-2">{item.packageNumber}</td>
                          <td className="p-2">{item.packageType}</td>
                          <td className="p-2">{item.dimensions}</td>
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
                    <p className="text-sm text-gray-500">Total Packages</p>
                    <p className="font-bold text-lg">{selectedPacking.totalPackages}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Quantity</p>
                    <p className="font-bold text-lg">{selectedPacking.totalQuantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Weight</p>
                    <p className="font-bold text-lg">{selectedPacking.totalWeight}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="font-medium">{selectedPacking.remarks || '-'}</p>
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
                  Print Packing List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackingList;
