import type {
  Beat,
  DispatchRecord,
  Order,
  PersistedState,
  Product,
  Profile,
  PurchaseBill,
  Shop,
  StockMovement,
  Transaction,
} from "@/lib/types";

const seedProfile: Profile = {
  name: "Rahul Sharma",
  role: "Senior Sales Executive",
  zone: "North Zone - Beat Sector 4",
  online: true,
  phone: "+91 98200 45678",
  address: "Flat 402, Shanti Residency, Pune 411001",
};

const seedBeats: Beat[] = [
  {
    id: "rambagh",
    name: "Rambagh",
    area: "Central District - Zone A",
    location: "Central District",
    salesToday: 4500,
  },
  {
    id: "city-center",
    name: "City Center",
    area: "Downtown Metro Hub",
    location: "Downtown",
    salesToday: 0,
  },
  {
    id: "commercial-hub",
    name: "Commercial Hub",
    area: "Trade Tower Complex",
    location: "Trade Tower",
    salesToday: 0,
  },
  {
    id: "station-road",
    name: "Station Road",
    area: "East Transit Line",
    location: "East Transit",
    salesToday: 0,
  },
  {
    id: "gandhi-nagar",
    name: "Gandhi Nagar",
    area: "West Residential Belt",
    location: "West Belt",
    salesToday: 0,
  },
  {
    id: "market-yard",
    name: "Market Yard",
    area: "South Wholesale Zone",
    location: "South Zone",
    salesToday: 0,
  },
];

const seedShops: Shop[] = [
  {
    id: "s1",
    beatId: "rambagh",
    name: "Sharma Kirana Store",
    owner: "Ramesh Sharma",
    phone: "+91 98765 12345",
    address: "Shop 14, Main Bazaar, Rambagh",
    dues: 14500,
    status: "pending",
  },
  {
    id: "s2",
    beatId: "rambagh",
    name: "Gupta Provision Hub",
    o
