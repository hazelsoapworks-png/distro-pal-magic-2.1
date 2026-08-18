import type {
  Beat,
  DispatchRecord,
  Order,
  PersistedState,
  Profile,
  PurchaseBill,
  StockMovement,
  Transaction,
} from "@/lib/types";

import { seedProducts } from "./products";
import { seedShops } from "./shops";

export { seedProducts, seedShops };

const seedProfile: Profile = {
  name: "Manish Mehta",
  companyName: "SalesBeat Distributors",
  role: "Distributor",
  zone: "Amritsar Sector",
  online: true,
  phone: "",
  address: "Amritsar, Punjab",
  gstin: "07AABCS1429B1ZX",
};

const seedBeats: Beat[] = [
  { id: "rambagh", name: "Rambagh", area: "Central District - Zone A", location: "Central District", salesToday: 0 },
  { id: "city-center", name: "City Center", area: "Downtown Metro Hub", location: "Downtown", salesToday: 0 },
  { id: "commercial-hub", name: "Commercial Hub", area: "Trade Tower Complex", location: "Trade Tower", salesToday: 0 },
  { id: "station-road", name: "Station Road", area: "East Transit Line", location: "East Transit", salesToday: 0 },
  { id: "gandhi-nagar", name: "Gandhi Nagar", area: "West Residential Belt", location: "West Belt", salesToday: 0 },
  { id: "market-yard", name: "Market Yard", area: "South Wholesale Zone", location: "South Zone", salesToday: 0 },
];

const seedTransactions: Transaction[] = [];

const seedOrders: Order[] = [];

export function buildDefaults(): PersistedState {
  return {
    profile: seedProfile,
    dailyTarget: 60000,
    beats: seedBeats,
    shops: seedShops,       
    products: seedProducts, 
    transactions: seedTransactions,
    orders: seedOrders,
    purchaseBills: [] as PurchaseBill[],
    stockMovements: [] as StockMovement[],
    dispatches: [] as DispatchRecord[],
    syncEnabled: true,
  };
}