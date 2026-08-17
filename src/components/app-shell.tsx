import { useEffect } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import { BottomNav } from "@/components/bottom-nav";
import { HomeScreen } from "@/components/screens/home-screen";
import { BeatScreen } from "@/components/screens/beat-screen";
import { BeatDetailScreen } from "@/components/screens/beat-detail-screen";
import { ProductsScreen } from "@/components/screens/products-screen";
import { OrderBookingScreen } from "@/components/screens/order-booking-screen";
import { DuesLedgerScreen } from "@/components/screens/dues-ledger-screen";
import { ReportsScreen } from "@/components/screens/reports-screen";
import { AccountsScreen } from "@/components/screens/accounts-screen";
import { MoreScreen } from "@/components/screens/more-screen";
import { InventoryScreen } from "@/components/screens/inventory-screen";
import { PurchaseBillScreen } from "@/components/screens/purchase-bill-screen";
import { PendingOrdersScreen } from "@/components/screens/pending-orders-screen";
import { DispatchScreen } from "@/components/screens/dispatch-screen";
import { InvoiceScreen } from "@/components/screens/invoice-screen";
import { DispatchHistoryScreen } from "@/components/screens/dispatch-history-screen";
import { DeliveryMenuScreen } from "@/components/screens/delivery-menu";
import { OrdersHistoryScreen } from "@/components/screens/orders-history-screen";

function CurrentScreen() {
  const { current } = useStore();
  const p = current.params ?? {};

  switch (current.name) {
    case "home":
      return <HomeScreen />;
    case "beat":
      return <BeatScreen />;
    case "beatDetail":
      return <BeatDetailScreen beatId={p.beatId} />;
    case "products":
      return <ProductsScreen />;
    case "orderBooking":
      return <OrderBookingScreen shopId={p.shopId} beatId={p.beatId} />;
    case "duesLedger":
      return <DuesLedgerScreen />;
    case "reports":
      return <ReportsScreen />;
    case "accounts":
      return <AccountsScreen />;
    case "more":
      return <MoreScreen />;
    case "inventory":
      return <InventoryScreen />;
    case "purchaseBill":
      return <PurchaseBillScreen />;
    case "pendingOrders":
      return <PendingOrdersScreen />;
    case "dispatch":
      return <DispatchScreen orderId={p.orderId} />;
    case "invoice":
      return <InvoiceScreen dispatchId={p.dispatchId} />;
    case "dispatchHistory":
      return <DispatchHistoryScreen />;
    case "deliveryMenu":
      return <DeliveryMenuScreen />;
    case "ordersHistory":
      return <OrdersHistoryScreen />;
    default:
      return <HomeScreen />;
  }
}

/**
 * Android hardware-back support.
 *
 * The in-app navigation stack is mirrored into the browser/WebView history so
 * the device back button pops one screen at a time:
 *  Details -> Shop -> Beat -> Home -> (exit app)
 * When the stack is already at the root we do NOT block the event, so the
 * WebView unwinds its own history and Android closes the app.
 */
function useAndroidBackButton() {
  const { canGoBack, goBack } = useStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Keep exactly one "trap" entry on top of history while a sub-screen is open.
    if (canGoBack && window.history.state?.dpas !== true) {
      window.history.pushState({ dpas: true }, "");
    }

    const onPop = () => {
      const popped = goBack();
      if (popped) {
        // Re-arm the trap for the next back press if we're still nested.
        window.history.pushState({ dpas: true }, "");
      }
    };

    // Cordova/Capacitor WebViews also emit a `backbutton` DOM event.
    const onHardwareBack = (e: Event) => {
      if (!canGoBack) return;
      e.preventDefault();
      goBack();
    };

    window.addEventListener("popstate", onPop);
    document.addEventListener("backbutton", onHardwareBack);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("backbutton", onHardwareBack);
    };
  }, [canGoBack, goBack]);
}

function Shell() {
  useAndroidBackButton();

  return (
    <div 
      className="mx-auto flex h-dvh w-full max-w-7xl flex-col overflow-hidden bg-surface transition-all duration-300"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <CurrentScreen />
      </div>
      <BottomNav />
    </div>
  );
}

export function AppShell() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}