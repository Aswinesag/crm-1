import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiEye, FiTrash2, FiDownload, FiPrinter } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";
import DummyTrackingProvider from "../../services/DummyTrackingProvider.js";
import { normalizeId } from "../../utils/deliveryWorkflowStatus.js";
import {
    getVehicleAllocationStatus,
    getVehicleAllocationStatusColor
} from "../../utils/shipmentStatusMapper.js";

const VehicleAllocation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  // Sample vehicle allocation data
  const sampleAllocations = [
    {
      id: "VALLOC-001",
      allocationNumber: "VALLOC-2024-001",
      dispatchOrderNumber: "DISP-2024-001",
      allocationDate: "2024-01-15",
      vehicleNumber: "TN-01-AB-1234",
      vehicleType: "Truck",
      vehicleCapacity: "10 Tons",
      driverName: "Raj Kumar",
      driverNumber: "8765432109",
      driverLicense: "DL-2024-001",
      transporterName: "Fast Logistics",
      route: "Chennai to Coimbatore",
      estimatedDistance: "500 km",
      estimatedTime: "8 hours",
      fuelConsumption: "25 Liters",
      status: "Allocated",
      remarks: "Priority delivery",
      items: [
        {
          dispatchOrderNumber: "DISP-2024-001",
          customerName: "ABC Corporation",
          deliveryAddress: "123 Business Street, Chennai - 600001",
          quantity: 100,
          weight: 500,
          priority: "High"
        }
      ]
    },
    {
      id: "VALLOC-002",
      allocationNumber: "VALLOC-2024-002",
      dispatchOrderNumber: "DISP-2024-002",
      allocationDate: "2024-01-20",
      vehicleNumber: "TN-02-CD-5678",
      vehicleType: "Truck",
      vehicleCapacity: "8 Tons",
      driverName: "Suresh Kumar",
      driverNumber: "7654321098",
      driverLicense: "DL-2024-002",
      transporterName: "Safe Transport",
      route: "Chennai to Bangalore",
      estimatedDistance: "350 km",
      estimatedTime: "6 hours",
      fuelConsumption: "20 Liters",
      status: "In Transit",
      remarks: "Standard delivery",
      items: [
        {
          dispatchOrderNumber: "DISP-2024-002",
          customerName: "XYZ Industries",
          deliveryAddress: "456 Industrial Area, Coimbatore - 641001",
          quantity: 75,
          weight: 375,
          priority: "Medium"
        }
      ]
    },
    {
      id: "VALLOC-003",
      allocationNumber: "VALLOC-2024-003",
      dispatchOrderNumber: "DISP-2024-003",
      allocationDate: "2024-01-25",
      vehicleNumber: "KA-01-EF-9012",
      vehicleType: "Van",
      vehicleCapacity: "2 Tons",
      driverName: "Venkat",
      driverNumber: "6543210987",
      driverLicense: "DL-2024-003",
      transporterName: "Express Delivery",
      route: "Chennai to Hyderabad",
      estimatedDistance: "600 km",
      estimatedTime: "10 hours",
      fuelConsumption: "30 Liters",
      status: "Completed",
      remarks: "Express delivery",
      items: [
        {
          dispatchOrderNumber: "DISP-2024-003",
          customerName: "Global Tech Solutions",
          deliveryAddress: "789 Tech Park, Bangalore - 560001",
          quantity: 200,
          weight: 1000,
          priority: "Low"
        }
      ]
    }
  ];

  const [vehicleAllocations, setVehicleAllocations] = useState(() => {
    const stored = localStorage.getItem('crm_vehicle_allocations');
    return stored ? JSON.parse(stored) : sampleAllocations;
  });

  // Save vehicle allocations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('crm_vehicle_allocations', JSON.stringify(vehicleAllocations));
  }, [vehicleAllocations]);

  // State to hold derived shipment statuses
  const [shipmentStatuses, setShipmentStatuses] = useState({});

  // Load shipment statuses on mount and when shipments change
  useEffect(() => {
    const loadShipmentStatuses = () => {
      const statuses = {};
      vehicleAllocations.forEach(allocation => {
        const shipmentStatus = DummyTrackingProvider.getShipmentStatusByDispatchOrder(
          allocation.dispatchOrderNumber
        );
        statuses[allocation.dispatchOrderNumber] = shipmentStatus;
      });
      console.log('VehicleAllocation - Loaded shipment statuses:', statuses);
      setShipmentStatuses(statuses);
    };

    loadShipmentStatuses();

    // Listen for shipment update events (same-tab)
    const handleShipmentUpdate = (e) => {
      console.log('VehicleAllocation - Received shipment-updated event:', e.detail);
      loadShipmentStatuses();
    };

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e) => {
      console.log('VehicleAllocation - Storage event:', e.key);
      if (e.key === 'crm_shipments') {
        loadShipmentStatuses();
      }
    };

    window.addEventListener('shipment-updated', handleShipmentUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('shipment-updated', handleShipmentUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [vehicleAllocations]);

  const [formData, setFormData] = useState({
    allocationNumber: "",
    dispatchOrderNumber: "",
    allocationDate: "",
    vehicleNumber: "",
    vehicleType: "Truck",
    vehicleCapacity: "",
    driverName: "",
    driverNumber: "",
    driverLicense: "",
    transporterName: "",
    route: "",
    estimatedDistance: "",
    estimatedTime: "",
    fuelConsumption: "",
    remarks: "",
    items: [
      {
        dispatchOrderNumber: "",
        customerName: "",
        deliveryAddress: "",
        quantity: 0,
        weight: 0,
        priority: "Medium"
      }
    ]
  });

  const filteredAllocations = vehicleAllocations.filter((allocation) => {
    const matchesSearch =
      allocation.allocationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.dispatchOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.transporterName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by derived shipment status
    const shipmentStatus = shipmentStatuses[allocation.dispatchOrderNumber];
    const derivedStatus = getVehicleAllocationStatus(shipmentStatus);
    const matchesStatus = statusFilter ? derivedStatus === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const totalAllocations = vehicleAllocations.length;
  const allocatedVehicles = vehicleAllocations.filter((v) => {
    const shipmentStatus = shipmentStatuses[v.dispatchOrderNumber];
    return getVehicleAllocationStatus(shipmentStatus) === "Allocated";
  }).length;
  const inTransitVehicles = vehicleAllocations.filter((v) => {
    const shipmentStatus = shipmentStatuses[v.dispatchOrderNumber];
    const status = getVehicleAllocationStatus(shipmentStatus);
    return status === "In Transit" || status === "Picked Up" || status === "Out For Delivery";
  }).length;
  const completedVehicles = vehicleAllocations.filter((v) => {
    const shipmentStatus = shipmentStatuses[v.dispatchOrderNumber];
    return getVehicleAllocationStatus(shipmentStatus) === "Completed";
  }).length;
  const totalCapacity = vehicleAllocations.length;

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          dispatchOrderNumber: "",
          customerName: "",
          deliveryAddress: "",
          quantity: 0,
          weight: 0,
          priority: "Medium"
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

  const handleCreateAllocation = (e) => {
    e.preventDefault();
    const dispatchOrderNumber = String(formData.dispatchOrderNumber || "").trim();
    if (!dispatchOrderNumber) {
      toast.error("Dispatch order number is required");
      return;
    }
    const duplicateAllocation = vehicleAllocations.some((allocation) =>
      normalizeId(allocation.dispatchOrderNumber) === normalizeId(dispatchOrderNumber) &&
      getVehicleAllocationStatus(
        DummyTrackingProvider.getShipmentStatusByDispatchOrder(allocation.dispatchOrderNumber)
      ) !== "Completed"
    );
    if (duplicateAllocation) {
      toast.error("An active vehicle allocation already exists for this dispatch order");
      return;
    }
    const newAllocation = {
      ...formData,
      dispatchOrderNumber,
      items: formData.items.map((item) => ({ ...item, dispatchOrderNumber })),
      id: `VALLOC-${String(vehicleAllocations.length + 1).padStart(3, '0')}`,
      status: "Allocated"
    };
    
    // Create shipment and get result
    const shipmentResult = DummyTrackingProvider.createShipment(newAllocation);
    if (!shipmentResult.success) {
      toast.error(shipmentResult.reason || "Unable to create shipment");
      return;
    }
    
    // Add tracking number to allocation if shipment was created
    if (shipmentResult.success && shipmentResult.shipment) {
      newAllocation.trackingNumber = shipmentResult.shipment.trackingNumber;
    }
    
    setVehicleAllocations([...vehicleAllocations, newAllocation]);

    // Enrich the permanent parent record without consuming or replacing it.
    try {
      const storedOrders = localStorage.getItem("crm_dispatch_orders");
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      if (Array.isArray(orders)) {
        const shipment = shipmentResult.shipment;
        const nextOrders = orders.map((order) =>
          normalizeId(order.dispatchOrderNumber) === normalizeId(dispatchOrderNumber)
            ? {
                ...order,
                vehicleAllocated: true,
                assignedVehicleNumber: newAllocation.vehicleNumber,
                assignedDriverName: newAllocation.driverName,
                transporterName: newAllocation.transporterName,
                trackingNumber: shipment?.trackingNumber || order.trackingNumber,
                shipmentStatus: shipment?.status || "Allocated",
              }
            : order
        );
        localStorage.setItem("crm_dispatch_orders", JSON.stringify(nextOrders));
        window.dispatchEvent(new CustomEvent("dispatch-order-updated", {
          detail: { dispatchOrderNumber }
        }));
      }
    } catch {
      console.warn("Vehicle allocation created, but the linked dispatch order could not be enriched.");
    }
    
    // Dispatch vehicle-allocation-created event
    window.dispatchEvent(
      new CustomEvent("vehicle-allocation-created", {
        detail: {
          dispatchOrderNumber: newAllocation.dispatchOrderNumber,
          allocation: newAllocation,
          shipment: shipmentResult.shipment
        }
      })
    );
    
    setShowCreateModal(false);
    setFormData({
      allocationNumber: "",
      dispatchOrderNumber: "",
      allocationDate: "",
      vehicleNumber: "",
      vehicleType: "Truck",
      vehicleCapacity: "",
      driverName: "",
      driverNumber: "",
      driverLicense: "",
      transporterName: "",
      route: "",
      estimatedDistance: "",
      estimatedTime: "",
      fuelConsumption: "",
      remarks: "",
      items: [
        {
          dispatchOrderNumber: "",
          customerName: "",
          deliveryAddress: "",
          quantity: 0,
          weight: 0,
          priority: "Medium"
        }
      ]
    });
    
    if (shipmentResult.created) {
      toast.success("Vehicle allocation and shipment created successfully!");
    } else {
      toast.success("Vehicle allocation created successfully! (Shipment already exists)");
    }
  };

  const handleViewAllocation = (allocation) => {
    setSelectedAllocation(allocation);
    setShowViewModal(true);
  };

  const handleDeleteAllocation = (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle allocation?")) {
      setVehicleAllocations(vehicleAllocations.filter((v) => v.id !== id));
      toast.success("Vehicle allocation deleted successfully!");
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
        <span className="text-[#C2410C]"> Vehicle Allocation </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Allocations"
          count={totalAllocations}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Allocated"
          count={allocatedVehicles}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="In Transit"
          count={inTransitVehicles}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Completed"
          count={completedVehicles}
          bg="#ECFDF5"
          color="#059669"
        />
        <Card
          title="Total Vehicles"
          count={totalCapacity}
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
            placeholder="Search vehicle allocations..."
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
            <option value="Allocated">Allocated</option>
            <option value="Picked Up">Picked Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Completed">Completed</option>
          </select>

          <div
            className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus />
            <button className="cursor-pointer">Allocate Vehicle</button>
          </div>
        </div>
      </div>

      {/* Vehicle Allocations Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Allocation No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Dispatch Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Vehicle No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Driver
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Route
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Distance
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
            {filteredAllocations.length > 0 ? (
              filteredAllocations.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {allocation.allocationNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {allocation.dispatchOrderNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{allocation.vehicleNumber}</p>
                      <p className="text-xs text-gray-500">{allocation.vehicleType}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{allocation.driverName}</p>
                      <p className="text-xs text-gray-500">{allocation.driverNumber}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {allocation.route}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {allocation.estimatedDistance}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {/* Display derived shipment status */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${
                        getVehicleAllocationStatusColor(
                          shipmentStatuses[allocation.dispatchOrderNumber]
                        )
                      }`}
                    >
                      {getVehicleAllocationStatus(
                        shipmentStatuses[allocation.dispatchOrderNumber]
                      )}
                    </span>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewAllocation(allocation)}
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
                        onClick={() => handleDeleteAllocation(allocation.id)}
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
                  No Vehicle Allocation Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Vehicle Allocation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Allocate Vehicle</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAllocation}>
              {/* Allocation Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Allocation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Allocation Number</label>
                    <input
                      type="text"
                      name="allocationNumber"
                      value={formData.allocationNumber}
                      onChange={(e) => setFormData({ ...formData, allocationNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="VALLOC-2024-001"
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
                    <label className="block mb-1 font-medium text-sm">Allocation Date</label>
                    <input
                      type="date"
                      name="allocationDate"
                      value={formData.allocationDate}
                      onChange={(e) => setFormData({ ...formData, allocationDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Vehicle Details</h3>
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
                    <label className="block mb-1 font-medium text-sm">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      required
                    >
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                      <option value="Mini Truck">Mini Truck</option>
                      <option value="Container">Container</option>
                      <option value="Trailer">Trailer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Vehicle Capacity</label>
                    <input
                      type="text"
                      name="vehicleCapacity"
                      value={formData.vehicleCapacity}
                      onChange={(e) => setFormData({ ...formData, vehicleCapacity: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="10 Tons"
                    />
                  </div>
                </div>
              </div>

              {/* Driver Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Driver Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Driver Name</label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Enter driver name"
                      required
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
                    <label className="block mb-1 font-medium text-sm">Driver License</label>
                    <input
                      type="text"
                      name="driverLicense"
                      value={formData.driverLicense}
                      onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="DL-2024-001"
                    />
                  </div>
                </div>
              </div>

              {/* Transport Details */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Transport Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block mb-1 font-medium text-sm">Route</label>
                    <input
                      type="text"
                      name="route"
                      value={formData.route}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="Chennai to Coimbatore"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Estimated Distance</label>
                    <input
                      type="text"
                      name="estimatedDistance"
                      value={formData.estimatedDistance}
                      onChange={(e) => setFormData({ ...formData, estimatedDistance: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="500 km"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Estimated Time</label>
                    <input
                      type="text"
                      name="estimatedTime"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="8 hours"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Fuel Consumption</label>
                    <input
                      type="text"
                      name="fuelConsumption"
                      value={formData.fuelConsumption}
                      onChange={(e) => setFormData({ ...formData, fuelConsumption: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#FB6514]"
                      placeholder="25 Liters"
                    />
                  </div>
                </div>
              </div>

              {/* Dispatch Orders */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Dispatch Orders</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex gap-2 bg-[#FB6514] px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer text-sm"
                  >
                    <FiPlus />
                    Add Order
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Dispatch Order No</th>
                        <th className="p-2 text-left">Customer Name</th>
                        <th className="p-2 text-left">Delivery Address</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-right">Weight</th>
                        <th className="p-2 text-left">Priority</th>
                        <th className="p-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.dispatchOrderNumber}
                              onChange={(e) => handleItemChange(index, 'dispatchOrderNumber', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="DISP-2024-001"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.customerName}
                              onChange={(e) => handleItemChange(index, 'customerName', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="Customer name"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.deliveryAddress}
                              onChange={(e) => handleItemChange(index, 'deliveryAddress', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                              placeholder="Delivery address"
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
                            <select
                              value={item.priority}
                              onChange={(e) => handleItemChange(index, 'priority', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#FB6514]"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
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
                  Allocate Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Vehicle Allocation Modal */}
      {showViewModal && selectedAllocation && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Vehicle Allocation Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Allocation Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Allocation Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Allocation No</p>
                    <p className="font-medium">{selectedAllocation.allocationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dispatch Order No</p>
                    <p className="font-medium">{selectedAllocation.dispatchOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Allocation Date</p>
                    <p className="font-medium">{selectedAllocation.allocationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAllocation.status === "Allocated"
                        ? "bg-blue-100 text-blue-700"
                        : selectedAllocation.status === "In Transit"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {selectedAllocation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Vehicle Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Number</p>
                    <p className="font-medium">{selectedAllocation.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Type</p>
                    <p className="font-medium">{selectedAllocation.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Capacity</p>
                    <p className="font-medium">{selectedAllocation.vehicleCapacity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transporter Name</p>
                    <p className="font-medium">{selectedAllocation.transporterName}</p>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Driver Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Driver Name</p>
                    <p className="font-medium">{selectedAllocation.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Number</p>
                    <p className="font-medium">{selectedAllocation.driverNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver License</p>
                    <p className="font-medium">{selectedAllocation.driverLicense}</p>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Route Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Route</p>
                    <p className="font-medium">{selectedAllocation.route}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Distance</p>
                    <p className="font-medium">{selectedAllocation.estimatedDistance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Time</p>
                    <p className="font-medium">{selectedAllocation.estimatedTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fuel Consumption</p>
                    <p className="font-medium">{selectedAllocation.fuelConsumption}</p>
                  </div>
                </div>
              </div>

              {/* Dispatch Orders */}
              <div>
                <h3 className="font-semibold mb-3">Dispatch Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Dispatch Order No</th>
                        <th className="p-2 text-left">Customer Name</th>
                        <th className="p-2 text-left">Delivery Address</th>
                        <th className="p-2 text-right">Quantity</th>
                        <th className="p-2 text-right">Weight</th>
                        <th className="p-2 text-left">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAllocation.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.dispatchOrderNumber}</td>
                          <td className="p-2 font-medium">{item.customerName}</td>
                          <td className="p-2">{item.deliveryAddress}</td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2 text-right">{item.weight}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.priority === "High" ? "bg-red-100 text-red-700" :
                              item.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {item.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-purple-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 mb-2">Remarks</p>
                <p className="text-gray-800">{selectedAllocation.remarks || '-'}</p>
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
                  Print Allocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleAllocation;
