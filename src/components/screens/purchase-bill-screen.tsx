import { useMemo, useState } from "react";
import { Minus, Plus, Save } from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export function PurchaseBillScreen() {
  const { products, addPurchaseBill, goBack } = useStore();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [supplier, setSupplier] = useState("");
  const [invoice, setInvoice] = useState("");
  const [date, setDate] = useState(today);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [price, setPrice] = useState<Record<string, string>>({});

  const setQ = (id: string, v: number) =>
    setQty((prev) => ({ ...prev, [id]: Math.max(0, Math.min(9999, v)) }));

  const lines = products
    .map((p) => ({
      p,
      q: qty[p.id] ?? 0,
      pr: Number(price[p.id] ?? p.buyingPrice) || 0,
    }))
    .filter((l) => l.q > 0);
  const total = lines.reduce((s, l) => s + l.q * l.pr, 0);

  const save = () => {
    if (!supplier.trim() || lines.length === 0) return;
    addPurchaseBill({
      supplier: supplier.trim(),
      invoiceNumber: invoice.trim() || `INV-${Date.now()}`,
      invoiceDate: date,
      lines: lines.map((l) => ({ productId: l.p.id, qty: l.q, price: l.pr })),
    });
    goBack();
  };

  return (
    <div className="pb-40">
      <AppHeader title="Purchase Bill" subtitle="Receive stock from supplier" showBack rounded />

      <div className="space-y-3 px-4 pt-4">
        <Field label="Supplier / Company Name" value={supplier} onChange={setSupplier} placeholder="e.g. Glow Cosmetics Pvt Ltd" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Invoice Number" value={invoice} onChange={setInvoice} placeholder="INV-2026-001" />
          <Field label="Invoice Date" value={date} onChange={setDate} type="date" />
        </div>

        <h2 className="mt-4 text-base font-bold text-foreground">Select Products</h2>
        {products.map((p) => {
          const q = qty[p.id] ?? 0;
          return (
            <div key={p.id} className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.code} • per {p.unit}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQ(p.id, q - 1)}
                    aria-label={`Decrease ${p.name}`}
                    className="flex size-9 items-center justify-center rounded-lg bg-surface text-foreground disabled:opacity-40"
                    disabled={q === 0}
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    inputMode="numeric"
                    value={q}
                    onChange={(e) => setQ(p.id, Number(e.target.value.replace(/\D/g, "")) || 0)}
                    aria-label={`${p.name} quantity`}
                    className="h-9 w-14 rounded-lg bg-surface text-center text-base font-semibold text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    onClick={() => setQ(p.id, q + 1)}
                    aria-label={`Increase ${p.name}`}
                    className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
              {q > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Purchase price ₹</span>
                  <input
                    inputMode="decimal"
                    value={price[p.id] ?? String(p.buyingPrice)}
                    onChange={(e) => setPrice((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    className="w-24 rounded-lg bg-surface px-2 py-1.5 text-sm outline-none ring-1 ring-transparent focus:ring-primary/40"
                  />
                  <span className="ml-auto text-sm font-semibold text-foreground">
                    {formatINR(q * (Number(price[p.id] ?? p.buyingPrice) || 0))}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-[4.5rem] z-30 mx-auto max-w-md px-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-card p-3 shadow-lg ring-1 ring-black/5">
          <div>
            <p className="text-xs text-muted-foreground">Bill Total</p>
            <p className="text-lg font-bold text-foreground">{formatINR(total)}</p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!supplier.trim() || lines.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-40"
          >
            <Save className="size-5" />
            Save Bill
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 placeholder:text-muted-foreground"
      />
    </label>
  );
}
