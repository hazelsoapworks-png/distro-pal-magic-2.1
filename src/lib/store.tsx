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
import { buildDefaults } from "@/lib/seed";
import {
  goBackStack,
  initialNavigationStack,
  isTabScreen,
  navigateStack,
} from "@/lib/navigation";
import { updateProfile, type EditableProfileFields } from "@/lib/modules/profile";
import {
  addBeatSales,
  createBeat,
  renameBeat,
  deleteBeat,
} from "@/lib/modules/beats";
import {
  applyCollectionToShop,
  applyOrderToShop,
  createShop,
  duesForBeat,
  shopsForBeat,
  totalOutstanding,
  type NewShop,
} from "@/lib/modules/shops";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type NewProduct,
} from "@/lib/modules/products";
import {
  createOrder,
  deliverOrder,
  latestSellingPrices,
  pendingOrders,
  setOrderStatus,
} from "@/lib/modules/orders";
import { createDispatch, type DispatchInput } from "@/lib/modules/dispatch";
import {
  createPurchaseBill,
  type NewPurchaseBill,
} from "@/lib/modules/purchase";
import { stockForProduct } from "@/lib/modules/inventory";
import { achievedToday } from "@/lib/modules/reports";
import type {
  Beat,
  DispatchRecord,
  Order,
  OrderLine,
  OrderStatus,
  Product,
  Profile,
  PurchaseBill,
  ScreenEntry,
  ScreenName,
  Shop,
  StockLevels,
  StockMovement,
  TabId,
  Transaction,
} from "@/lib/types";

export * from "@/lib/types";

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
  
  googleEmail: string;
  setGoogleEmail: (email: string) => void;

  shopsForBeat: (beatId: string) => Shop[];
  duesForBeat: (beatId: string) => number;
  totalOutstanding: number;
  totalShops: number;

  stockFor: (productId: string) => StockLevels;
  pendingOrders: Order[];

  setSyncEnabled: (value: boolean) => void;
  setDailyTarget: (value: number) => void;
  updateProfile: (patch: Partial<EditableProfileFields>) => void;
  addBeat: (name: string, area: string) => void;
  renameBeat: (beatId: string, name: string) => void;
  deleteBeat: (beatId: string) => void;
  addShop: (beatId: string, shop: NewShop) => void;
  deleteShop: (shopId: string) => void;
  addProduct: (product: NewProduct) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  placeOrder: (
    shopId: string,
    lines: OrderLine[],
    beatName: string,
  ) => void;
  markOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmDispatch: (
    orderId: string,
    input: DispatchInput,
  ) => string | undefined;
  addPurchaseBill: (bill: NewPurchaseBill) => void;
  collectPayment: (shopId: string, amount: number, mode: string) => void;
  
  // New functions for Universal Edit/Cancel
  cancelOrder: (orderId: string) => void;
  updateOrderLines: (orderId: string, updatedLines: OrderLine[]) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

