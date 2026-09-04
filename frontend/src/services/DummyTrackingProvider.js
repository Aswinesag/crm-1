const STORAGE_KEY = "crm_shipments";

import { getRouteForDestination, getDestinationCity, CHENNAI_WAREHOUSE } from "../data/routeData.js";
import { normalizeId } from "../utils/deliveryWorkflowStatus.js";

const listeners = new Set();

const emit = (eventName, shipment) => {
    const detail = {
        trackingNumber: shipment?.trackingNumber,
        dispatchOrderNumber: shipment?.dispatchOrderNumber,
        status: shipment?.status,
        shipment
    };
    listeners.forEach((listener) => listener(detail));
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
};

/**
 * Migrate Phase 1 shipment to Phase 2 format
 * @param {Object} shipment - The shipment object to migrate
 * @returns {Object} Migrated shipment with Phase 2 fields
 */
const migrateShipmentToPhase2 = (shipment) => {
    // Check if already migrated (has route field)
    if (shipment.route && Array.isArray(shipment.route) && shipment.route.length > 0) {
        return shipment;
    }

    // Determine route based on delivery address
    const route = getRouteForDestination(shipment.deliveryAddress || "");
    const destination = getDestinationCity(shipment.deliveryAddress || "");
    const origin = CHENNAI_WAREHOUSE.city;

    return {
        ...shipment,
        // Phase 2 fields with defaults
        route: route,
        routeIndex: 0,
        origin: origin,
        destination: destination,
        latitude: shipment.latitude || route[0]?.lat || CHENNAI_WAREHOUSE.lat,
        longitude: shipment.longitude || route[0]?.lng || CHENNAI_WAREHOUSE.lng,
        lastUpdated: shipment.lastUpdated || Date.now(),
        // Ensure currentLocation is set
        currentLocation: shipment.currentLocation || CHENNAI_WAREHOUSE.city,
        // Ensure progress is set
        progress: shipment.progress !== undefined ? shipment.progress : 0,
        // Ensure trackingHistory exists
        trackingHistory: shipment.trackingHistory || [
            {
                date: new Date().toLocaleString(),
                location: CHENNAI_WAREHOUSE.city,
                status: shipment.status || "Allocated",
                remarks: "Migrated from Phase 1"
            }
        ]
    };
};

const getStoredShipments = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const shipments = data ? JSON.parse(data) : [];
        console.log('getStoredShipments - Loaded shipments:', shipments.length);

        // Migrate Phase 1 shipments to Phase 2 format
        const migrated = shipments.map(shipment => migrateShipmentToPhase2(shipment));
        const dispatchOrders = new Set();
        const trackingNumbers = new Set();
        let repaired = false;

        const repairedShipments = migrated.reduce((result, shipment, index) => {
            const dispatchKey = normalizeId(shipment.dispatchOrderNumber);

            // Old builds could persist the same business shipment more than once.
            if (dispatchKey && dispatchOrders.has(dispatchKey)) {
                repaired = true;
                return result;
            }
            if (dispatchKey) dispatchOrders.add(dispatchKey);

            let trackingNumber = String(shipment.trackingNumber || "").trim();
            let trackingKey = normalizeId(trackingNumber);
            if (!trackingKey || trackingNumbers.has(trackingKey)) {
                trackingNumber = generateTrackingNumber(trackingNumbers, index);
                trackingKey = normalizeId(trackingNumber);
                repaired = true;
            }
            trackingNumbers.add(trackingKey);
            result.push(
                trackingNumber === shipment.trackingNumber
                    ? shipment
                    : { ...shipment, trackingNumber }
            );
            return result;
        }, []);

        if (repaired) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(repairedShipments));
            console.warn("Repaired duplicate or missing shipment identifiers in localStorage");
        }
        return repairedShipments;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
};

const saveShipments = (shipments) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(shipments)
        );
        console.log('Shipments saved to localStorage:', shipments.length);
    } catch (error) {
        console.error('Error writing to localStorage:', error);
    }
};

