import { useState } from "react";
import { PackageCheck, ChevronRight } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProductThumb } from "@/components/product-thumb";

export function PendingOrdersScreen() {
  const { pendingOrders, products, navigate } = useStore();

  return (
    <div className="pb-6 max-w-7xl mx-auto w-full">
      <AppHeader title="Pending Orders" subtitle="Orders ready for dispatch" showBack rounded />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-6 pt-4">
        {pendingOrders.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No pending orders to dispatch.
          </div>
        )}
        
        {pendingOrders.map((o) => (
          <div key={o.id} className="flex flex-col justify-between rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-foreground text-base sm:text-lg truncate">{o.shopName}</p>
                  <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground truncate">{o.beatName}</p>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground line-clamp-2">{o.summary}</p>
                </div>
                <span className="shrink-0 font-bold text-primary text-base sm:text-lg">
                  {formatINR(o.total)}
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Status: <span className="font-semibold text-warning capitalize">{o.status}</span>
              </span>
              <button
                type="button"
                onClick={() => navigate("dispatch", { orderId: o.id })}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
              >
                <PackageCheck className="size-4 sm:size-5" />
                Dispatch
                <ChevronRight className="size-4 sm:size-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}