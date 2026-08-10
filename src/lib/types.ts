export type TabId = "home" | "beat" | "accounts" | "reports" | "more";

export type ScreenName =
  | "home"
  | "beat"
  | "accounts"
  | "reports"
  | "more"
  | "beatDetail"
  | "products"
  | "orderBooking"
  | "duesLedger"
  | "inventory"
  | "purchaseBill"
  | "pendingOrders"
  | "dispatch"
  | "invoice"
  | "dispatchHistory";

export type ScreenEntry = {
  name: ScreenName;
  params?: Record<string, string>;
};

export type ShopStatus = "pending" | "ordered" | "paid";

export type Shop = {
  id: string;
  beatId: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
  dues: number;
  status: ShopStatus;
  orderAmount?: number;
  paidAmount?: number;
  lastSellingPrices?: Record<string, number>;
};

export type Beat = {
  id: string;
  name: string;
  area: string;
  location: string;
  salesToday: number;
};

export type ProductCategory = "Eye" | "Face" | "Lip" | "Hair" | "Nail Care";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Eye",
  "Face",
  "Lip",
  "Hair",
  "Nail Care",
];

export const PRODUCT_UNITS = ["Pcs", "Box", "Set", "Pack"] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number] | string;

export type Product = {
  id: string;
  name: string;
  code: string;
  buyingPrice: number;
  sellingPrice: number;
  unit: string;
  imageUrl?: string;
  category?: ProductCategory;
  hasVariants?: boolean;
  shades?: string[];
  openingStock: number;
  lowStockThreshold: number;
};

export type Transaction = {
  id: string;
  type: "order" | "collection";
  title: string;
  subtitle: string;
  amount: number;
  time: string;
};

export type OrderLineStatus = "pending" | "delivered" | "cancelled" | "backordered";

export type OrderLine = {
  productId: string;
  qty: number;
  price: number; // Selling Price
  buyingPrice?: number; // Margin track karne ke liye
  dispatchedQty?: number;
  status?: OrderLineStatus;
};

export type OrderStatus = "pending" | "partial" | "dispatched" | "delivered" | "cancelled";

export type Order = {
  id: string;
  shopId: string;
  shopName: string;
  beatName: string;
  lines: OrderLine[];
  total: number;
  totalMargin?: number; // Is order par total profit
  summary: string;
  status: OrderStatus;
  createdAt: string;
  deliveredAt?: string;
  backOrderOf?: string;
  dispatchIds?: string[];
};

export type DispatchLine = {
  productId: string;
  orderedQty: number;
  dispatchedQty: number;
  remainingQty: number;
  price: number;
};

export type DispatchRecord = {
  id: string;
  orderId: string;
  shopId: string;
  shopName: string;
  beatName: string;
  executive: string;
  vehicle: string;
  invoiceNumber: string;
  at: string;
  lines: DispatchLine[];
  subTotal: number;
  tax: number;
  grandTotal: number;
  status: "Fully Dispatched" | "Partially Dispatched";
  backOrderId?: string;
};

export const TAX_RATE = 0.18;

export const DISTRIBUTOR = {
  name: "SalesBeat Distributors Pvt. Ltd.",
  gstin: "27AABCS1429B1ZX",
  address: "Warehouse 12, Industrial Estate, Pune 411019",
};

export type PurchaseBillLine = {
  productId: string;
  qty: number;
  price: number;
};

export type PurchaseBill = {
  id: string;
  supplier: string;
  invoiceNumber: string;
  invoiceDate: string;
  lines: PurchaseBillLine[];
  total: number;
  createdAt: string;
};

export type StockMovement = {
  id: string;
  type: "inward" | "outward";
  productId: string;
  qty: number;
  note: string;
  at: string;
};

export type StockLevels = {
  physical: number;
  reserved: number;
  available: number;
  status: "in" | "low" | "out";
};

export type Profile = {
  name: string;
  role: string;
  zone: string;
  online: boolean;
  phone: string;
  address: string;
};

export type PersistedState = {
  profile: Profile;
  dailyTarget: number;
  beats: Beat[];
  shops: Shop[];
  products: Product[];
  transactions: Transaction[];
  orders: Order[];
  purchaseBills: PurchaseBill[];
  stockMovements: StockMovement[];
  dispatches: DispatchRecord[];
  syncEnabled: boolean;
};
