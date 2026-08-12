import { useState } from "react";
import { Truck, CheckCircle2, Clock, PackageCheck, FileText, ChevronDown, Edit2, Minus, Plus, Trash2, X } from "lucide-react";
import { useStore, formatINR, type OrderStatus, type Order, type OrderLine } from "@/lib/store";

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
  const { orders, markOrderStatus, products, navigate, cancelOrder, updateOrderLines } = useStore();
  const productFor = (id: string) => products.find((p) => p.id === id);
  
  const [tab, setTab] = useState<TabKey>("pending");
  const [selectedBeat, setSelectedBeat] = useState<string>("all");

  // Edit / Cancel States
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editMode, setEditMode] = useState<"choose" | "edit_items" | null>(null);
  const [editQuantities, setEditQuantities] = useState<Record<string, number>>({});

  const inTab = (status: OrderStatus, key: TabKey) =>
    key === "pending" ? status === "pending" || status === "partial" : status === key;

  const uniqueBeats = Array.from(new Set(orders.map((o) => o.beatName))).filter(Boolean);

  const beatFilteredOrders = selectedBeat === "all"
    ? orders
    : orders.filter((o) => o.beatName === selectedBeat);

  const counts = {
    pending: beatFilteredOrders.filter((o) => inTab(o.status, "pending")).length,
    dispatched: beatFilteredOrders.filter((o) => inTab(o.status, "dispatched")).length,
    delivered: beatFilteredOrders.filter((o) => inTab(o.status, "delivered")).length,
  };

  const filtered = beatFilteredOrders.filter((o) => inTab(o.status, tab));

  // Modal Handlers
  const openEditModal = (o: Order) => {
    setEditOrder(o);
    setEditMode("choose");
    const qs: Record<string, number> = {};
    o.lines.forEach(l => { qs[l.productId] = l.qty; });
    setEditQuantities(qs);
  };

  const closeEditModal = () => {
    setEditOrder(null);
    setEditMode(null);
  };

  const handleCancelEntireOrder = () => {
    if (editOrder) {
      cancelOrder(editOrder.id);
      closeEditModal();
    }
  };

  const setQty = (productId: string, val: number) => {
    setEditQuantities(prev => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const saveEditedOrder = () => {
    if (!editOrder) return;
    
    const newLines: OrderLine[] = editOrder.lines.map(l => ({
      ...l,
      qty: editQuantities[l.productId] ?? 0
    })).filter(l => l.qty > 0);

    if (newLines.length === 0) {
      // If all quantities set to 0, just cancel the order
      cancelOrder(editOrder.id);
    } else {
      updateOrderLines(editOrder.id, newLines);
    }
    closeEditModal();
  };

  return (
    <div className="pb-6">
      <AppHeader title="Pending Orders" subtitle="Track deliveries & auto-deduct stock" showBack rounded />

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
                  </div>
                </div>
                
                {/* 1. New Cancel/Edit Action Group */}
                {(o.status === "pending" || o.status === "partial") && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(o)}
                      className="flex items-center justify-center rounded-xl border border-border bg-white px-3 py-2.5 font-semibold text-muted-foreground"
                    >
                      <Edit2 className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("dispatch", { orderId: o.id })}
                      className="flex items-center gap-2 rounded-xl bg-brand-soft px-4 py-2.5 font-semibold text-primary"
                    >
                      <Truck className="size-4" />
                      Dispatch
                    </button>
                  </div>
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

      {/* 2. Custom Modals for Edit/Cancel */}
      {editMode === "choose" && editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Modify Pending Order</h3>
              <button onClick={closeEditModal} className="rounded-full bg-surface p-1"><X className="size-5" /></button>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Do you want to cancel the whole order or edit the remaining items?
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleCancelEntireOrder} className="w-full rounded-xl bg-destructive px-4 py-3 font-semibold text-white">
                Cancel Entire Order
              </button>
              <button onClick={() => setEditMode("edit_items")} className="w-full rounded-xl bg-brand-soft px-4 py-3 font-semibold text-primary">
                Edit Items & Quantity
              </button>
            </div>
          </div>
        </div>
      )}

      {editMode === "edit_items" && editOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-card p-5 shadow-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-lg font-bold">Edit Quantities</h3>
              <button onClick={closeEditModal} className="rounded-full bg-surface p-1"><X className="size-5" /></button>
            </div>
            
            <div className="overflow-y-auto space-y-4 pb-4">
              {editOrder.lines.map(l => {
                const p = productFor(l.productId);
                const q = editQuantities[l.productId] ?? 0;
                
                return (
                  <div key={l.productId} className="flex items-center justify-between gap-3 rounded-xl bg-surface p-3 ring-1 ring-black/5">
                    <div className="flex min-w-0 items-center gap-3">
                      <ProductThumb src={p?.imageUrl} name={p?.name ?? "Item"} className="size-[40px]" />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{p?.name}</p>
                        <p className="text-xs text-muted-foreground">{formatINR(l.price)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      {q === 0 ? (
                        <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                           <Trash2 className="size-4" />
                        </div>
                      ) : (
                        <button type="button" onClick={() => setQty(l.productId, q - 1)} className="flex size-8 items-center justify-center rounded-lg bg-card text-foreground shadow-sm">
                          <Minus className="size-4" />
                        </button>
                      )}
                      
                      <input
                        type="number"
                        inputMode="numeric"
                        value={q}
                        onChange={(e) => setQty(l.productId, Number(e.target.value.replace(/\D/g, "")) || 0)}
                        className="h-8 w-10 rounded-lg bg-card text-center text-sm font-semibold text-foreground outline-none shadow-sm"
                      />
                      
                      <button type="button" onClick={() => setQty(l.productId, q + 1)} className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-border shrink-0">
               <button onClick={saveEditedOrder} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground">
                 Save Changes
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
