import { useRef, useState } from "react";
import { Camera, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  useStore,
  formatINR,
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategory,
} from "@/lib/store";
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
                <ProductThumb src={p.imageUrl} name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Code: {p.code} • per {p.unit}
                  </p>
                  {(p.category || p.hasVariants) && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {p.category && (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-primary">
                          {p.category}
                        </span>
                      )}
                      {p.hasVariants && (
                        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                          Shades
                        </span>
                      )}
                    </div>
                  )}
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

function ProductThumb({ src, name }: { src?: string; name: string }) {
  const base =
    "flex size-[65px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft";
  if (src) {
    return (
      <div className={base}>
        <img src={src} alt={name} className="size-full object-cover" />
      </div>
    );
  }
  return (
    <div className={base}>
      <Camera className="size-6 text-primary/60" />
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
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [hasVariants, setHasVariants] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = open ? product?.id ?? "new" : null;
  if (key !== lastKey) {
    setLastKey(key);
    setName(product?.name ?? "");
    setCode(product?.code ?? "");
    setBuying(product ? String(product.buyingPrice) : "");
    setSelling(product ? String(product.sellingPrice) : "");
    setUnit(product?.unit ?? "");
    setImageUrl(product?.imageUrl);
    setCategory(product?.category ?? "");
    setHasVariants(product?.hasVariants ?? false);
  }

  const onPickFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      code: code.trim() || "PRD-000",
      buyingPrice: Number(buying) || 0,
      sellingPrice: Number(selling) || 0,
      unit: unit.trim() || "unit",
      imageUrl,
      category: category || undefined,
      hasVariants,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-xl font-bold text-foreground">
        {product ? "Edit Product" : "Add Product"}
      </h3>
      <div className="mt-4 max-h-[62vh] space-y-3 overflow-y-auto pr-1">
        {/* Image upload */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">Product Image</span>
          <div className="flex items-center gap-3">
            <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-xl bg-surface ring-1 ring-black/5">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Preview" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(undefined)}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </>
              ) : (
                <Camera className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-xl bg-brand-soft px-3 py-2 text-sm font-semibold text-primary"
              >
                {imageUrl ? "Change photo" : "Upload photo"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />
            </div>
          </div>
        </div>

        <FormRow label="Product Name" value={name} onChange={setName} placeholder="e.g. Matte Lipstick" />
        <FormRow label="Product Code" value={code} onChange={setCode} placeholder="PRD-001" />

        {/* Category */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory | "")}
            className="w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
          >
            <option value="">Select category</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <FormRow label="Buying Price (₹)" value={buying} onChange={setBuying} placeholder="0" type="number" />
        <FormRow label="Selling Price (₹)" value={selling} onChange={setSelling} placeholder="0" type="number" />
        <FormRow label="Unit" value={unit} onChange={setUnit} placeholder="e.g. pack, kg, bottle" />

        {/* Variants toggle */}
        <div className="flex items-center justify-between rounded-xl bg-surface px-3.5 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Shades / Variants</p>
            <p className="text-xs text-muted-foreground">Enable for cosmetics shades or numbers</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hasVariants}
            onClick={() => setHasVariants((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              hasVariants ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                hasVariants ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
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