function currentTime(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useRef(buildDefaults()).current;

  const [stack, setStack] = useState<ScreenEntry[]>(
    initialNavigationStack(),
  );
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [hydrated, setHydrated] = useState(false);

  const [profile, setProfile] = useState<Profile>(initial.profile);
  const [dailyTarget, setDailyTarget] = useState(initial.dailyTarget);
  const [beats, setBeats] = useState<Beat[]>(initial.beats);
  const [shops, setShops] = useState<Shop[]>(initial.shops);
  const [products, setProducts] = useState<Product[]>(initial.products);
  const [transactions, setTransactions] = useState<Transaction[]>(
    initial.transactions,
  );
  const [orders, setOrders] = useState<Order[]>(initial.orders);
  const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>(
    initial.purchaseBills,
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(
    initial.stockMovements,
  );
  const [dispatches, setDispatches] = useState<DispatchRecord[]>(
    initial.dispatches,
  );
  const [syncEnabled, setSyncEnabled] = useState(initial.syncEnabled);

  const [googleEmail, setGoogleEmail] = useState("");

  useEffect(() => {
    // 1. अब loadState Async हो गया है, इसलिए then() का इस्तेमाल किया है
    loadState(buildDefaults()).then((state) => {
      setProfile(state.profile);
      setDailyTarget(state.dailyTarget);
      setBeats(state.beats);
      setShops(state.shops);
      setProducts(state.products);
      setTransactions(state.transactions);
      setOrders(state.orders);
      setPurchaseBills(state.purchaseBills);
      setStockMovements(state.stockMovements);
      setDispatches(state.dispatches);
      setSyncEnabled(state.syncEnabled);
      setGoogleEmail(state.googleEmail ?? "");
      setHydrated(true);
    });
  }, []);

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
      googleEmail
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
    googleEmail
  ]);

  const navigate = useCallback<StoreValue["navigate"]>((name, params) => {
    const destination = { name, params };
    setStack((previous) => navigateStack(previous, destination));
    if (isTabScreen(name)) {
      setActiveTab(name);
    }
  }, []);

  const goBack = useCallback<StoreValue["goBack"]>(() => {
    if (stack.length <= 1) {
      return false;
    }
    const nextStack = goBackStack(stack);
    const nextScreen = nextStack[nextStack.length - 1];
    setStack(nextStack);
    if (isTabScreen(nextScreen.name)) {
      setActiveTab(nextScreen.name);
    }
    return true;
  }, [stack]);

  const switchTab = useCallback<StoreValue["switchTab"]>((tab) => {
    setActiveTab(tab);
    setStack([{ name: tab }]);
  }, []);

  const value = useMemo<StoreValue>(() => {
    const addTransaction = (
      transaction: Omit<Transaction, "id" | "time">,
    ) => {
      setTransactions((previous) => [
        {
          ...transaction,
          id: createId("tx"),
          time: currentTime(),
        },
        ...previous,
      ]);
    };

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
      achievedToday: achievedToday(beats),
      beats,
      shops,
      products,
      transactions,
      orders,
      purchaseBills,
      stockMovements,
      dispatches,
      syncEnabled,
      googleEmail,
      setGoogleEmail,

      shopsForBeat: (beatId) => shopsForBeat(shops, beatId),
      duesForBeat: (beatId) => duesForBeat(shops, beatId),
      totalOutstanding: totalOutstanding(shops),
      totalShops: shops.length,

      stockFor: (productId) =>
        stockForProduct(productId, products, orders, stockMovements),
      pendingOrders: pendingOrders(orders),

      setSyncEnabled,
      setDailyTarget,

      updateProfile: (patch) => {
        setProfile((previous) => updateProfile(previous, patch));
      },

      addBeat: (name, area) => {
        setBeats((previous) => [
          ...previous,
          createBeat(createId("beat"), name, area),
        ]);
      },

      renameBeat: (beatId, name) => {
        setBeats((previous) => renameBeat(previous, beatId, name));
      },
     
      deleteBeat: (beatId) => {
        setBeats((previous) => deleteBeat(previous, beatId));
        setShops((previous) =>
          previous.filter((shop) => shop.beatId !== beatId),
        );
      },
   
      addShop: (beatId, shop) => {
        setShops((previous) => [
          ...previous,
          createShop(createId("shop"), beatId, shop),
        ]);
      },

      deleteShop: (shopId) => {
        setShops((previous) =>
          previous.filter((shop) => shop.id !== shopId),
        );
      },

      addProduct: (product) => {
        setProducts((previous) => [
          ...previous,
          createProduct(createId("prod"), product),
        ]);
      },

      updateProduct: (product) => {
        setProducts((previous) => updateProduct(previous, product));
      },

      deleteProduct: (productId) => {
        setProducts((previous) => deleteProduct(previous, productId));
      },

      placeOrder: (shopId, lines, beatName) => {
        const shop = shops.find((item) => item.id === shopId);
        if (!shop) return;
        const order = createOrder(
          createId("ord"),
          shop,
          lines,
          beatName,
          products,
          new Date().toISOString(),
        );
        if (!order) return;
        setOrders((previous) => [order, ...previous]);
        setShops((previous) =>
          applyOrderToShop(
            previous,
            shopId,
            order.total,
            latestSellingPrices(lines, shop.lastSellingPrices),
          ),
        );
        setBeats((previous) =>
          addBeatSales(previous, beatName, order.total),
        );
        addTransaction({
          type: "order",
          title: `Order: ${shop.name}`,
          subtitle: `${beatName} • ${order.summary}`,
          amount: order.total,
        });
      },

      markOrderStatus: (orderId, status) => {
        if (status !== "delivered") {
          setOrders((previous) =>
            setOrderStatus(previous, orderId, status),
          );
          return;
        }
        const result = deliverOrder(
          orders,
          orderId,
          new Date().toISOString(),
        );
        setOrders(result.orders);
        if (result.stockMovements.length > 0) {
          setStockMovements((previous) => [
            ...result.stockMovements,
            ...previous,
          ]);
        }
      },

      // 2. Dispatch Split Bug Fix
      confirmDispatch: (orderId, input) => {
        const order = orders.find((item) => item.id === orderId);
        if (!order) return undefined;

        const quantities = input.quantities;
        const remainingAction = input.remainingAction;

        const result = createDispatch(
          order,
          { ...input, quantities },
          profile,
          products,
          dispatches,
          new Date().toISOString(),
        );

        if (!result) return undefined;

        const remainingLines = order.lines.map(l => ({
          ...l,
          pendingQty: Math.max(0, l.qty - (quantities[l.productId] || 0))
        })).filter(l => l.pendingQty > 0);

        const dispatchedLines = order.lines.map(l => ({
          ...l,
          qty: quantities[l.productId] || 0
        })).filter(l => l.qty > 0);

        setOrders((prev) => {
          let next = [...prev];

          if (remainingAction === "backorder" && remainingLines.length > 0) {
            // बचे हुए आइटम्स का नया आर्डर (Partially Dispatched टैग के साथ)
            const backOrder: Order = {
              ...order,
              id: createId("ord"),
              lines: remainingLines.map(l => ({ 
                productId: l.productId, 
                qty: l.pendingQty, 
                price: l.price,
                status: "pending" 
              })),
              total: remainingLines.reduce((sum, l) => sum + (l.pendingQty * l.price), 0),
              status: "partial", // इससे "Partially Dispatched" टैग दिखेगा
              createdAt: new Date().toISOString(),
              backOrderOf: orderId
            };
            next = [backOrder, ...next];
          }

          // ओरिजिनल आर्डर को अपडेट करें (सिर्फ डिस्पैच हुए आइटम्स रखें और स्टेटस बदलें)
          next = next.map(o => {
            if (o.id === orderId) {
              return {
                ...o,
                lines: dispatchedLines,
                total: dispatchedLines.reduce((sum, l) => sum + (l.qty * l.price), 0),
                status: "dispatched"
              };
            }
            return o;
          });

          return next;
        });

        setDispatches((previous) => [result.dispatch, ...previous]);
        setStockMovements((previous) => [
          ...result.stockMovements,
          ...previous,
        ]);

        return result.dispatchId;
      },

      addPurchaseBill: (bill) => {
        const result = createPurchaseBill(
          bill,
          new Date().toISOString(),
        );
        setPurchaseBills((previous) => [
          result.purchaseBill,
          ...previous,
        ]);
        setStockMovements((previous) => [
          ...result.stockMovements,
          ...previous,
        ]);
      },

      collectPayment: (shopId, amount, mode) => {
        const shop = shops.find((item) => item.id === shopId);
        setShops((previous) =>
          applyCollectionToShop(previous, shopId, amount),
        );
        addTransaction({
          type: "collection",
          title: `Collection: ${shop?.name ?? "Shop"}`,
          subtitle: `Mode: ${mode} • Ref: RCP-${Math.floor(
            10000 + Math.random() * 89999,
          )}`,
          amount,
        });
      },

      // 3. New Edit/Cancel Actions
      cancelOrder: (orderId) => {
        setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
      },

      updateOrderLines: (orderId, updatedLines) => {
        setOrders((prev) => prev.map(o => {
          if (o.id === orderId) {
            const newTotal = updatedLines.reduce((sum, l) => sum + (l.qty * l.price), 0);
            return { ...o, lines: updatedLines, total: newTotal };
          }
          return o;
        }));
      },
    };
  }, [
    activeTab,
    beats,
    dailyTarget,
    dispatches,
    goBack,
    hydrated,
    navigate,
    orders,
    products,
    profile,
    purchaseBills,
    shops,
    stack,
    switchTab,
    syncEnabled,
    googleEmail,
    transactions,
  ]);

  if (!hydrated) {
    return <div className="flex h-screen items-center justify-center text-primary">Loading DPAS...</div>;
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
