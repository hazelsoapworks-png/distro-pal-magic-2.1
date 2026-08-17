import { useMemo, useState } from "react";
import { PackageCheck, Boxes } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProductThumb } from "@/components/product-thumb";
import { Modal } from "@/components/modal";

export function DispatchScreen({ orderId }: { orderId?: string }) {
  const { orders, products, stockFor, profile, confirmDispatch, navigate, goBack } = useStore();
  const order = orders.find((o) => o.id === orderId);

  const pendingLines = useMemo(
    () =>
      (order?.lines ?? [])
        .map((l) => ({ ...l, pendingQty: Math.max(0, l.qty - (l.dispatchedQty ?? 0)) }))
        .filter((l) => l.pendingQty > 0),
    [order],
  );

  const [qty, setQty] = useState<Record<string, number>>({});
  const [executive, setExecutive] = useState(profile.name);
  const [vehicle, setVehicle] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);

  if (!order) {
    return (
      <div className="pb-6 max-w-7xl mx-auto w-full">
        <AppHeader title="Dispatch" subtitle="Order not found" showBack rounded />
        <p className="px-4 py-10 text-center text-muted-foreground">This order is no longer available.</p>
      </div>
    );
  }

  const dispatchQtyOf = (l: (typeof pendingLines)[number]) =>
    Math.max(0, Math.min(l.pendingQty, qty[l.productId] ?? l.pendingQty));

  const setValue = (productId: string, max: number, v: number) =>
    setQty((prev) => ({ ...prev, [productId]: Math.max(0, Math.min(max, v)) }));

  const totals = pendingLines.reduce(
    (acc, l) => {
      const d = dispatchQtyOf(l);
      acc.ordered += l.pendingQty;
      acc.dispatched += d;
      acc.remaining += l.pendingQty - d;
      acc.value += d * l.price;
      return acc;
    },
    { ordered: 0, dispatched: 0, remaining: 0, value: 0 },
  );

  const fully = totals.remaining === 0 && totals.dispatched > 0;

  const submit = () => {
    if (totals.dispatched === 0) return;
    if (totals.remaining > 0) {
      setShowActionModal(true);
    } else {
      performDispatch();
    }
  };

  const performDispatch = (actionOverride?: "cancel" | "backorder") => {
    const quantities: Record<string, number> = {};
    pendingLines.forEach((l) => {
      quantities[l.productId] = dispatchQtyOf(l);
    });
    
    const dispatchId = confirmDispatch(order.id, { 
      executive, 
      vehicle, 
      quantities,
      remainingAction: actionOverride 
    });
    
    if (dispatchId) navigate("invoice", { dispatchId });
    else goBack();
  };

  return (
    <div className="pb-48 max-w-7xl mx-auto w-full">
      <AppHeader title="Dispatch Order" subtitle={`${order.shopName} • ${order.beatName}`} showBack rounded />

      <div className="px-4 sm:px-6 pt-4">
        {/* Top Info Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <label className="rounded-2xl bg-card p-3 sm:p-4 shadow-sm ring-1 ring-black/5 flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Executive</span>
            <input
              value={executive}
              onChange={(e) => setExecutive(e.target.value)}
              className="mt-1.5 w-full bg-transparent text-sm sm:text-base font-semibold text-foreground outline-none"
            />
          </label>
          <label className="rounded-2xl bg-card p-3 sm:p-4 shadow-sm ring-1 ring-black/5 flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Vehicle</span>
            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="MH12 AB 1234"
              className="mt-1.5 w-full bg-transparent text-sm sm:text-base font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <h2 className="mb-3 mt-6 sm:mt-8 text-lg sm:text-xl font-bold text-foreground">Dispatch Checklist</h2>
        
        {/* Checklist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {pendingLines.map((l) => {
            const p = products.find((x) => x.id === l.productId);
            const stock = stockFor(l.productId);
            const d = dispatchQtyOf(l);
            const remaining = l.pendingQty - d;
            return (
              <div key={l.productId} className="flex flex-col justify-between rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <ProductThumb src={p?.imageUrl} name={p?.name ?? "Item"} className="size-[56px] sm:size-[64px] shrink-0" />
                    <div className="min-w-0 flex-1 pr-1">
                      <p className="font-semibold text-foreground text-base truncate">{p?.name ?? "Item"}</p>
                      <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground truncate">
                        {p?.code} • {formatINR(l.price)} / {p?.unit ?? "Pcs"}
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        Available Stock: <span className="font-semibold text-foreground">{stock.available}</span> • 
                        Remaining: <span className="font-semibold text-foreground">{Math.max(0, stock.available - d)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 grid grid-cols-3 items-center gap-2 rounded-xl bg-surface p-2 sm:p-3 text-center">
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Ordered</p>
                    <p className="mt-0.5 text-base sm:text-lg font-bold text-foreground">{l.pendingQty}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Dispatch</p>
                    <input
                      inputMode="numeric"
                      value={d}
                      onChange={(e) =>
                        setValue(l.productId, l.pendingQty, Number(e.target.value.replace(/\D/g, "")) || 0)
                      }
                      aria-label={`Dispatch quantity for ${p?.name ?? "item"}`}
                      className="mx-auto mt-1 h-8 sm:h-9 w-16 sm:w-20 rounded-lg bg-card text-center text-base sm:text-lg font-bold text-primary outline-none ring-1 ring-black/5 focus:ring-primary/40 transition-shadow"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Remaining</p>
                    <p className={`mt-0.5 text-base sm:text-lg font-bold ${remaining > 0 ? "text-warning" : "text-success"}`}>
                      {remaining}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {pendingLines.length === 0 && (
            <div className="col-span-full rounded-xl bg-card p-4 sm:p-6 text-center text-sm text-muted-foreground shadow-sm ring-1 ring-black/5">
              Nothing left to dispatch on this order.
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Bar */}
      {pendingLines.length > 0 && (
        <div className="fixed inset-x-0 bottom-[4.5rem] z-30 mx-auto max-w-2xl px-4 sm:px-6 pointer-events-none">
          <div className="rounded-2xl bg-card p-4 shadow-xl ring-1 ring-black/10 pointer-events-auto">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Summary label="Ordered" value={totals.ordered} />
              <Summary label="Dispatched" value={totals.dispatched} tone="text-primary" />
              <Summary label="Remaining" value={totals.remaining} tone="text-warning" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/5 pt-3">
              <div className="min-w-0 pr-2">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Dispatch Value</p>
                <p className="text-lg sm:text-xl font-bold text-foreground truncate">{formatINR(totals.value)}</p>
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={totals.dispatched === 0}
                className="flex items-center shrink-0 gap-2 rounded-xl bg-primary px-5 py-3 sm:py-3.5 font-semibold text-primary-foreground disabled:opacity-40 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                {fully ? <PackageCheck className="size-5" /> : <Boxes className="size-5" />}
                Confirm Dispatch
              </button>
            </div>
            <p className="mt-2 text-center text-xs sm:text-sm text-muted-foreground">
              {totals.dispatched === 0
                ? "Enter dispatch quantities to continue"
                : fully
                  ? "Status: Fully Dispatched"
                  : `Status: Partially Dispatched`}
            </p>
          </div>
        </div>
      )}

      {/* Action Modal for Partial Fulfillment */}
      <Modal open={showActionModal} onClose={() => setShowActionModal(false)}>
        <h3 className="text-xl font-bold text-foreground">Partial Dispatch Alert</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          You ordered <span className="font-semibold text-foreground">{totals.ordered}</span> items, but are only dispatching <span className="font-semibold text-foreground">{totals.dispatched}</span>.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          What would you like to do with the remaining <span className="font-semibold text-warning">{totals.remaining}</span> items?
        </p>
        
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button 
            type="button"
            onClick={() => {
              setShowActionModal(false);
              performDispatch("cancel");
            }} 
            className="rounded-xl border border-black/10 px-4 py-2.5 font-semibold text-muted-foreground hover:bg-black/5 transition-colors cursor-pointer"
          >
            Cancel Remaining
          </button>
          <button 
            type="button"
            onClick={() => {
              setShowActionModal(false);
              performDispatch("backorder");
            }} 
            className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            Keep Pending
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Summary({ label, value, tone = "text-foreground" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
      <p className={`mt-0.5 text-base sm:text-lg font-bold ${tone}`}>{value}</p>
    </div>
  );
}