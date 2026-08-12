import { Package, Clock, Truck, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export function DeliveryMenuScreen() {
  const { navigate, pendingOrders, dispatches } = useStore();

  return (
    <div className="pb-6">
      <AppHeader title="Delivery Management" showBack rounded />
      
      <div className="px-4 pt-6 space-y-3">
        {/* 1. Stock Inventory */}
        <MenuButton
          icon={<Package className="size-6 text-teal" />}
          title="Stock Inventory"
          subtitle="Manage your current stock and items"
          onClick={() => navigate("inventory")} 
        />
        
        {/* 2. Pending Orders */}
        <MenuButton
          icon={<Clock className="size-6 text-warning" />}
          title="Pending Orders"
          subtitle={`${pendingOrders.length} orders to deliver`}
          onClick={() => navigate("pendingOrders")} 
        />
        
        {/* 3. Dispatch History */}
        <MenuButton
          icon={<Truck className="size-6 text-primary" />}
          title="Dispatch History"
          subtitle={`${dispatches.length} past invoices tracked`}
          onClick={() => navigate("dispatchHistory")} 
        />
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-black/5 transition-transform active:scale-95"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </button>
  );
}