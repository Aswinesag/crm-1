import {
    getVehicleAllocationDisplayStatus,
    getDeliveryChallanStatus as getCentralDeliveryChallanStatus,
    getDeliveryConfirmationStatus as getCentralDeliveryConfirmationStatus,
    isDeliveryConfirmationAllowed
} from "./deliveryWorkflowStatus.js";

/**
 * Shipment Status Mapper Utility
 * Provides reusable functions to map shipment status to module-specific statuses
 * across Vehicle Allocation, Delivery Challan, and Delivery Confirmation modules.
 */

/**
 * Map shipment status to Vehicle Allocation status
 * @param {string} shipmentStatus - The shipment status from DummyTrackingProvider
 * @returns {string} Corresponding Vehicle Allocation status
 */
export const getVehicleAllocationStatus = (shipmentStatus) => {
    return getVehicleAllocationDisplayStatus(shipmentStatus || "Not Created");
};

/**
 * Map shipment status to Delivery Challan status
 * @param {string} shipmentStatus - The shipment status from DummyTrackingProvider
 * @returns {string} Corresponding Delivery Challan status
 */
export const getDeliveryChallanStatus = (shipmentStatus) => {
    return getCentralDeliveryChallanStatus(shipmentStatus || "Not Created");
};

/**
 * Map shipment status to Delivery Confirmation status
 * @param {string} shipmentStatus - The shipment status from DummyTrackingProvider
 * @returns {string} Corresponding Delivery Confirmation status
 */
export const getDeliveryConfirmationStatus = (shipmentStatus) => {
    return getCentralDeliveryConfirmationStatus(shipmentStatus || "Not Created");
};

/**
 * Check if delivery confirmation is allowed for a shipment status
 * @param {string} shipmentStatus - The shipment status from DummyTrackingProvider
 * @returns {boolean} Whether delivery confirmation can be performed
 */
export { isDeliveryConfirmationAllowed };

/**
 * Check if a shipment is complete (delivered)
 * @param {string} shipmentStatus - The shipment status from DummyTrackingProvider
 * @returns {boolean} Whether the shipment is delivered
 */
export const isShipmentComplete = (shipmentStatus) => {
    return shipmentStatus === "Delivered";
};

/**
 * Get status color class for Vehicle Allocation
 * @param {string} shipmentStatus - The shipment status from DummyTrackingProvider
 * @returns {string} Tailwind CSS classes for status badge
 */
export const getVehicleAllocationStatusColor = (shipmentStatus) => {
    const colorMap = {
        "Allocated": "bg-blue-100 text-blue-700",
        "Picked Up": "bg-blue-100 text-blue-700",
        "In Transit": "bg-yellow-100 text-yellow-700",
        "Out For Delivery": "bg-purple-100 text-purple-700",
        "Delivered": "bg-green-100 text-green-700"
    };
    return colorMap[shipmentStatus] || "bg-gray-100 text-gray-700";
};

/**
 * Get status color class for Delivery Challan
 * @param {string} shipmentStatus - The shipment status from DummyTrackingProvider
 * @returns {string} Tailwind CSS classes for status badge
 */
export const getDeliveryChallanStatusColor = (shipmentStatus) => {
    const colorMap = {
        "Allocated": "bg-gray-100 text-gray-700",
        "Picked Up": "bg-yellow-100 text-yellow-700",
        "In Transit": "bg-yellow-100 text-yellow-700",
        "Out For Delivery": "bg-purple-100 text-purple-700",
        "Delivered": "bg-green-100 text-green-700"
    };
    return colorMap[shipmentStatus] || "bg-gray-100 text-gray-700";
};

/**
 * Get status color class for Delivery Confirmation
 * @param {string} shipmentStatus - The shipment status from DummyTrackingProvider
 * @returns {string} Tailwind CSS classes for status badge
 */
export const getDeliveryConfirmationStatusColor = (shipmentStatus) => {
    const colorMap = {
        "Allocated": "bg-gray-100 text-gray-700",
        "Picked Up": "bg-gray-100 text-gray-700",
        "In Transit": "bg-gray-100 text-gray-700",
        "Out For Delivery": "bg-yellow-100 text-yellow-700",
        "Delivered": "bg-green-100 text-green-700"
    };
    return colorMap[shipmentStatus] || "bg-gray-100 text-gray-700";
};
