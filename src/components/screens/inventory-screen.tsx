import { Package, PackagePlus, ArrowDownToLine, ArrowUpFromLine, Camera } from "lucide-react";
import { useStore, formatINR, type StockLevels } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

const STATUS_META: Record<StockLevels["status"], { label: string; cls: string }> = {
  in: { label: "In Stock", cls: "bg-success-soft text-success" },
  low: { label: "Low Stock", cls: "bg-warning-soft text-warning" },
  out: { label: "Out of Stock", cls: "bg-destructive/10 text-destructive" },
};

export function InventoryScreen() {
  const { products, stockFor, stockMovements, navigate } = useStore();

  const totals = products.reduce(
    (acc, p) => {
      const s = stockFor(p.id);
      acc.physical += s.physical;
      acc.reserved += s.reserved;
      acc.available += s.available;
      if (s.status === "low") acc.low += 1;
      if (s.status === "out") acc.out += 1;
      return acc;
    },
    { physical: 0, reserved: 0, available: 0, low: 0, out: 0 },
  );

  return (
    <div className="pb-6">
      <AppHeader
        title="Stock & Inventory"
        subtitle="Godown-level stock management"
        showBack
        rounded
      />

      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Physical" value={totals.physical} tone="brand" icon={<Package className="size-4" />} />
          <StatCard label="Reserved" value={totals.reserved} tone="warning" icon={<ArrowUpFromLine className="size-4" />} />
          <StatCard label="Available" value={totals.available} tone="success" icon={<ArrowDownToLine className="size-4" />} />
        </div>

        <button
          type="button"
          onClick={() => navigate("purchaseBill")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-semibold text-primary-foreground shadow-sm"
        >
          <PackagePlus className="size-5" />
          Receive New Stock / Purchase Bill
        </button>

        {(totals.low > 0 || totals.out > 0) && (
          <div className="mt-3 rounded-xl bg-warning-soft px-3.5 py-2.5 text-sm text-warning">
            {totals.out} out of stock • {totals.low} low stock — reorder soon.
          </div>
        )}

        <h2 className="mb-2 mt-6 text-lg font-bold text-foreground">Products</h2>
        <div className="space-y-3">
          {products.map((p) => {
            const s = stockFor(p.id);
            const meta = STATUS_META[s.status];
            return (
              <div key={p.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
                <div className="flex items-start gap-3">
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="size-full object-cover" />
                    ) : (
                      <Camera className="size-5 text-primary/60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.code} • per {p.unit} • {formatINR(p.sellingPrice)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-surface p-2 text-center">
                  <StockCell label="Physical" value={s.physical} tone="text-foreground" />
                  <StockCell label="Reserved" value={s.reserved} tone="text-warning" />
                  <StockCell label="Available" value={s.available} tone="text-success" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Reorder threshold: {p.lowStockThreshold} {p.unit}
                </p>
              </div>
            );
          })}
        </div>

        <h2 className="mb-2 mt-6 text-lg font-bold text-foreground">Stock Movement Log</h2>
        <div className="space-y-2">
          {stockMovements.length === 0 && (
            <p className="rounded-xl bg-card p-4 text-center text-sm text-muted-foreground shadow-sm ring-1 ring-black/5">
              No movements yet. Add a purchase bill or deliver an order.
            </p>
          )}
          {stockMovements.map((m) => {
            const p = products.find((x) => x.id === m.productId);
            const inward = m.type === "inward";
            return (
              <div key={m.id} className="flex items-start gap-3 rounded-xl bg-card p-3 shadow-sm ring-1 ring-black/5">
                <span
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                    inward ? "bg-success-soft text-success" : "bg-brand-soft text-primary"
                  }`}
                >
                  {inward ? <ArrowDownToLine className="size-4" /> : <ArrowUpFromLine className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {inward ? "+" : "−"}
                    {m.qty} {p?.name ?? "Item"}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.note}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(m.at).toLocaleDateString("en-IN")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "brand" | "warning" | "success";
  icon: React.ReactNode;
}) {
  const toneCls =
    tone === "brand"
      ? "bg-brand-soft text-primary"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : "bg-success-soft text-success";
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-black/5">
      <span className={`flex size-7 items-center justify-center rounded-full ${toneCls}`}>{icon}</span>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function StockCell({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-base font-bold ${tone}`}>{value}</p>
    </div>
  );
}
