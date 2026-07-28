import { useState } from "react";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { useStore, formatINR, type Product } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { Modal } from "@/components/modal";

export function ProductsScreen() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  return (
    <div className="pb-6">
      <AppHeader
        title="Product Catalogue"
        subtitle={`${products.length} products listed`}
        showBack
        rounded
        right={
          <button
            type="button"
            onClick={openAdd}
            aria-label="Add product"
            className="flex size-10 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          >
            <Plus className="size-5" />
          </button>
        }
      />

      <div className="space-y-3 px-4 pt-4">
        {products.map((p) => {
          const margin = p.sellingPrice - p.buyingPrice;
          return (
            <div key={p.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-primary">
                  <Package className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Code: {p.code} • per {p.unit}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    aria-label={`Edit ${p.name}`}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(p.id)}
                    aria-label={`Delete ${p.name}`}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5">
                <div>
                  <p className="text-xs text-muted-foreground">Selling Price</p>
                  <p className="text-lg font-bold text-primary">{formatINR(p.sellingPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Margin</p>
                  <p className="font-semibold text-success">{formatINR(margin)}</p>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">
            No products yet. Tap + to add one.
          </p>
        )}
      </div>

      <ProductFormModal
        open={formOpen}
        product={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={(p) => {
          if (editing) updateProduct({ ...p, id: editing.id });
          else addProduct(p);
          setFormOpen(false);
        }}
      />
    </div>
  );
}

function ProductFormModal({
  open,
  product,
  onClose,
  onSubmit,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (p: Omit<Product, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [buying, setBuying] = useState("");
  const [selling, setSelling] = useState("");
  const [unit, setUnit] = useState("");

  // Sync fields when the modal opens for a specific product
  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = open ? product?.id ?? "new" : null;
  if (key !== lastKey) {
    setLastKey(key);
    setName(product?.name ?? "");
    setCode(product?.code ?? "");
    setBuying(product ? String(product.buyingPrice) : "");
    setSelling(product ? String(product.sellingPrice) : "");
    setUnit(product?.unit ?? "");
  }

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      code: code.trim() || "PRD-000",
      buyingPrice: Number(buying) || 0,
      sellingPrice: Number(selling) || 0,
      unit: unit.trim() || "unit",
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-xl font-bold text-foreground">
        {product ? "Edit Product" : "Add Product"}
      </h3>
      <div className="mt-4 max-h-[62vh] space-y-3 overflow-y-auto pr-1">
        <FormRow label="Product Name" value={name} onChange={setName} placeholder="e.g. Cooking Oil 1L" />
        <FormRow label="Product Code" value={code} onChange={setCode} placeholder="PRD-001" />
        <FormRow label="Buying Price (₹)" value={buying} onChange={setBuying} placeholder="0" type="number" />
        <FormRow label="Selling Price (₹)" value={selling} onChange={setSelling} placeholder="0" type="number" />
        <FormRow label="Unit" value={unit} onChange={setUnit} placeholder="e.g. pack, kg, bottle" />
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-muted-foreground">
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground"
        >
          {product ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </Modal>
  );
}

function FormRow({
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
        inputMode={type === "number" ? "decimal" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 placeholder:text-muted-foreground"
      />
    </label>
  );
}
