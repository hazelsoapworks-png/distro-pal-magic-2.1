import { useState } from "react";
import { PackageCheck, ChevronRight } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProductThumb } from "@/components/product-thumb";

export function PendingOrdersScreen() {
  const { pendingOrders, products, navigate } = useStore();

  return (
    <div className="pb-6">
      <AppHeader title="Pending Orders" subtitle="Orders ready for dispatch" showBack rounded />
      <div className="space-y-3 px-4 pt-4">
        {pendingOrders.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">No pending orders to dispatch.</p>
        )}
        {pendingOrders.map((o) => (
          <div key={o.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-foreground">{o.shopName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{o.beatName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{o.summary}</p>
              </div>
              <span className="shrink-0 font-bold text-primary">{formatINR(o.total)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
              <span className="text-xs text-muted-foreground">
                Status: <span className="font-semibold text-warning capitalize">{o.status}</span>
              </span>
              <button
                type="button"
                onClick={() => navigate("dispatch", { orderId: o.id })}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
              >
                <PackageCheck className="size-4" />
                Dispatch
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}