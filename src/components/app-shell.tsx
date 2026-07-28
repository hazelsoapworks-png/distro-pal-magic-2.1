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
    default:
      return <HomeScreen />;
  }
}

function Shell() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-surface">
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
