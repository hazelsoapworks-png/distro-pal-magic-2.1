import { useState } from "react";
import { Truck, CheckCircle2, Clock, PackageCheck, FileText, ChevronDown } from "lucide-react";
import { useStore, formatINR, type OrderStatus } from "@/lib/store";

import { AppHeader } from "@/components/app-header";
import { ProductThumb } from "@/components/product-thumb";

type TabKey = "pending" | "dispatched" | "delivered";

const TAB_META: Record<TabKey, { label: string }> = {
  pending: { label: "Pending" },
  dispatched: { label: "Dispatched" },
  delivered: { label: "Delivered" },
};

const STATUS_META: Record<OrderStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", cls: "bg-warning-soft text-warning", icon: <Clock className="size-3.5" /> },
  partial: {
    label: "Partially Dispatched",
    cls: "bg-warning-soft text-warning",
    icon: <PackageCheck className="size-3.5" />,
  },
  dispatched: { label: "Out for Delivery", cls: "bg-brand-soft text-primary", icon: <Truck className="size-3.5" /> },
  delivered: { label: "Delivered", cls: "bg-success-soft text-success", icon: <CheckCircle2 className="size-3.5" /> },
  cancelled: {
    label: "Cancelled",
    cls: "bg-muted text-muted-foreground",
    icon: <Clock className="size-3.5" />,
  },
};

export function PendingOrdersScreen() {
  const { orders, markOrderStatus, products, navigate } = useStore();
  const productFor = (id: string) => products.find((p) => p.id === id);
  
  const [tab, setTab] = useState<TabKey>("pending");
  const [selectedBeat, setSelectedBeat] = useState<string>("all");

  const inTab = (status: OrderStatus, key: TabKey) =>
    key === "pending" ? status === "pending" || status === "partial" : status === key;

  // सभी उपलब्ध ऑर्डर्स में से यूनीक (Unique) बीट्स के नाम निकालना
  const uniqueBeats = Array.from(new Set(orders.map((o) => o.beatName))).filter(Boolean);

  // सबसे पहले ऑर्डर्स को सेलेक्ट की गई बीट के हिसाब से फ़िल्टर करना
  const beatFilteredOrders = selectedBeat === "all"
    ? orders
    : orders.filter((o) => o.beatName === selectedBeat);

  // टैब्स की गिनती (Counts) अब सिर्फ चुनी हुई बीट के ऑर्डर्स के हिसाब से होगी
  const counts = {
    pending: beatFilteredOrders.filter((o) => inTab(o.status, "pending")).length,
    dispatched: beatFilteredOrders.filter((o) => inTab(o.status, "dispatched")).length,
    delivered: beatFilteredOrders.filter((o) => inTab(o.status, "delivered")).length,
  };

  // अब एक्टिव टैब के हिसाब से फ़ाइनल लिस्ट बनाना
  const filtered = beatFilteredOrders.filter((o) => inTab(o.status, tab));

  return (
    <div className="pb-6">
      <AppHeader title="Pending Orders" subtitle="Track deliveries & auto-deduct stock" showBack rounded />

      {/* बीट फ़िल्टर (Beat Filter Dropdown) */}
      <div className="bg-card px-4 pt-4 pb-2">
        <div className="relative">
          <select
            value={selectedBeat}
            onChange={(e) => setSelectedBeat(e.target.value)}
            className="w-full appearance-none rounded-xl bg-surface px-4 py-3 text-sm font-bold text-foreground shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Beats (सभी इलाके)</option>
            {uniqueBeats.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

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
          const lastDispatchId = o.dispatchIds?.[o.dispatchIds.length - 1];
          return (
            <div key={o.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{o.shopName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {o.beatName}
                    {o.backOrderOf ? " • Back Order" : ""}
                  </p>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}>
                  {meta.icon}
                  {meta.label}
                </span>
              </div>

              <ul className="mt-3 space-y-2 rounded-xl bg-surface p-3 text-sm">
                {o.lines.map((l, i) => {
                  const p = productFor(l.productId);
                  const done = l.dispatchedQty ?? 0;
                  return (
                    <li key={i} className="flex items-center gap-3">
                      <ProductThumb src={p?.imageUrl} name={p?.name ?? "Item"} className="size-[36px]" />
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-muted-foreground">
                          {l.qty}× {p?.name ?? "Item"}
                        </span>
                        {done > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Dispatched {done} • Remaining {Math.max(0, l.qty - done)}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 font-medium text-foreground">
                        {formatINR(l.qty * l.price)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Order Total</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-primary">{formatINR(o.total)}</p>
                    {o.totalMargin !== undefined && (
                      <span className="rounded-md bg-success-soft px-1.5 py-0.5 text-xs font-bold text-success">
                        Profit: {formatINR(o.totalMargin)}
                      </span>
                    )}
                  </div>
                </div>
                {(o.status === "pending" || o.status === "partial") && (
                  <button
                    type="button"
                    onClick={() => navigate("dispatch", { orderId: o.id })}
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

              {lastDispatchId && (
                <button
                  type="button"
                  onClick={() => navigate("invoice", { dispatchId: lastDispatchId })}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-surface px-4 py-2 text-sm font-semibold text-primary"
                >
                  <FileText className="size-4" />
                  View Invoice
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
