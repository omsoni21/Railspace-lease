
export type Asset = {
  id: string;
  name: string;
  type: "Warehouse" | "Parking" | "Godown" | "Land" | "Room";
  location: string;
  size: number; // in sq ft
  imageUrl: string;
  status: "Available" | "Leased";
  dataAiHint: string;
  leaseType?: "Short-term" | "Long-term";
  availability?: { from: string; to: string };
  geoLocation?: string;
  rent?: number;
  amenities?: string[];
};

export type Lease = {
  id: string;
  assetId: string;
  assetName: string;
  leaseHolder: string;
  status: "Active" | "Expired" | "Pending";
  monthlyRevenue: number;
};

export type Application = {
  id: string;
  assetId: string;
  assetName: string;
  assetType: "Warehouse" | "Parking" | "Godown" | "Land" | "Room";
  applicantName: string;
  applicantEmail: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedDate: string;
  creditScore: number;
  businessHistory: string;
  leaseValue: number;
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  capacity: number; // in cubic meters
  occupancy: number; // percentage
  healthStatus: 'Good' | 'Needs Checkup' | 'Maintenance Required';
  sensorData: string;
};

export type GoodsMovement = {
    id: string;
    warehouseId: string;
    type: 'Inbound' | 'Outbound';
    goods: string;
    quantity: number;
    timestamp: string;
};

export type Invoice = {
    id: string;
    assetName: string;
    amount: number;
    dueDate: string;
    status: 'Due' | 'Overdue';
}

export type Payment = {
    id: string;
    invoiceId: string;
    amount: number;
    date: string;
    method: 'UPI' | 'Netbanking' | 'Card';
    status: 'Successful' | 'Pending' | 'Failed';
}