const generateTrackingNumber = (existingTrackingNumbers = new Set(), fallbackSeed = 0) => {
    let trackingNumber;
    do {
        const uniquePart = globalThis.crypto?.randomUUID
            ? globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 12)
            : `${Math.random().toString(36).slice(2, 11)}${fallbackSeed.toString(36)}`;
        trackingNumber = `TRK-${Date.now()}-${uniquePart}`;
    } while (existingTrackingNumbers.has(normalizeId(trackingNumber)));
    return trackingNumber;
};

const createShipment = (allocation) => {
    const dispatchOrderNumber = String(allocation?.dispatchOrderNumber || "").trim();
    if (!dispatchOrderNumber) {
        return { success: false, created: false, reason: "Dispatch order number is required", shipment: null };
    }
    const shipments = getStoredShipments();

    // Check if shipment already exists for this dispatch order
    const existingShipment = shipments.find(
        s => normalizeId(s.dispatchOrderNumber) === normalizeId(dispatchOrderNumber)
    );
    if (existingShipment) {
        console.log(`Shipment already exists for dispatch order: ${allocation.dispatchOrderNumber}`);
        return {
            success: true,
            created: false,
            reason: "Shipment already exists",
            shipment: existingShipment
        };
    }

    // Determine route based on delivery address
    const deliveryAddress = allocation.deliveryAddress || allocation.items?.[0]?.deliveryAddress || "";
    const route = getRouteForDestination(deliveryAddress);
    const destination = getDestinationCity(deliveryAddress);
    const origin = CHENNAI_WAREHOUSE.city;

    const shipment = {
        trackingNumber: generateTrackingNumber(
            new Set(shipments.map((shipment) => normalizeId(shipment.trackingNumber)))
        ),
        dispatchOrderNumber,

        customerName: allocation.customerName || allocation.items?.[0]?.customerName || "",
        customerCode: "",

        deliveryAddress: allocation.deliveryAddress || allocation.items?.[0]?.deliveryAddress || "",

        vehicleNumber: allocation.vehicleNumber,

        driverName: allocation.driverName,

        driverNumber: allocation.driverNumber,

        transporterName: allocation.transporterName,
        
        currentLocation: CHENNAI_WAREHOUSE.city,

        estimatedDelivery: allocation.estimatedDelivery || allocation.estimatedTime || "Pending",

        shipmentDate: new Date().toLocaleDateString(),

        actualDelivery: null,

        status: "Allocated",

        progress: 0,

        // Phase 2: Route and location fields
        route: route,
        routeIndex: 0,
        origin: origin,
        destination: destination,
        latitude: route[0]?.lat || CHENNAI_WAREHOUSE.lat,
        longitude: route[0]?.lng || CHENNAI_WAREHOUSE.lng,
        lastUpdated: Date.now(),

        trackingHistory: [
            {
                date: new Date().toLocaleString(),
                location: CHENNAI_WAREHOUSE.city,
                status: "Allocated",
                remarks: "Vehicle allocated and shipment created"
            }
        ]
    };

    shipments.push(shipment);
    saveShipments(shipments);

    // Dispatch event for new shipment creation
    emit("shipment-created", shipment);
    emit("shipment-updated", shipment);

    return {
        success: true,
        created: true,
        shipment: shipment
    };
};

const getAllShipments = () => {
    return getStoredShipments();
};

const getShipment = (trackingNumber) => {
    return getStoredShipments().find(
        (s) => normalizeId(s.trackingNumber) === normalizeId(trackingNumber)
    );
};

/**
 * Get shipment by dispatch order number
 * @param {string} dispatchOrderNumber - The dispatch order number
 * @returns {Object|null} Shipment object or null if not found
 */
const getShipmentByDispatchOrder = (dispatchOrderNumber) => {
    const shipments = getStoredShipments();
    return shipments.find(
        (s) => normalizeId(s.dispatchOrderNumber) === normalizeId(dispatchOrderNumber)
    ) || null;
};

/**
 * Get shipment status by dispatch order number
 * @param {string} dispatchOrderNumber - The dispatch order number
 * @returns {string} Shipment status or "Not Created" if no shipment exists
 */
const getShipmentStatusByDispatchOrder = (dispatchOrderNumber) => {
    const shipment = getShipmentByDispatchOrder(dispatchOrderNumber);
    return shipment ? shipment.status : "Not Created";
};

/**
 * Dispatch custom event when shipment data changes
 * @param {Object} detail - Event detail containing trackingNumber, dispatchOrderNumber, status
 */
