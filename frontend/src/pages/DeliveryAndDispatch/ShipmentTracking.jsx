import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEdit, FiEye, FiTrash2, FiDownload, FiMapPin, FiPlay, FiPause, FiRefreshCw } from "react-icons/fi";
import { IoIosSearch } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import Card from "../../components/Card.jsx";
import DummyTrackingProvider from "../../services/DummyTrackingProvider.js";
import ShipmentMap from "../../components/ShipmentMap.jsx";

const ShipmentTracking = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  const [shipments, setShipments] = useState([]);

  const loadShipments = () => {
    setShipments(DummyTrackingProvider.getAllShipments());
  };

  useEffect(() => {
    loadShipments();
  }, []);

  // Reload shipments when localStorage changes (for cross-tab sync)
  useEffect(() => {
    const handleStorageChange = () => {
      loadShipments();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for cross-module shipment events
  useEffect(() => {
    const handleShipmentCreated = () => {
      loadShipments();
    };

    const handleShipmentUpdated = () => {
      loadShipments();
    };

    const handleShipmentDelivered = () => {
      loadShipments();
    };

    window.addEventListener('shipment-created', handleShipmentCreated);
    window.addEventListener('shipment-updated', handleShipmentUpdated);
    window.addEventListener('shipment-delivered', handleShipmentDelivered);

    return () => {
      window.removeEventListener('shipment-created', handleShipmentCreated);
      window.removeEventListener('shipment-updated', handleShipmentUpdated);
      window.removeEventListener('shipment-delivered', handleShipmentDelivered);
    };
  }, []);

  // Auto-refresh shipments every 5 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadShipments();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check simulation status on mount
  useEffect(() => {
    setIsSimulationRunning(DummyTrackingProvider.isSimulationRunning());
  }, []);

  const handleStartSimulation = () => {
    DummyTrackingProvider.startShipmentSimulation();
    setIsSimulationRunning(true);
    toast.success("Shipment simulation started");
  };

  const handleStopSimulation = () => {
    DummyTrackingProvider.stopShipmentSimulation();
    setIsSimulationRunning(false);
    toast.success("Shipment simulation stopped");
  };

  const handleRefresh = () => {
    setShipments(DummyTrackingProvider.getAllShipments());
    toast.success("Shipments refreshed");
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.dispatchOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.currentLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? shipment.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalShipments = shipments.length;
  const pendingShipments = shipments.filter((s) => s.status === "Pending").length;
  const inTransitShipments = shipments.filter((s) => s.status === "In Transit").length;
  const deliveredShipments = shipments.filter((s) => s.status === "Delivered").length;
  const delayedShipments = shipments.filter((s) => s.status === "Delayed").length;

  const handleViewShipment = (shipment) => {
    setSelectedShipment(shipment);
    setShowViewModal(true);
  };

  const handleStatusChange = (trackingNumber, newStatus) => {
    setShipments(shipments.map((s) => 
      s.trackingNumber === trackingNumber ? { ...s, status: newStatus } : s
    ));
    toast.success(`Shipment status updated to ${newStatus}`);
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
        <span className="text-[#C2410C]"> Shipment Tracking </span>
      </div>

      {/* Summary Cards */}
      <div className="flex justify-center text-center md:text-start flex-wrap gap-3 xl:gap-4 mt-4">
        <Card
          title="Total Shipments"
          count={totalShipments}
          bg="#FFF7ED"
          color="#C2410C"
        />
        <Card
          title="Pending"
          count={pendingShipments}
          bg="#EAF1FA"
          color="#1C4CD2"
        />
        <Card
          title="In Transit"
          count={inTransitShipments}
          bg="#FAF5FF"
          color="#7E22CE"
        />
        <Card
          title="Delivered"
          count={deliveredShipments}
          bg="#ECFDF5"
          color="#059669"
        />
        <Card
          title="Delayed"
          count={delayedShipments}
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
            placeholder="Search shipments..."
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
            <option value="Allocated">Allocated</option>
            <option value="Picked Up">Picked Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Delayed">Delayed</option>
          </select>

          <button
            onClick={handleRefresh}
            className="flex gap-2 bg-gray-500 px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
            title="Refresh shipments"
          >
            <FiRefreshCw />
            <span className="hidden xl:inline">Refresh</span>
          </button>

          {!isSimulationRunning ? (
            <button
              onClick={handleStartSimulation}
              className="flex gap-2 bg-green-600 px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
              title="Start shipment simulation"
            >
              <FiPlay />
              <span className="hidden xl:inline">Start Simulation</span>
            </button>
          ) : (
            <button
              onClick={handleStopSimulation}
              className="flex gap-2 bg-red-600 px-3 py-2 rounded-md text-white items-center font-medium cursor-pointer"
              title="Stop shipment simulation"
            >
              <FiPause />
              <span className="hidden xl:inline">Stop Simulation</span>
            </button>
          )}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="overflow-x-auto w-auto mt-4 rounded-t-md border-b border-gray-300 shadow-md">
        <table className="w-full bg-white text-sm text-left border-separate border-spacing-0 rounded-md">
          <thead className="bg-white text-gray-500 uppercase tracking-wider rounded-t-md">
            <tr>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tl-md">
                Tracking No
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Dispatch Order
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Customer
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Vehicle
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Current Location
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Est. Delivery
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Status
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start">
                Progress
              </th>
              <th className="p-3 border-b border-gray-300 text-center md:text-start rounded-tr-md">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredShipments.length > 0 ? (
              filteredShipments.map((shipment) => (
                <tr key={shipment.trackingNumber} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b border-gray-300 text-blue-700 font-medium">
                    {shipment.trackingNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {shipment.dispatchOrderNumber}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{shipment.customerName}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div>
                      <p className="font-medium">{shipment.vehicleNumber}</p>
                      <p className="text-xs text-gray-500">{shipment.driverName}</p>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-orange-500" />
                      <span>{shipment.currentLocation}</span>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    {shipment.estimatedDelivery}
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <select
                      value={shipment.status}
                      onChange={(e) => handleStatusChange(shipment.trackingNumber, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        shipment.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : shipment.status === "In Transit"
                          ? "bg-yellow-100 text-yellow-700"
                          : shipment.status === "Picked Up"
                          ? "bg-blue-100 text-blue-700"
                          : shipment.status === "Out For Delivery"
                          ? "bg-purple-100 text-purple-700"
                          : shipment.status === "Allocated"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Allocated">Allocated</option>
                      <option value="Picked Up">Picked Up</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${shipment.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{shipment.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-300">
                    <div className="flex items-center gap-3">
                      <FiEye
                        className="text-blue-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleViewShipment(shipment)}
                      />
                      <FiDownload
                        className="text-purple-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => toast("Download functionality coming soon")}
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
                  No Shipment Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Shipment Modal */}
      {showViewModal && selectedShipment && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-md max-w-6xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Shipment Tracking Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Shipment Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Shipment Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-medium">{selectedShipment.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dispatch Order No</p>
                    <p className="font-medium">{selectedShipment.dispatchOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipment Date</p>
                    <p className="font-medium">{selectedShipment.shipmentDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedShipment.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : selectedShipment.status === "In Transit"
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedShipment.status === "Picked Up"
                        ? "bg-blue-100 text-blue-700"
                        : selectedShipment.status === "Out For Delivery"
                        ? "bg-purple-100 text-purple-700"
                        : selectedShipment.status === "Allocated"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {selectedShipment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Origin</p>
                    <p className="font-medium">{selectedShipment.origin || "Chennai Warehouse"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="font-medium">{selectedShipment.destination || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="font-medium">{selectedShipment.progress || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{selectedShipment.lastUpdated ? new Date(selectedShipment.lastUpdated).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Shipment Progress</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${selectedShipment.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold">{selectedShipment.progress || 0}%</span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium">{selectedShipment.customerName}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium">{selectedShipment.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-orange-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Vehicle Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Number</p>
                    <p className="font-medium">{selectedShipment.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Name</p>
                    <p className="font-medium">{selectedShipment.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Driver Number</p>
                    <p className="font-medium">{selectedShipment.driverNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Location</p>
                    <p className="font-medium flex items-center gap-2">
                      <FiMapPin className="text-orange-500" />
                      {selectedShipment.currentLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Delivery Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">{selectedShipment.estimatedDelivery}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Actual Delivery</p>
                    <p className="font-medium">{selectedShipment.actualDelivery || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Live Map */}
              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Live Tracking Map</h3>
                <ShipmentMap shipment={selectedShipment} />
              </div>

              {/* Tracking History */}
              <div>
                <h3 className="font-semibold mb-3">Tracking History</h3>
                <div className="space-y-3">
                  {selectedShipment.trackingHistory.map((history, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === selectedShipment.trackingHistory.length - 1
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}></div>
                        {index < selectedShipment.trackingHistory.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1 bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{history.location}</p>
                            <p className="text-sm text-gray-500">{history.date}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            history.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : history.status === "In Transit"
                              ? "bg-yellow-100 text-yellow-700"
                              : history.status === "Picked Up"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {history.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{history.remarks}</p>
                      </div>
                    </div>
                  ))}
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
                  onClick={() => toast.info("Download functionality coming soon")}
                  className="px-6 py-2 bg-[#FB6514] text-white rounded-md cursor-pointer hover:bg-[#e55a0d]"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentTracking;
