/**
 * Delivery Workflow Status Utilities
 * 
 * This utility provides consistent status mapping across all modules
 * based on the single source of truth: shipment status.
 * 
 * Shipment Status Flow:
 * Allocated → Picked Up → In Transit → Out For Delivery → Delivered
 */

/**
 * Normalize identifier for consistent comparison
 * @param {string} value - The identifier to normalize
 * @returns {string} Normalized lowercase trimmed string
 */
export const normalizeId = (value) => String(value || "").trim().toLowerCase();

/**
 * Get Dispatch Order display status from shipment status
 * @param {string} shipmentStatus - The shipment status
 * @returns {string} Dispatch Order display status
 */
export const getDispatchOrderDeliveryStatus = (shipmentStatus) => {
  const statusMap = {
    "Allocated": "Vehicle Allocated",
    "Picked Up": "Dispatched",
    "In Transit": "In Transit",
    "Out For Delivery": "Out For Delivery",
    "Delivered": "Completed",
    "Not Created": "Not Allocated"
  };
  return statusMap[shipmentStatus] || "Unknown";
};

/**
 * Get Transportation display status from shipment status
 * @param {string} shipmentStatus - The shipment status
 * @returns {string} Transportation display status
 */
export const getTransportationStatus = (shipmentStatus) => {
  const statusMap = {
    "Allocated": "Allocated",
    "Picked Up": "Picked Up",
    "In Transit": "In Transit",
    "Out For Delivery": "Out For Delivery",
    "Delivered": "Completed",
    "Not Created": "Not Allocated"
  };
  return statusMap[shipmentStatus] || "Unknown";
};

/**
 * Get Vehicle Allocation display status from shipment status
 * @param {string} shipmentStatus - The shipment status
 * @returns {string} Vehicle Allocation display status
 */
export const getVehicleAllocationDisplayStatus = (shipmentStatus) => {
  const statusMap = {
    "Allocated": "Allocated",
    "Picked Up": "Picked Up",
    "In Transit": "In Transit",
    "Out For Delivery": "Out For Delivery",
    "Delivered": "Completed",
    "Not Created": "Allocated"
  };
  return statusMap[shipmentStatus] || "Unknown";
};

/**
 * Get Delivery Challan display status from shipment status
 * @param {string} shipmentStatus - The shipment status
 * @returns {string} Delivery Challan display status
 */
export const getDeliveryChallanStatus = (shipmentStatus) => {
  const statusMap = {
    "Allocated": "Pending",
    "Picked Up": "In Transit",
    "In Transit": "In Transit",
    "Out For Delivery": "Ready for Delivery",
    "Delivered": "Completed",
    "Not Created": "Not Ready"
  };
  return statusMap[shipmentStatus] || "Unknown";
};

/**
 * Get Delivery Confirmation display status from shipment status
 * @param {string} shipmentStatus - The shipment status
 * @returns {string} Delivery Confirmation display status
 */
export const getDeliveryConfirmationStatus = (shipmentStatus) => {
  const statusMap = {
    "Allocated": "Not Ready",
    "Picked Up": "Not Ready",
    "In Transit": "Not Ready",
    "Out For Delivery": "Pending Confirmation",
    "Delivered": "Confirmed",
    "Not Created": "Not Ready"
  };
  return statusMap[shipmentStatus] || "Unknown";
};

/**
 * Check if Delivery Challan is ready for generation
 * @param {string} shipmentStatus - The shipment status
 * @returns {boolean} True if challan is ready
 */
export const isChallanReady = (shipmentStatus) => {
  return shipmentStatus === "Out For Delivery" || shipmentStatus === "Delivered";
};

/**
 * Check if Delivery Confirmation is allowed
 * @param {string} shipmentStatus - The shipment status
 * @returns {boolean} True if confirmation is allowed
 */
export const isDeliveryConfirmationAllowed = (shipmentStatus) => {
  return shipmentStatus === "Out For Delivery";
};

/**
 * Check if delivery is complete
 * @param {string} shipmentStatus - The shipment status
 * @returns {boolean} True if delivery is complete
 */
export const isDeliveryComplete = (shipmentStatus) => {
  return shipmentStatus === "Delivered";
};

/**
 * Get color class for status badge
 * @param {string} status - The display status
 * @returns {string} Tailwind CSS color classes
 */
export const getStatusColor = (status) => {
  const colorMap = {
    // Dispatch Order colors
    "Vehicle Allocated": "bg-blue-100 text-blue-700",
    "Dispatched": "bg-purple-100 text-purple-700",
    "In Transit": "bg-yellow-100 text-yellow-700",
    "Out For Delivery": "bg-orange-100 text-orange-700",
    "Completed": "bg-green-100 text-green-700",
    "Not Allocated": "bg-gray-100 text-gray-700",
    
    // Delivery Challan colors
    "Pending": "bg-gray-100 text-gray-700",
    "Ready for Delivery": "bg-green-100 text-green-700",
    "Not Ready": "bg-red-100 text-red-700",
    
    // Delivery Confirmation colors
    "Not Ready": "bg-gray-100 text-gray-700",
    "Pending Confirmation": "bg-orange-100 text-orange-700",
    "Confirmed": "bg-green-100 text-green-700",
    
    // Fallback
    "Unknown": "bg-gray-100 text-gray-700"
  };
  return colorMap[status] || "bg-gray-100 text-gray-700";
};