const dispatchShipmentUpdateEvent = (detail) => {
    console.log('Dispatching shipment-updated event:', detail);
    if (typeof window !== "undefined") window.dispatchEvent(
        new CustomEvent("shipment-updated", { detail })
    );
};

const markDeliveredByDispatchOrder = (dispatchOrderNumber) => {
    const shipments = getStoredShipments();
    let updatedShipment = null;

    const updated = shipments.map((shipment) => {
        if (
            normalizeId(shipment.dispatchOrderNumber) !== normalizeId(dispatchOrderNumber)
        ) {
            return shipment;
        }

        // Return safe result if already delivered
        if (shipment.status === "Delivered") {
            console.log('Shipment already delivered:', dispatchOrderNumber);
            return shipment;
        }

        // Check for duplicate Delivered history entry
        const hasDeliveredEntry = shipment.trackingHistory &&
            shipment.trackingHistory.some(entry => entry.status === "Delivered");

        const deliveredEntry = {
            date: new Date().toLocaleString(),
            location: shipment.deliveryAddress || shipment.destination || "Delivery Location",
            status: "Delivered",
            remarks: "Shipment delivered successfully"
        };

        updatedShipment = {
            ...shipment,
            status: "Delivered",
            progress: 100,
            currentLocation: shipment.deliveryAddress || shipment.destination,
            actualDelivery: new Date().toLocaleDateString(),
            deliveredAt: Date.now(),
            lastUpdated: Date.now(),
            // Update latitude/longitude to final route point if available
            latitude: shipment.route && shipment.route.length > 0 
                ? shipment.route[shipment.route.length - 1].lat 
                : shipment.latitude,
            longitude: shipment.route && shipment.route.length > 0 
                ? shipment.route[shipment.route.length - 1].lng 
                : shipment.longitude,
            // Update routeIndex to final route index
            routeIndex: shipment.route ? shipment.route.length - 1 : shipment.routeIndex,
            trackingHistory: hasDeliveredEntry 
                ? shipment.trackingHistory 
                : [...(shipment.trackingHistory || []), deliveredEntry]
        };

        console.log('Marking shipment as delivered:', dispatchOrderNumber, updatedShipment);
        return updatedShipment;
    });

    saveShipments(updated);

    // Dispatch event if shipment was updated
    if (updatedShipment) {
        dispatchShipmentUpdateEvent({
            trackingNumber: updatedShipment.trackingNumber,
            dispatchOrderNumber: updatedShipment.dispatchOrderNumber,
            status: "Delivered"
        });

        // Dispatch shipment-delivered event for cross-module sync
        window.dispatchEvent(
            new CustomEvent("shipment-delivered", {
                detail: {
                    dispatchOrderNumber: updatedShipment.dispatchOrderNumber,
                    trackingNumber: updatedShipment.trackingNumber,
                    shipment: updatedShipment
                }
            })
        );
    }

    return updatedShipment;
};

/**
 * Advance shipment to next route checkpoint
 * @param {string} trackingNumber - The shipment's tracking number
 * @returns {Object|null} Updated shipment or null if not found/already at destination
 */
