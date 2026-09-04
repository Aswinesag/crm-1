// Route data for shipment tracking simulation
// All routes originate from Chennai Warehouse

const CHENNAI_WAREHOUSE = {
  city: "Chennai Warehouse",
  state: "Tamil Nadu",
  lat: 13.0827,
  lng: 80.2707
};

// Route definitions with checkpoints
const ROUTES = {
  "Bangalore": [
    CHENNAI_WAREHOUSE,
    { city: "Vellore", state: "Tamil Nadu", lat: 12.9165, lng: 79.1325 },
    { city: "Krishnagiri", state: "Tamil Nadu", lat: 12.5185, lng: 78.2138 },
    { city: "Hosur", state: "Tamil Nadu", lat: 12.7409, lng: 77.8283 },
    { city: "Electronic City", state: "Karnataka", lat: 12.8456, lng: 77.6339 },
    { city: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 }
  ],
  "Coimbatore": [
    CHENNAI_WAREHOUSE,
    { city: "Kanchipuram", state: "Tamil Nadu", lat: 12.8452, lng: 79.7036 },
    { city: "Vellore", state: "Tamil Nadu", lat: 12.9165, lng: 79.1325 },
    { city: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460 },
    { city: "Erode", state: "Tamil Nadu", lat: 11.3410, lng: 77.7382 },
    { city: "Tiruppur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411 },
    { city: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 }
  ],
  "Hyderabad": [
    CHENNAI_WAREHOUSE,
    { city: "Nellore", state: "Andhra Pradesh", lat: 14.4426, lng: 79.9865 },
    { city: "Ongole", state: "Andhra Pradesh", lat: 15.5057, lng: 80.0494 },
    { city: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lng: 80.4365 },
    { city: "Suryapet", state: "Telangana", lat: 17.1455, lng: 79.6185 },
    { city: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480 },
    { city: "Khammam", state: "Telangana", lat: 17.2473, lng: 80.1514 },
    { city: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 }
  ],
  "Pune": [
    CHENNAI_WAREHOUSE,
    { city: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4186 },
    { city: "Kurnool", state: "Andhra Pradesh", lat: 15.8281, lng: 78.0373 },
    { city: "Raichur", state: "Karnataka", lat: 16.2076, lng: 77.3463 },
    { city: "Gulbarga", state: "Karnataka", lat: 17.3297, lng: 76.8343 },
    { city: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064 },
    { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 }
  ],
  "Mumbai": [
    CHENNAI_WAREHOUSE,
    { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
    { city: "Lonavala", state: "Maharashtra", lat: 18.7546, lng: 73.4085 },
    { city: "Panvel", state: "Maharashtra", lat: 18.9894, lng: 73.1245 },
    { city: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781 },
    { city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 }
  ],
  "Chennai": [
    CHENNAI_WAREHOUSE,
    { city: "Perambur", state: "Tamil Nadu", lat: 13.1023, lng: 80.2338 },
    { city: "Anna Nagar", state: "Tamil Nadu", lat: 13.0869, lng: 80.2103 },
    { city: "T. Nagar", state: "Tamil Nadu", lat: 13.0410, lng: 80.2353 },
    { city: "Chennai City", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 }
  ]
};

// Fallback route for unknown destinations
const FALLBACK_ROUTE = [
  CHENNAI_WAREHOUSE,
  { city: "En Route", state: "Transit", lat: 13.0827, lng: 80.2707 },
  { city: "Destination", state: "Unknown", lat: 13.0827, lng: 80.2707 }
];

/**
 * Match destination from delivery address
 * @param {string} deliveryAddress - The delivery address string
 * @returns {Array} Route checkpoints for the matched destination
 */
const getRouteForDestination = (deliveryAddress) => {
  if (!deliveryAddress || typeof deliveryAddress !== 'string') {
    return FALLBACK_ROUTE;
  }

  const address = deliveryAddress.toLowerCase();
  
  // Try to match city names in the address
  for (const [city, route] of Object.entries(ROUTES)) {
    if (address.includes(city.toLowerCase())) {
      return route;
    }
  }

  // Try partial matches
  if (address.includes('bangalore') || address.includes('bengaluru')) {
    return ROUTES["Bangalore"];
  }
  if (address.includes('coimbatore') || address.includes('covai')) {
    return ROUTES["Coimbatore"];
  }
  if (address.includes('hyderabad') || address.includes('secunderabad')) {
    return ROUTES["Hyderabad"];
  }
  if (address.includes('pune') || address.includes('poona')) {
    return ROUTES["Pune"];
  }
  if (address.includes('mumbai') || address.includes('bombay')) {
    return ROUTES["Mumbai"];
  }
  if (address.includes('chennai') || address.includes('madras')) {
    return ROUTES["Chennai"];
  }

  // Return fallback if no match found
  return FALLBACK_ROUTE;
};

/**
 * Extract destination city from delivery address
 * @param {string} deliveryAddress - The delivery address string
 * @returns {string} The matched destination city name
 */
const getDestinationCity = (deliveryAddress) => {
  if (!deliveryAddress || typeof deliveryAddress !== 'string') {
    return "Unknown";
  }

  const address = deliveryAddress.toLowerCase();
  
  for (const city of Object.keys(ROUTES)) {
    if (address.includes(city.toLowerCase())) {
      return city;
    }
  }

  // Try partial matches
  if (address.includes('bangalore') || address.includes('bengaluru')) return "Bangalore";
  if (address.includes('coimbatore') || address.includes('covai')) return "Coimbatore";
  if (address.includes('hyderabad') || address.includes('secunderabad')) return "Hyderabad";
  if (address.includes('pune') || address.includes('poona')) return "Pune";
  if (address.includes('mumbai') || address.includes('bombay')) return "Mumbai";
  if (address.includes('chennai') || address.includes('madras')) return "Chennai";

  return "Unknown";
};

export {
  CHENNAI_WAREHOUSE,
  ROUTES,
  FALLBACK_ROUTE,
  getRouteForDestination,
  getDestinationCity
};
