import { useStore, formatINR, DISTRIBUTOR, TAX_RATE } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { ProductThumb } from "@/components/product-thumb";

export function InvoiceScreen({ dispatchId }: { dispatchId?: string }) {
  const { dispatches, products, shops } = useStore();
  const d = dispatches.find((x) => x.id === dispatchId);

  if (!d) {
    return (
      <div className="pb-6">
        <AppHeader title="Invoice" subtitle="Not found" showBack rounded />
        <p className="px-4 py-10 text-center text-muted-foreground">This invoice is not available.</p>
      </div>
    );
  }

  const shop = shops.find((s) => s.id === d.shopId);
  const billed = d.lines.filter((l) => l.dispatchedQty > 0);

  return (
    <div className="pb-8">
      <AppHeader title="Tax Invoice" subtitle={d.invoiceNumber} showBack rounded />

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-bold text-foreground">{DISTRIBUTOR.name}</p>
          <p className="text-xs text-muted-foreground">{DISTRIBUTOR.address}</p>
          <p className="text-xs text-muted-foreground">GSTIN: {DISTRIBUTOR.gstin}</p>

          <div className="mt-3 border-t border-black/5 pt-3">
            <p className="text-xs text-muted-foreground">Billed To</p>
            <p className="text-sm font-bold text-foreground">{d.shopName}</p>
            <p className="text-xs text-muted-foreground">{shop?.address ?? d.beatName}</p>
            <p className="text-xs text-muted-foreground">GSTIN: 27AAOCS{d.shopId.toUpperCase()}1Z5</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-black/5 pt-3 text-xs text-muted-foreground">
            <p>
              Date:{" "}
              <span className="font-medium text-foreground">
                {new Date(d.at).toLocaleDateString("en-IN")}
              </span>
            </p>
            <p>
              Time:{" "}
              <span className="font-medium text-foreground">
                {new Date(d.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
            <p>
              Executive: <span className="font-medium text-foreground">{d.executive}</span>
            </p>
            <p>
              Vehicle: <span className="font-medium text-foreground">{d.vehicle}</span>
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {billed.map((l) => {
            const p = products.find((x) => x.id === l.productId);
            return (
              <div
                key={l.productId}
                className="flex items-start gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-black/5"
              >
                <ProductThumb src={p?.imageUrl} name={p?.name ?? "Item"} className="size-[48px]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{p?.name ?? "Item"}</p>
                  <p className="text-xs text-muted-foreground">
                    Ordered {l.orderedQty} • Dispatched {l.dispatchedQty} • Rate {formatINR(l.price)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-foreground">
                  {formatINR(l.dispatchedQty * l.price)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
          <Row label="Sub Total" value={formatINR(d.subTotal)} />
          <Row label={`GST (${Math.round(TAX_RATE * 100)}%)`} value={formatINR(d.tax)} />
          <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-2">
            <p className="font-semibold text-foreground">Grand Total</p>
            <p className="text-xl font-bold text-primary">{formatINR(d.grandTotal)}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Dispatch Status: {d.status}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
