import { useState } from "react";
import { Truck, CheckCircle2, Clock } from "lucide-react";
import { useStore, formatINR, type OrderStatus } from "@/lib/store";

import { AppHeader } from "@/components/app-header";

type TabKey = "pending" | "dispatched" | "delivered";

const TAB_META: Record<TabKey, { label: string }> = {
  pending: { label: "Pending" },
  dispatched: { label: "Dispatched" },
  delivered: { label: "Delivered" },
};

const STATUS_META: Record<OrderStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", cls: "bg-warning-soft text-warning", icon: <Clock className="size-3.5" /> },
  dispatched: { label: "Out for Delivery", cls: "bg-brand-soft text-primary", icon: <Truck className="size-3.5" /> },
  delivered: { label: "Delivered", cls: "bg-success-soft text-success", icon: <CheckCircle2 className="size-3.5" /> },
};

export function PendingOrdersScreen() {
  const { orders, markOrderStatus, products } = useStore();
  const nameFor = (id: string) => products.find((p) => p.id === id)?.name ?? "Item";
  const [tab, setTab] = useState<TabKey>("pending");

  const counts = {
    pending: orders.filter((o) => o.status === "pending").length,
    dispatched: orders.filter((o) => o.status === "dispatched").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const filtered = orders.filter((o) => o.status === tab);

  return (
    <div className="pb-6">
      <AppHeader title="Pending Orders" subtitle="Track deliveries & auto-deduct stock" showBack rounded />

      <div className="flex gap-5 overflow-x-auto border-b border-black/5 bg-card px-4">
        {(Object.keys(TAB_META) as TabKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`shrink-0 border-b-2 py-3 text-sm font-semibold transition-colors ${
              tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            {TAB_META[k].label} ({counts[k]})
          </button>
        ))}
      </div>

      <div className="space-y-3 px-4 pt-4">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">No orders in this list.</p>
        )}
        {filtered.map((o) => {
          const meta = STATUS_META[o.status];
          return (
            <div key={o.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{o.shopName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{o.beatName}</p>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}>
                  {meta.icon}
                  {meta.label}
                </span>
              </div>

              <ul className="mt-3 space-y-1 rounded-xl bg-surface p-3 text-sm">
                {o.lines.map((l, i) => (
                  <li key={i} className="flex items-center justify-between text-muted-foreground">
                    <span className="truncate">
                      {l.qty}× {nameFor(l.productId)}
                    </span>
                    <span className="shrink-0 font-medium text-foreground">
                      {formatINR(l.qty * l.price)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Order Total</p>
                  <p className="text-lg font-bold text-primary">{formatINR(o.total)}</p>
                </div>
                {o.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => markOrderStatus(o.id, "dispatched")}
                    className="flex items-center gap-2 rounded-xl bg-brand-soft px-4 py-2.5 font-semibold text-primary"
                  >
                    <Truck className="size-4" />
                    Dispatch
                  </button>
                )}
                {o.status === "dispatched" && (
                  <button
                    type="button"
                    onClick={() => markOrderStatus(o.id, "delivered")}
                    className="flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 font-semibold text-white"
                  >
                    <CheckCircle2 className="size-4" />
                    Mark Delivered
                  </button>
                )}
                {o.status === "delivered" && o.deliveredAt && (
                  <p className="text-xs text-muted-foreground">
                    Delivered {new Date(o.deliveredAt).toLocaleDateString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

