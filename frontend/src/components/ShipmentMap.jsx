import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ShipmentMap = ({ shipment }) => {
  const [mapKey, setMapKey] = useState(0);

  // Force map re-render when shipment changes
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [shipment?.trackingNumber, shipment?.routeIndex]);

  // Handle missing or invalid shipment data
  if (!shipment) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <p className="text-gray-500">No shipment data available</p>
      </div>
    );
  }

  // Handle missing route data (Phase 1 compatibility)
  if (!shipment.route || shipment.route.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <p className="text-gray-500">Route data not available for this shipment</p>
      </div>
    );
  }

  // Handle missing coordinates
  if (!shipment.latitude || !shipment.longitude) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <p className="text-gray-500">Location coordinates not available</p>
      </div>
    );
  }

  // Extract route coordinates for polyline
  const routeCoordinates = shipment.route
    .filter(checkpoint => checkpoint.lat && checkpoint.lng)
    .map(checkpoint => [checkpoint.lat, checkpoint.lng]);

  // Origin marker (first checkpoint)
  const originPosition = shipment.route[0]?.lat && shipment.route[0]?.lng
    ? [shipment.route[0].lat, shipment.route[0].lng]
    : null;

  // Destination marker (last checkpoint)
  const destinationPosition = shipment.route[shipment.route.length - 1]?.lat && 
                              shipment.route[shipment.route.length - 1]?.lng
    ? [shipment.route[shipment.route.length - 1].lat, shipment.route[shipment.route.length - 1].lng]
    : null;

  // Current vehicle position
  const currentPosition = [shipment.latitude, shipment.longitude];

  // Custom icons
  const vehicleIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const originIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="rounded-lg overflow-hidden" style={{ height: '400px' }}>
      <MapContainer
        key={mapKey}
        center={currentPosition}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
          />
        )}

        {/* Origin Marker */}
        {originPosition && (
          <Marker position={originPosition} icon={originIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Origin</strong><br />
                {shipment.origin || shipment.route[0]?.city}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationPosition && (
          <Marker position={destinationPosition} icon={destinationIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Destination</strong><br />
                {shipment.destination || shipment.route[shipment.route.length - 1]?.city}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vehicle Marker */}
        <Marker position={currentPosition} icon={vehicleIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Current Location</strong><br />
              {shipment.currentLocation}<br />
              Status: {shipment.status}<br />
              Progress: {shipment.progress}%
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ShipmentMap;
