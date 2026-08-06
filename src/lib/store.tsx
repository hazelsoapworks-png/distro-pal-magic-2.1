import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { loadState, saveState } from "@/lib/persistence";

/* ---------------------------------- Types --------------------------------- */

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

export const PRODUCT_CATEGORIES: ProductCategory[] = ["Eye", "Face", "Lip", "Hair", "Nail Care"];

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

export type OrderLine = { productId: string; qty: number; price: number; dispatchedQty?: number };
export type OrderStatus = "pending" | "partial" | "dispatched" | "delivered";

export type Order = {
  id: string;
  shopId: string;
  shopName: string;
  beatName: string;
  lines: OrderLine[];
  total: number;
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

export type PurchaseBillLine = { productId: string; qty: number; price: number };
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

/* -------------------------------- Seed data ------------------------------- */
/* Written to local storage ONLY on first install (see lib/persistence.ts).    */

const seedProfile: Profile = {
  name: "Rahul Sharma",
  role: "Senior Sales Executive",
  zone: "North Zone - Beat Sector 4",
  online: true,
  phone: "+91 98200 45678",
  address: "Flat 402, Shanti Residency, Pune 411001",
};

const seedBeats: Beat[] = [
  { id: "rambagh", name: "Rambagh", area: "Central District - Zone A", location: "Central District", salesToday: 4500 },
  { id: "city-center", name: "City Center", area: "Downtown Metro Hub", location: "Downtown", salesToday: 0 },
  { id: "commercial-hub", name: "Commercial Hub", area: "Trade Tower Complex", location: "Trade Tower", salesToday: 0 },
  { id: "station-road", name: "Station Road", area: "East Transit Line", location: "East Transit", salesToday: 0 },
  { id: "gandhi-nagar", name: "Gandhi Nagar", area: "West Residential Belt", location: "West Belt", salesToday: 0 },
  { id: "market-yard", name: "Market Yard", area: "South Wholesale Zone", location: "South Zone", salesToday: 0 },
];

const seedShops: Shop[] = [
  { id: "s1", beatId: "rambagh", name: "Sharma Kirana Store", owner: "Ramesh Sharma", phone: "+91 98765 12345", address: "Shop 14, Main Bazaar, Rambagh", dues: 14500, status: "pending" },
  { id: "s2", beatId: "rambagh", name: "Gupta Provision Hub", owner: "Suresh Gupta", phone: "+91 98123 45678", address: "45 Station Road, Rambagh", dues: 8200, status: "ordered", orderAmount: 4500 },
  { id: "s3", beatId: "rambagh", name: "Verma General Store", owner: "Anil Varma", phone: "+91 99887 76655", address: "Mall Road, Rambagh", dues: 17000, status: "paid", paidAmount: 5000 },
  { id: "s4", beatId: "rambagh", name: "Royal Traders", owner: "Vikram Singh", phone: "+91 97654 32109", address: "Sector 3 Market, Rambagh", dues: 5400, status: "pending" },
  { id: "s5", beatId: "city-center", name: "Apex Supermarket", owner: "Neha Jain", phone: "+91 90000 11111", address: "MG Road, City Center", dues: 22000, status: "pending" },
  { id: "s6", beatId: "city-center", name: "Metro Cash & Carry", owner: "Rohit Mehta", phone: "+91 90000 22222", address: "Metro Plaza, City Center", dues: 18000, status: "pending" },
  { id: "s7", beatId: "city-center", name: "Star Bazaar", owner: "Kavya Rao", phone: "+91 90000 33333", address: "Ring Road, City Center", dues: 14000, status: "pending" },
  { id: "s8", beatId: "commercial-hub", name: "Prime Wholesale", owner: "Amit Shah", phone: "+91 90000 44444", address: "Tower A, Commercial Hub", dues: 30000, status: "pending" },
  { id: "s9", beatId: "commercial-hub", name: "Unity Distributors", owner: "Sana Khan", phone: "+91 90000 55555", address: "Tower C, Commercial Hub", dues: 27000, status: "pending" },
  { id: "s10", beatId: "station-road", name: "Transit Mart", owner: "Deepak Nair", phone: "+91 90000 66666", address: "Platform Lane, Station Road", dues: 9100, status: "pending" },
  { id: "s11", beatId: "station-road", name: "Junction Stores", owner: "Priya Das", phone: "+91 90000 77777", address: "Exit Gate, Station Road", dues: 7000, status: "pending" },
];

const seedProducts: Product[] = [
  { id: "p1", name: "Cooking Oil 1L", code: "PRD-001", buyingPrice: 120, sellingPrice: 145, unit: "Pcs", openingStock: 80, lowStockThreshold: 20 },
  { id: "p2", name: "Tea 500g", code: "PRD-002", buyingPrice: 210, sellingPrice: 260, unit: "Pack", openingStock: 45, lowStockThreshold: 15 },
  { id: "p3", name: "Wheat Flour 10kg", code: "PRD-003", buyingPrice: 340, sellingPrice: 399, unit: "Pack", openingStock: 12, lowStockThreshold: 15 },
  { id: "p4", name: "Basmati Rice 5kg", code: "PRD-004", buyingPrice: 480, sellingPrice: 560, unit: "Pack", openingStock: 25, lowStockThreshold: 10 },
  { id: "p5", name: "Sugar 1kg", code: "PRD-005", buyingPrice: 42, sellingPrice: 52, unit: "Pcs", openingStock: 0, lowStockThreshold: 20 },
  { id: "p6", name: "Detergent 1kg", code: "PRD-006", buyingPrice: 95, sellingPrice: 120, unit: "Pack", openingStock: 60, lowStockThreshold: 20 },
];

const seedTransactions: Transaction[] = [
  { id: "t1", type: "order", title: "Order: Gupta Provision Hub", subtitle: "Rambagh • 10x Cooking Oil 1L, 5x Tea 500g, 2x Flour 10kg", amount: 4500, time: "10:15 AM" },
  { id: "t2", type: "collection", title: "Collection: Apex Supermarket", subtitle: "Mode: UPI • Ref: RCP-88902", amount: 5000, time: "11:30 AM" },
];

const seedOrders: Order[] = [
  {
    id: "o-seed-1",
    shopId: "s2",
    shopName: "Gupta Provision Hub",
    beatName: "Rambagh",
    lines: [
      { productId: "p1", qty: 10, price: 145 },
      { productId: "p2", qty: 5, price: 260 },
      { productId: "p3", qty: 2, price: 399 },
    ],
    total: 4500,
    summary: "10x Cooking Oil 1L, 5x Tea 500g, 2x Wheat Flour 10kg",
    status: "pending",
    createdAt: "2026-01-01T04:45:00.000Z",
  },
];

/** Baseline written on first install only. */
function buildDefaults() {
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

/* ------------------------------ Context shape ----------------------------- */

type StoreValue = {
  activeTab: TabId;
  current: ScreenEntry;
  canGoBack: boolean;
  navigate: (name: ScreenName, params?: Record<string, string>) => void;
  goBack: () => boolean;
  switchTab: (tab: TabId) => void;

  hydrated: boolean;
  profile: Profile;
  dailyTarget: number;
  achievedToday: number;
  beats: Beat[];
  shops: Shop[];
  products: Product[];
  transactions: Transaction[];
  orders: Order[];
  purchaseBills: PurchaseBill[];
  stockMovements: StockMovement[];
  dispatches: DispatchRecord[];
  syncEnabled: boolean;

  shopsForBeat: (beatId: string) => Shop[];
  duesForBeat: (beatId: string) => number;
  totalOutstanding: number;
  totalShops: number;

  stockFor: (productId: string) => StockLevels;
  pendingOrders: Order[];

  setSyncEnabled: (v: boolean) => void;
  setDailyTarget: (v: number) => void;
  updateProfile: (patch: Partial<Pick<Profile, "name" | "phone" | "address">>) => void;
  addBeat: (name: string, area: string) => void;
  renameBeat: (beatId: string, name: string) => void;
  addShop: (beatId: string, shop: Omit<Shop, "id" | "beatId" | "status">) => void;
  deleteShop: (shopId: string) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  placeOrder: (shopId: string, lines: OrderLine[], beatName: string) => void;
  markOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmDispatch: (
    orderId: string,
    input: { executive: string; vehicle: string; quantities: Record<string, number> },
  ) => string | undefined;
  addPurchaseBill: (bill: Omit<PurchaseBill, "id" | "createdAt" | "total">) => void;
  collectPayment: (shopId: string, amount: number, mode: string) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const TAB_SCREENS: TabId[] = ["home", "beat", "accounts", "reports", "more"];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<ScreenEntry[]>([{ name: "home" }]);
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const initial = useRef(buildDefaults()).current;

  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<Profile>(initial.profile);
  const [dailyTarget, setDailyTarget] = useState(initial.dailyTarget);
  const [beats, setBeats] = useState<Beat[]>(initial.beats);
  const [shops, setShops] = useState<Shop[]>(initial.shops);
  const [products, setProducts] = useState<Product[]>(initial.products);
  const [transactions, setTransactions] = useState<Transaction[]>(initial.transactions);
  const [orders, setOrders] = useState<Order[]>(initial.orders);
  const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>(initial.purchaseBills);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initial.stockMovements);
  const [dispatches, setDispatches] = useState<DispatchRecord[]>(initial.dispatches);
  const [syncEnabled, setSyncEnabled] = useState(initial.syncEnabled);

  /* ---- Hydrate from device storage once, after mount (SSR-safe) ---- */
  useEffect(() => {
    const s = loadState(buildDefaults());
    setProfile(s.profile);
    setDailyTarget(s.dailyTarget);
    setBeats(s.beats);
    setShops(s.shops);
    setProducts(s.products);
    setTransactions(s.transactions);
    setOrders(s.orders);
    setPurchaseBills(s.purchaseBills);
    setStockMovements(s.stockMovements);
    setDispatches(s.dispatches);
    setSyncEnabled(s.syncEnabled);
    setHydrated(true);
  }, []);

  /* ---- Persist every change (never before hydration, so demo data
          can't overwrite what the user already has stored) ---- */
  useEffect(() => {
    if (!hydrated) return;
    saveState({
      profile,
      dailyTarget,
      beats,
      shops,
      products,
      transactions,
      orders,
      purchaseBills,
      stockMovements,
      dispatches,
      syncEnabled,
    });
  }, [
    hydrated,
    profile,
    dailyTarget,
    beats,
    shops,
    products,
    transactions,
    orders,
    purchaseBills,
    stockMovements,
    dispatches,
    syncEnabled,
  ]);

  /* ------------------------------ Navigation ------------------------------ */

  const navigate = useCallback<StoreValue["navigate"]>((name, params) => {
    setStack((prev) => {
      const top = prev[prev.length - 1];
      if (top.name === name && JSON.stringify(top.params ?? {}) === JSON.stringify(params ?? {})) {
        return prev;
      }
      if (TAB_SCREENS.includes(name as TabId)) {
        setActiveTab(name as TabId);
        return [{ name, params }];
      }
      return [...prev, { name, params }];
    });
  }, []);

  /** Returns true when a screen was popped, false when already at the root. */
  const goBack = useCallback<StoreValue["goBack"]>(() => {
    let popped = false;
    setStack((prev) => {
      if (prev.length <= 1) return prev;
      popped = true;
      const next = prev.slice(0, -1);
      const top = next[next.length - 1];
      if (TAB_SCREENS.includes(top.name as TabId)) setActiveTab(top.name as TabId);
      return next;
    });
    return popped || stack.length > 1;
  }, [stack.length]);

  const switchTab = useCallback<StoreValue["switchTab"]>((tab) => {
    setActiveTab(tab);
    setStack([{ name: tab }]);
  }, []);

  const value = useMemo<StoreValue>(() => {
    const shopsForBeat = (beatId: string) => shops.filter((s) => s.beatId === beatId);
    const duesForBeat = (beatId: string) =>
      shopsForBeat(beatId).reduce((sum, s) => sum + s.dues, 0);
    const totalOutstanding = shops.reduce((sum, s) => sum + s.dues, 0);
    const achievedToday = beats.reduce((sum, b) => sum + b.salesToday, 0);

    const stockFor = (productId: string): StockLevels => {
      const p = products.find((x) => x.id === productId);
      const opening = p?.openingStock ?? 0;
      const threshold = p?.lowStockThreshold ?? 0;
      const inward = stockMovements
        .filter((m) => m.productId === productId && m.type === "inward")
        .reduce((s, m) => s + m.qty, 0);
      const outward = stockMovements
        .filter((m) => m.productId === productId && m.type === "outward")
        .reduce((s, m) => s + m.qty, 0);
      const physical = opening + inward - outward;
      const reserved = orders
        .filter((o) => o.status !== "delivered")
        .flatMap((o) => o.lines)
        .filter((l) => l.productId === productId)
        .reduce((s, l) => s + Math.max(0, l.qty - (l.dispatchedQty ?? 0)), 0);
      const available = Math.max(0, physical - reserved);
      const status: StockLevels["status"] =
        physical <= 0 ? "out" : available <= threshold ? "low" : "in";
      return { physical, reserved, available, status };
    };

    const pendingOrders = orders.filter((o) => o.status !== "delivered");

    const nowTime = () =>
      new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return {
      activeTab,
      current: stack[stack.length - 1],
      canGoBack: stack.length > 1,
      navigate,
      goBack,
      switchTab,

      hydrated,
      profile,
      dailyTarget,
      achievedToday,
      beats,
      shops,
      products,
      transactions,
      orders,
      purchaseBills,
      stockMovements,
      dispatches,
      syncEnabled,

      shopsForBeat,
      duesForBeat,
      totalOutstanding,
      totalShops: shops.length,
      stockFor,
      pendingOrders,

      setSyncEnabled,
      setDailyTarget,
      updateProfile: (patch) => setProfile((prev) => ({ ...prev, ...patch })),
      addBeat: (name, area) =>
        setBeats((prev) => [
          ...prev,
          { id: `beat-${Date.now()}`, name, area, location: area, salesToday: 0 },
        ]),
      renameBeat: (beatId, name) =>
        setBeats((prev) => prev.map((b) => (b.id === beatId ? { ...b, name } : b))),
      addShop: (beatId, shop) =>
        setShops((prev) => [
          ...prev,
          { ...shop, id: `shop-${Date.now()}`, beatId, status: "pending" },
        ]),
      deleteShop: (shopId) => setShops((prev) => prev.filter((s) => s.id !== shopId)),
      addProduct: (p) =>
        setProducts((prev) => [...prev, { ...p, id: `prod-${Date.now()}` }]),
      updateProduct: (p) =>
        setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x))),
      deleteProduct: (id) => setProducts((prev) => prev.filter((p) => p.id !== id)),

      placeOrder: (shopId, lines, beatName) => {
        const shop = shops.find((s) => s.id === shopId);
        if (!shop || lines.length === 0) return;
        const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
        const summary = lines
          .map((l) => {
            const p = products.find((x) => x.id === l.productId);
            return `${l.qty}x ${p?.name ?? "Item"}`;
          })
          .join(", ");
        const order: Order = {
          id: `ord-${Date.now()}`,
          shopId,
          shopName: shop.name,
          beatName,
          lines,
          total,
          summary,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        setOrders((prev) => [order, ...prev]);
        setShops((prev) =>
          prev.map((s) =>
            s.id === shopId ? { ...s, status: "ordered", orderAmount: total } : s,
          ),
        );
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            type: "order",
            title: `Order: ${shop.name}`,
            subtitle: `${beatName} • ${summary}`,
            amount: total,
            time: nowTime(),
          },
          ...prev,
        ]);
        setBeats((prev) =>
          prev.map((b) => (b.name === beatName ? { ...b, salesToday: b.salesToday + total } : b)),
        );
      },

      markOrderStatus: (orderId, status) => {
        setOrders((prev) => {
          const target = prev.find((o) => o.id === orderId);
          if (!target) return prev;
          if (status === "delivered" && target.status !== "delivered") {
            const at = new Date().toISOString();
            const movements: StockMovement[] = target.lines
              .map((l, i) => ({
                id: `mv-${Date.now()}-${i}`,
                type: "outward" as const,
                productId: l.productId,
                // dispatched quantities already left the godown at dispatch time
                qty: Math.max(0, l.qty - (l.dispatchedQty ?? 0)),
                note: `Delivered to ${target.shopName}`,
                at,
              }))
              .filter((m) => m.qty > 0);
            if (movements.length > 0) setStockMovements((m) => [...movements, ...m]);
            return prev.map((o) =>
              o.id === orderId ? { ...o, status: "delivered", deliveredAt: at } : o,
            );
          }
          return prev.map((o) => (o.id === orderId ? { ...o, status } : o));
        });
      },

      confirmDispatch: (orderId, input) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return undefined;

        const at = new Date().toISOString();
        const dispatchId = `dsp-${Date.now()}`;
        const backOrderId = `ord-bo-${Date.now()}`;

        const lines: DispatchLine[] = order.lines.map((l) => {
          const already = l.dispatchedQty ?? 0;
          const pendingQty = Math.max(0, l.qty - already);
          const dispatchedQty = Math.max(0, Math.min(pendingQty, Math.floor(input.quantities[l.productId] ?? 0)));
          return {
            productId: l.productId,
            orderedQty: pendingQty,
            dispatchedQty,
            remainingQty: pendingQty - dispatchedQty,
            price: l.price,
          };
        });

        const totalDispatched = lines.reduce((s, l) => s + l.dispatchedQty, 0);
        if (totalDispatched <= 0) return undefined;

        const remainingLines = lines.filter((l) => l.remainingQty > 0);
        const subTotal = lines.reduce((s, l) => s + l.dispatchedQty * l.price, 0);
        const tax = Math.round(subTotal * TAX_RATE * 100) / 100;
        const grandTotal = subTotal + tax;
        const fully = remainingLines.length === 0;

        const record: DispatchRecord = {
          id: dispatchId,
          orderId,
          shopId: order.shopId,
          shopName: order.shopName,
          beatName: order.beatName,
          executive: input.executive || profile.name,
          vehicle: input.vehicle || "—",
          invoiceNumber: `INV-${new Date().getFullYear()}-${String(dispatches.length + 1).padStart(4, "0")}`,
          at,
          lines,
          subTotal,
          tax,
          grandTotal,
          status: fully ? "Fully Dispatched" : "Partially Dispatched",
          backOrderId: fully ? undefined : backOrderId,
        };
        setDispatches((prev) => [record, ...prev]);

        const movements: StockMovement[] = lines
          .filter((l) => l.dispatchedQty > 0)
          .map((l, i) => ({
            id: `mv-${Date.now()}-${i}`,
            type: "outward" as const,
            productId: l.productId,
            qty: l.dispatchedQty,
            note: `Dispatched to ${order.shopName} • ${record.invoiceNumber}`,
            at,
          }));
        setStockMovements((m) => [...movements, ...m]);

        setOrders((prev) => {
          const next = prev.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              status: (fully ? "dispatched" : "partial") as OrderStatus,
              dispatchIds: [...(o.dispatchIds ?? []), dispatchId],
              lines: o.lines.map((l) => {
                const d = lines.find((x) => x.productId === l.productId);
                return d ? { ...l, dispatchedQty: (l.dispatchedQty ?? 0) + d.dispatchedQty } : l;
              }),
            };
          });

          if (fully) return next;

          const boLines: OrderLine[] = remainingLines.map((l) => ({
            productId: l.productId,
            qty: l.remainingQty,
            price: l.price,
          }));
          const boSummary = boLines
            .map((l) => `${l.qty}x ${products.find((p) => p.id === l.productId)?.name ?? "Item"}`)
            .join(", ");
          const backOrder: Order = {
            id: backOrderId,
            shopId: order.shopId,
            shopName: order.shopName,
            beatName: order.beatName,
            lines: boLines,
            total: boLines.reduce((s, l) => s + l.qty * l.price, 0),
            summary: boSummary,
            status: "pending",
            createdAt: at,
            backOrderOf: orderId,
          };
          return [backOrder, ...next];
        });

        return dispatchId;
      },

      addPurchaseBill: (bill) => {
        const id = `pb-${Date.now()}`;
        const createdAt = new Date().toISOString();
        const total = bill.lines.reduce((s, l) => s + l.qty * l.price, 0);
        setPurchaseBills((prev) => [{ ...bill, id, createdAt, total }, ...prev]);
        const movements: StockMovement[] = bill.lines.map((l, i) => ({
          id: `mv-${Date.now()}-${i}`,
          type: "inward",
          productId: l.productId,
          qty: l.qty,
          note: `Received from ${bill.supplier} • ${bill.invoiceNumber}`,
          at: createdAt,
        }));
        setStockMovements((m) => [...movements, ...m]);
      },

      collectPayment: (shopId, amount, mode) => {
        setShops((prev) =>
          prev.map((s) =>
            s.id === shopId
              ? { ...s, dues: Math.max(0, s.dues - amount), status: "paid", paidAmount: amount }
              : s,
          ),
        );
        const shop = shops.find((s) => s.id === shopId);
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            type: "collection",
            title: `Collection: ${shop?.name ?? "Shop"}`,
            subtitle: `Mode: ${mode} • Ref: RCP-${Math.floor(10000 + Math.random() * 89999)}`,
            amount,
            time: nowTime(),
          },
          ...prev,
        ]);
      },
    };
  }, [
    stack,
    activeTab,
    navigate,
    goBack,
    switchTab,
    hydrated,
    profile,
    dailyTarget,
    beats,
    shops,
    products,
    transactions,
    orders,
    purchaseBills,
    stockMovements,
    dispatches,
    syncEnabled,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
