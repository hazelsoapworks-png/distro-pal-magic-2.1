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
      <div className="pb-6">
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
    <div className="pb-48">
      <AppHeader title="Dispatch Order" subtitle={`${order.shopName} • ${order.beatName}`} showBack rounded />

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-black/5">
            <span className="text-xs text-muted-foreground">Executive</span>
            <input
              value={executive}
              onChange={(e) => setExecutive(e.target.value)}
              className="mt-1 w-full bg-transparent text-sm font-semibold text-foreground outline-none"
            />
          </label>
          <label className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-black/5">
            <span className="text-xs text-muted-foreground">Vehicle</span>
            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="MH12 AB 1234"
              className="mt-1 w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <h2 className="mb-2 mt-5 text-lg font-bold text-foreground">Dispatch Checklist</h2>
        <div className="space-y-3">
          {pendingLines.map((l) => {
            const p = products.find((x) => x.id === l.productId);
            const stock = stockFor(l.productId);
            const d = dispatchQtyOf(l);
            const remaining = l.pendingQty - d;
            return (
              <div key={l.productId} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
                <div className="flex items-start gap-3">
                  <ProductThumb src={p?.imageUrl} name={p?.name ?? "Item"} className="size-[56px]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{p?.name ?? "Item"}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p?.code} • {formatINR(l.price)} / {p?.unit ?? "Pcs"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Available Stock: <span className="font-semibold text-foreground">{stock.available}</span> •
                      Remaining Stock after dispatch:{" "}
                      <span className="font-semibold text-foreground">{Math.max(0, stock.available - d)}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 items-center gap-2 rounded-xl bg-surface p-2 text-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Ordered</p>
                    <p className="text-base font-bold text-foreground">{l.pendingQty}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Dispatch</p>
                    <input
                      inputMode="numeric"
                      value={d}
                      onChange={(e) =>
                        setValue(l.productId, l.pendingQty, Number(e.target.value.replace(/\D/g, "")) || 0)
                      }
                      aria-label={`Dispatch quantity for ${p?.name ?? "item"}`}
                      className="mx-auto mt-0.5 h-8 w-16 rounded-lg bg-card text-center text-base font-bold text-primary outline-none ring-1 ring-black/5 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Remaining</p>
                    <p className={`text-base font-bold ${remaining > 0 ? "text-warning" : "text-success"}`}>
                      {remaining}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {pendingLines.length === 0 && (
            <p className="rounded-xl bg-card p-4 text-center text-sm text-muted-foreground shadow-sm ring-1 ring-black/5">
              Nothing left to dispatch on this order.
            </p>
          )}
        </div>
      </div>

      {pendingLines.length > 0 && (
        <div className="fixed inset-x-0 bottom-[4.5rem] z-30 mx-auto max-w-md px-4">
          <div className="rounded-2xl bg-card p-3 shadow-lg ring-1 ring-black/5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Summary label="Ordered" value={totals.ordered} />
              <Summary label="Dispatched" value={totals.dispatched} tone="text-primary" />
              <Summary label="Remaining" value={totals.remaining} tone="text-warning" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-black/5 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Total Dispatch Value</p>
                <p className="text-lg font-bold text-foreground">{formatINR(totals.value)}</p>
              </div>
              <button
                type="button"
                onClick={submit}
                disabled={totals.dispatched === 0}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-40"
              >
                {fully ? <PackageCheck className="size-5" /> : <Boxes className="size-5" />}
                Confirm Dispatch
              </button>
            </div>
            <p className="mt-1 text-center text-xs text-muted-foreground">
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
        
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button 
            type="button"
            onClick={() => {
              setShowActionModal(false);
              performDispatch("cancel");
            }} 
            className="rounded-xl border border-black/10 px-4 py-2.5 font-semibold text-muted-foreground hover:bg-black/5"
          >
            Cancel Remaining
          </button>
          <button 
            type="button"
            onClick={() => {
              setShowActionModal(false);
              performDispatch("backorder");
            }} 
            className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground shadow-sm"
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
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-base font-bold ${tone}`}>{value}</p>
    </div>
  );
}