export const assets: Asset[] = [
  {
    id: "WH001",
    name: "Mumbai CST Railway Warehouse",
    type: "Warehouse",
    location: "Mumbai, Maharashtra",
    size: 50000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "warehouse interior",
    leaseType: "Long-term",
    rent: 250000,
    amenities: ["Power Backup", "24/7 Security", "Loading Bay"],
    geoLocation: "18.9398, 72.8354",
  },
  {
    id: "PK002",
    name: "New Delhi Railway Parking Complex",
    type: "Parking",
    location: "New Delhi, Delhi",
    size: 25000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "parking lot",
    leaseType: "Short-term",
    rent: 50000,
    amenities: ["Covered Parking", "CCTV", "Security"],
    geoLocation: "28.6448, 77.2167",
  },
  {
    id: "GD003",
    name: "Howrah Station Godown",
    type: "Godown",
    location: "Kolkata, West Bengal",
    size: 75000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Leased",
    dataAiHint: "storage facility",
    leaseType: "Long-term",
    rent: 150000,
    amenities: ["Loading Dock", "Railway Siding"],
    geoLocation: "22.5986, 88.3425",
  },
  {
    id: "LN004",
    name: "Chennai Central Land Plot",
    type: "Land",
    location: "Chennai, Tamil Nadu",
    size: 120000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "land plot",
    leaseType: "Long-term",
    rent: 300000,
    amenities: ["Water Connection", "Fenced", "Railway Access"],
    geoLocation: "13.0827, 80.2707",
  },
  {
    id: "WH005",
    name: "Bengaluru City Railway Warehouse",
    type: "Warehouse",
    location: "Bengaluru, Karnataka",
    size: 60000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "logistics hub",
    leaseType: "Long-term",
    rent: 180000,
    amenities: ["Fire Safety", "Office Space", "Loading Bay"],
    geoLocation: "12.9784, 77.5689",
  },
  {
    id: "PK006",
    name: "Hyderabad Deccan Station Parking",
    type: "Parking",
    location: "Hyderabad, Telangana",
    size: 15000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Leased",
    dataAiHint: "train station",
    leaseType: "Short-term",
    rent: 45000,
    amenities: ["Valet Service", "24/7 Access"],
    geoLocation: "17.3850, 78.4867",
  },
  {
    id: "GD007",
    name: "Ahmedabad Junction Godown",
    type: "Godown",
    location: "Ahmedabad, Gujarat",
    size: 45000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "storage facility",
    leaseType: "Long-term",
    rent: 120000,
    amenities: ["Loading Dock", "Security", "Railway Siding"],
    geoLocation: "23.0225, 72.5714",
  },
  {
    id: "LN008",
    name: "Pune Junction Land Plot",
    type: "Land",
    location: "Pune, Maharashtra",
    size: 80000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "land plot",
    leaseType: "Long-term",
    rent: 200000,
    amenities: ["Water Connection", "Electricity", "Road Access"],
    geoLocation: "18.5204, 73.8567",
  },
  {
    id: "WH009",
    name: "Jaipur Junction Warehouse",
    type: "Warehouse",
    location: "Jaipur, Rajasthan",
    size: 55000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "warehouse interior",
    leaseType: "Long-term",
    rent: 160000,
    amenities: ["Power Backup", "Loading Bay", "Office Space"],
    geoLocation: "26.9124, 75.7873",
  },
  {
    id: "PK010",
    name: "Lucknow Junction Parking",
    type: "Parking",
    location: "Lucknow, Uttar Pradesh",
    size: 18000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "parking lot",
    leaseType: "Short-term",
    rent: 40000,
    amenities: ["CCTV", "Security", "Covered Area"],
    geoLocation: "26.8467, 80.9462",
  },
  {
    id: "GD011",
    name: "Kanpur Central Godown",
    type: "Godown",
    location: "Kanpur, Uttar Pradesh",
    size: 65000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "storage facility",
    leaseType: "Long-term",
    rent: 130000,
    amenities: ["Loading Dock", "Security", "Railway Siding"],
    geoLocation: "26.4499, 80.3319",
  },
  {
    id: "LN012",
    name: "Nagpur Junction Land Plot",
    type: "Land",
    location: "Nagpur, Maharashtra",
    size: 90000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "land plot",
    leaseType: "Long-term",
    rent: 180000,
    amenities: ["Water Connection", "Fenced", "Railway Access"],
    geoLocation: "21.1458, 79.0882",
  },
  {
    id: "WH013",
    name: "Bhopal Junction Warehouse",
    type: "Warehouse",
    location: "Bhopal, Madhya Pradesh",
    size: 48000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "warehouse interior",
    leaseType: "Long-term",
    rent: 140000,
    amenities: ["Power Backup", "Loading Bay", "Office Space"],
    geoLocation: "23.2599, 77.4126",
  },
  {
    id: "PK014",
    name: "Guwahati Station Parking",
    type: "Parking",
    location: "Guwahati, Assam",
    size: 12000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "parking lot",
    leaseType: "Short-term",
    rent: 35000,
    amenities: ["CCTV", "Security"],
    geoLocation: "26.1445, 91.7362",
  },
  {
    id: "GD015",
    name: "Kochi Railway Godown",
    type: "Godown",
    location: "Kochi, Kerala",
    size: 40000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "storage facility",
    leaseType: "Long-term",
    rent: 110000,
    amenities: ["Loading Dock", "Security"],
    geoLocation: "9.9312, 76.2673",
  },
  {
    id: "LN016",
    name: "Thiruvananthapuram Central Land",
    type: "Land",
    location: "Thiruvananthapuram, Kerala",
    size: 70000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "land plot",
    leaseType: "Long-term",
    rent: 160000,
    amenities: ["Water Connection", "Electricity", "Road Access"],
    geoLocation: "8.5241, 76.9366",
  },
  {
    id: "WH017",
    name: "Patna Junction Warehouse",
    type: "Warehouse",
    location: "Patna, Bihar",
    size: 52000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "warehouse interior",
    leaseType: "Long-term",
    rent: 130000,
    amenities: ["Power Backup", "Loading Bay"],
    geoLocation: "25.5941, 85.1376",
  },
  {
    id: "PK018",
    name: "Varanasi Junction Parking",
    type: "Parking",
    location: "Varanasi, Uttar Pradesh",
    size: 14000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "parking lot",
    leaseType: "Short-term",
    rent: 38000,
    amenities: ["CCTV", "Security"],
    geoLocation: "25.3176, 82.9739",
  },
  {
    id: "GD019",
    name: "Amritsar Junction Godown",
    type: "Godown",
    location: "Amritsar, Punjab",
    size: 38000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "storage facility",
    leaseType: "Long-term",
    rent: 95000,
    amenities: ["Loading Dock", "Security"],
    geoLocation: "31.6340, 74.8723",
  },
  {
    id: "LN020",
    name: "Srinagar Railway Land",
    type: "Land",
    location: "Srinagar, Jammu & Kashmir",
    size: 60000,
    imageUrl: "https://placehold.co/600x400.png",
    status: "Available",
    dataAiHint: "land plot",
    leaseType: "Long-term",
    rent: 140000,
    amenities: ["Water Connection", "Fenced"],
    geoLocation: "34.0837, 74.7973",
  }
];

export const leases: Lease[] = [
    { id: "L001", assetId: "GD003", assetName: "Eastern Zone Godown", leaseHolder: "Global Logistics Ltd.", status: "Active", monthlyRevenue: 150000 },
    { id: "L002", assetId: "PK006", assetName: "Station Side Parking", leaseHolder: "City Park Inc.", status: "Active", monthlyRevenue: 45000 },
    { id: "L003", assetId: "WH001", assetName: "Central Goods Warehouse", leaseHolder: "Mega Retail Corp", status: "Pending", monthlyRevenue: 250000 },
    { id: "L004", assetId: "LN004", assetName: "Industrial Land Plot", leaseHolder: "Future Industries", status: "Pending", monthlyRevenue: 300000 },
    { id: "L005", assetId: "WH002", assetName: "Southern Warehouse", leaseHolder: "Old Corp", status: "Expired", monthlyRevenue: 120000 },
];