const advanceShipment = (trackingNumber) => {
    const shipments = getStoredShipments();
    let updatedShipment = null;

    const updated = shipments.map((shipment) => {
        if (normalizeId(shipment.trackingNumber) !== normalizeId(trackingNumber)) {
            return shipment;
        }

        // Check if shipment is already delivered or at destination
        if (shipment.status === "Delivered") {
            console.log('advanceShipment - Skipping delivered shipment:', trackingNumber);
            return shipment;
        }

        // Check if already at final checkpoint
        if (!shipment.route || shipment.routeIndex >= shipment.route.length - 1) {
            console.log('advanceShipment - Shipment at final checkpoint:', trackingNumber);
            return shipment;
        }

        // Advance to next checkpoint
        const nextIndex = shipment.routeIndex + 1;
        const nextCheckpoint = shipment.route[nextIndex];
        
        // Calculate progress percentage
        const progress = Math.round((nextIndex / (shipment.route.length - 1)) * 100);

        // Determine status based on route index
        let newStatus = "In Transit";
        if (nextIndex === 1) {
            newStatus = "Picked Up";
        } else if (nextIndex === shipment.route.length - 1) {
            newStatus = "Out For Delivery";
        }

        // Create timeline entry
        const timelineEntry = {
            date: new Date().toLocaleString(),
            location: nextCheckpoint.city,
            status: newStatus,
            remarks: `Shipment reached ${nextCheckpoint.city}`
        };

        // Prevent duplicate timeline entries
        const history = Array.isArray(shipment.trackingHistory) ? shipment.trackingHistory : [];
        const lastHistoryEntry = history[history.length - 1];
        if (lastHistoryEntry && 
            lastHistoryEntry.location === nextCheckpoint.city && 
            lastHistoryEntry.status === newStatus) {
            // Skip duplicate entry
            updatedShipment = {
                ...shipment,
                routeIndex: nextIndex,
                currentLocation: nextCheckpoint.city,
                latitude: nextCheckpoint.lat,
                longitude: nextCheckpoint.lng,
                status: newStatus,
                progress: progress,
                lastUpdated: Date.now()
            };
            return updatedShipment;
        }

        updatedShipment = {
            ...shipment,
            routeIndex: nextIndex,
            currentLocation: nextCheckpoint.city,
            latitude: nextCheckpoint.lat,
            longitude: nextCheckpoint.lng,
            status: newStatus,
            progress: progress,
            lastUpdated: Date.now(),
            trackingHistory: [
                ...history,
                timelineEntry
            ]
        };

        return updatedShipment;
    });

    saveShipments(updated);

    // Dispatch event if shipment was updated
    if (updatedShipment) {
        dispatchShipmentUpdateEvent({
            trackingNumber: updatedShipment.trackingNumber,
            dispatchOrderNumber: updatedShipment.dispatchOrderNumber,
            status: updatedShipment.status
        });
    }

    return updatedShipment;
};

// Simulation interval reference
let simulationInterval = null;
const SIMULATION_INTERVAL_MS = 15000; // 15 seconds

/**
 * Start automatic shipment movement simulation
 * Advances all active shipments every 15 seconds
 */
const startShipmentSimulation = () => {
    // Prevent duplicate intervals
    if (simulationInterval) {
        console.log('Simulation already running');
        return;
    }

    console.log('Starting shipment simulation...');
    
    simulationInterval = setInterval(() => {
        const shipments = getStoredShipments();
        let updatedCount = 0;

        shipments.forEach((shipment) => {
            // Skip delivered shipments - NEVER advance these
            if (shipment.status === "Delivered") {
                console.log('Skipping delivered shipment:', shipment.trackingNumber);
                return;
            }

            // Skip shipments without route data (Phase 1 compatibility)
            if (!shipment.route || shipment.route.length === 0) {
                return;
            }

            // Skip shipments already at destination (Out For Delivery)
            // Simulation must stop at Out For Delivery, not proceed to Delivered
            if (shipment.routeIndex >= shipment.route.length - 1) {
                return;
            }

            // Skip shipments that are already Out For Delivery
            if (shipment.status === "Out For Delivery") {
                return;
            }

            // Advance shipment
            advanceShipment(shipment.trackingNumber);
            updatedCount++;
        });

        if (updatedCount > 0) {
            console.log(`Advanced ${updatedCount} shipments`);
        }
    }, SIMULATION_INTERVAL_MS);
};

/**
 * Stop automatic shipment movement simulation
 */
const stopShipmentSimulation = () => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
        console.log('Shipment simulation stopped');
    }
};

/**
 * Get simulation status
 * @returns {boolean} Whether simulation is running
 */
const isSimulationRunning = () => {
    return simulationInterval !== null;
};

/**
 * Clear all shipments from localStorage (for testing/debugging)
 */
const clearAllShipments = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log("All shipments cleared from localStorage");
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
};

export default {
    createShipment,
    getAllShipments,
    getShipment,
    getShipmentByDispatchOrder,
    getShipmentStatusByDispatchOrder,
    markDeliveredByDispatchOrder,
    advanceShipment,
    startShipmentSimulation,
    stopShipmentSimulation,
    isSimulationRunning,
    clearAllShipments,
    subscribe(listener) {
        if (typeof listener !== "function") return () => {};
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    unsubscribe(listener) {
        listeners.delete(listener);
    }
};