export const applications: Application[] = [
    { id: "APP001", assetId: "WH001", assetName: "Central Goods Warehouse", assetType: "Warehouse", applicantName: "John Doe", applicantEmail: "john.d@example.com", status: "Pending", submittedDate: "2024-07-25", creditScore: 750, businessHistory: "5 years in logistics, no defaults.", leaseValue: 3000000 },
    { id: "APP002", assetId: "PK002", assetName: "Capital City Parking", assetType: "Parking", applicantName: "Jane Smith", applicantEmail: "jane.s@example.com", status: "Pending", submittedDate: "2024-07-26", creditScore: 680, businessHistory: "New business, 1 year of operation.", leaseValue: 600000 },
    { id: "APP003", assetId: "LN004", assetName: "Industrial Land Plot", assetType: "Land", applicantName: "Infra Corp", applicantEmail: "contact@infracorp.com", status: "Approved", submittedDate: "2024-07-20", creditScore: 820, businessHistory: "Established company, 20+ years, AAA rating.", leaseValue: 3600000 },
    { id: "APP004", assetId: "WH005", assetName: "Northern Logistics Hub", assetType: "Warehouse", applicantName: "Logistics Pro", applicantEmail: "apply@logisticspro.com", status: "Rejected", submittedDate: "2024-07-15", creditScore: 550, businessHistory: "Previous lease default reported.", leaseValue: 2160000 },
];


export const warehouses: Warehouse[] = [
    { id: 'WH001', name: 'Central Goods Warehouse', location: 'Mumbai, Maharashtra', capacity: 20000, occupancy: 75, healthStatus: 'Good', sensorData: 'Temp: 25C, Humidity: 60%, Vibration: 0.2g' },
    { id: 'WH005', name: 'Northern Logistics Hub', location: 'Ludhiana, Punjab', capacity: 30000, occupancy: 90, healthStatus: 'Needs Checkup', sensorData: 'Temp: 28C, Humidity: 65%, Vibration: 0.5g' },
    { id: 'WH007', name: 'Southern Cold Storage', location: 'Hyderabad, Telangana', capacity: 15000, occupancy: 60, healthStatus: 'Maintenance Required', sensorData: 'Temp: -18C, Humidity: 85%, Vibration: 1.1g' },
];

export const goodsMovements: GoodsMovement[] = [
    { id: 'GM001', warehouseId: 'WH001', type: 'Inbound', goods: 'Electronics', quantity: 500, timestamp: '2024-07-28 10:00:00' },
    { id: 'GM002', warehouseId: 'WH005', type: 'Outbound', goods: 'Textiles', quantity: 1200, timestamp: '2024-07-28 11:30:00' },
    { id: 'GM003', warehouseId: 'WH001', type: 'Inbound', goods: 'Machine Parts', quantity: 250, timestamp: '2024-07-27 15:00:00' },
    { id: 'GM004', warehouseId: 'WH007', type: 'Inbound', goods: 'Frozen Foods', quantity: 800, timestamp: '2024-07-27 09:00:00' },
    { id: 'GM005', warehouseId: 'WH005', type: 'Inbound', goods: 'Automotive Spares', quantity: 2000, timestamp: '2024-07-26 14:00:00' },
    { id: 'GM006', warehouseId: 'WH001', type: 'Outbound', goods: 'Electronics', quantity: 450, timestamp: '2024-07-26 18:00:00' },
]

export const leaseStatusData = [
  { name: "Approved", value: 400, fill: "var(--color-chart-1)" },
  { name: "Pending", value: 300, fill: "var(--color-chart-2)" },
  { name: "Rejected", value: 100, fill: "var(--color-destructive)" },
];

export const assetUtilizationData = [
  { type: "Warehouse", utilization: 85 },
  { type: "Parking", utilization: 60 },
  { type: "Godown", utilization: 75 },
  { type: "Land", utilization: 40 },
];

export const revenueData = [
  { month: "Jan", revenue: 4000000 },
  { month: "Feb", revenue: 3000000 },
  { month: "Mar", revenue: 5000000 },
  { month: "Apr", revenue: 4500000 },
  { month: "May", revenue: 6000000 },
  { month: "Jun", revenue: 5500000 },
];

export const invoices: Invoice[] = [
    { id: "INV001", assetName: "Central Goods Warehouse", amount: 250000, dueDate: "2024-08-01", status: "Due" },
    { id: "INV002", assetName: "Capital City Parking", amount: 50000, dueDate: "2024-08-05", status: "Due" },
    { id: "INV003", assetName: "Old Lease", amount: 120000, dueDate: "2024-07-01", status: "Overdue" },
];

export const payments: Payment[] = [
    { id: "PAY001", invoiceId: "INV000", amount: 150000, date: "2024-07-01", method: "Netbanking", status: "Successful" },
    { id: "PAY002", invoiceId: "INV-PREV1", amount: 45000, date: "2024-07-03", method: "Card", status: "Successful" },
    { id: "PAY003", invoiceId: "INV-PREV2", amount: 250000, date: "2024-07-01", method: "UPI", status: "Successful" },
    { id: "PAY004", invoiceId: "INV-PREV3", amount: 50000, date: "2024-07-05", method: "UPI", status: "Successful" },
];

