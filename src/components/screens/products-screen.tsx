import { useRef, useState } from "react";
import { Camera, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  useStore,
  formatINR,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  type Product,
  type ProductCategory,
} from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { Modal } from "@/components/modal";

export function ProductsScreen() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  return (
    <div className="pb-6 max-w-7xl mx-auto w-full">
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
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25 cursor-pointer"
          >
            <Plus className="size-5" />
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-6 pt-4">
        {products.map((p) => {
          const margin = p.sellingPrice - p.buyingPrice;
          return (
            <div key={p.id} className="flex flex-col justify-between rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 sm:gap-4">
                <ProductThumb src={p.imageUrl} name={p.name} />
                <div className="min-w-0 flex-1 pr-1">
                  <p className="font-bold text-foreground text-base sm:text-lg truncate">{p.name}</p>
                  <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground truncate">
                    Code: {p.code} • per {p.unit}
                  </p>
                  {(p.category || p.hasVariants) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.category && (
                        <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-primary">
                          {p.category}
                        </span>
                      )}
                      {p.hasVariants && (
                        <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-warning">
                          {p.shades && p.shades.length > 0 ? `${p.shades.length} shades` : "Shades"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    aria-label={`Edit ${p.name}`}
                    className="flex size-8 sm:size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-primary cursor-pointer"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductToDelete(p)}
                    aria-label={`Delete ${p.name}`}
                    className="flex size-8 sm:size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 sm:mt-5 flex items-center justify-between rounded-xl bg-surface px-3.5 py-3">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-medium">Selling Price</p>
                  <p className="mt-0.5 text-lg sm:text-xl font-bold text-primary truncate">{formatINR(p.sellingPrice)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground font-medium">Margin</p>
                  <p className="mt-0.5 text-sm sm:text-base font-semibold text-success">{formatINR(margin)}</p>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No products yet. Tap + to add one.
          </div>
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

      {/* Delete Confirmation Modal */}
      <Modal open={productToDelete !== null} onClose={() => setProductToDelete(null)}>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">Delete Product</h3>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          Are you sure you want to delete <span className="font-semibold text-foreground">{productToDelete?.name}</span>?
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setProductToDelete(null)}
            className="px-4 py-2 font-semibold text-muted-foreground cursor-pointer hover:bg-black/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (productToDelete) {
                deleteProduct(productToDelete.id);
                setProductToDelete(null);
              }
            }}
            className="rounded-full bg-red-500 px-6 py-2.5 font-semibold text-white cursor-pointer hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ProductThumb({ src, name }: { src?: string; name: string }) {
  const base =
    "flex size-[64px] sm:size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft";
  if (src) {
    return (
      <div className={base}>
        <img src={src} alt={name} className="size-full object-cover" />
      </div>
    );
  }
  return (
    <div className={base}>
      <Camera className="size-6 sm:size-7 text-primary/60" />
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
  const [unit, setUnit] = useState<string>("Pcs");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [hasVariants, setHasVariants] = useState(false);
  const [shades, setShades] = useState<string[]>([]);
  const [shadeInput, setShadeInput] = useState("");
  const [opening, setOpening] = useState("");
  const [threshold, setThreshold] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = open ? product?.id ?? "new" : null;
  if (key !== lastKey) {
    setLastKey(key);
    setName(product?.name ?? "");
    setCode(product?.code ?? "");
    setBuying(product ? String(product.buyingPrice) : "");
    setSelling(product ? String(product.sellingPrice) : "");
    setUnit(product?.unit ?? "Pcs");
    setImageUrl(product?.imageUrl);
    setCategory(product?.category ?? "");
    setHasVariants(product?.hasVariants ?? false);
    setShades(product?.shades ?? []);
    setShadeInput("");
    setOpening(product ? String(product.openingStock) : "");
    setThreshold(product ? String(product.lowStockThreshold) : "");
  }

  const onPickFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addShade = () => {
    const v = shadeInput.trim();
    if (!v) return;
    setShades((prev) => [...prev, v]);
    setShadeInput("");
  };

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      code: code.trim() || "PRD-000",
      buyingPrice: Number(buying) || 0,
      sellingPrice: Number(selling) || 0,
      unit: unit.trim() || "Pcs",
      imageUrl,
      category: category || undefined,
      hasVariants,
      shades: hasVariants ? shades : [],
      openingStock: Number(opening) || 0,
      lowStockThreshold: Number(threshold) || 0,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-xl sm:text-2xl font-bold text-foreground">
        {product ? "Edit Product" : "Add Product"}
      </h3>
      <div className="mt-4 sm:mt-5 max-h-[60vh] sm:max-h-[65vh] space-y-3 sm:space-y-4 overflow-y-auto pr-1">
        {/* Image upload */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">Product Image</span>
          <div className="flex items-center gap-4">
            <div className="relative flex size-20 sm:size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface ring-1 ring-black/5">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Preview" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(undefined)}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white cursor-pointer hover:bg-black/80 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </>
              ) : (
                <Camera className="size-6 sm:size-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-xl bg-brand-soft px-3 py-2 sm:py-2.5 text-sm font-semibold text-primary cursor-pointer hover:bg-primary/10 transition-colors"
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

        {/* Category */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory | "")}
            className="w-full rounded-xl bg-surface px-3.5 py-3 sm:py-3.5 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 cursor-pointer"
          >
            <option value="">Select category</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <FormRow label="Product Name" value={name} onChange={setName} placeholder="e.g. Matte Lipstick" />
        <FormRow label="Product Code (SKU)" value={code} onChange={setCode} placeholder="PRD-001" />

        {/* Unit */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Unit</span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-xl bg-surface px-3.5 py-3 sm:py-3.5 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 cursor-pointer"
          >
            {PRODUCT_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <FormRow label="Cost / Buying (₹)" value={buying} onChange={setBuying} placeholder="0" type="number" />
          <FormRow label="Selling / MRP (₹)" value={selling} onChange={setSelling} placeholder="0" type="number" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <FormRow label="Opening Stock" value={opening} onChange={setOpening} placeholder="0" type="number" />
          <FormRow label="Low Stock Alert" value={threshold} onChange={setThreshold} placeholder="0" type="number" />
        </div>

        {/* Variants toggle */}
        <div className="rounded-xl bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="pr-2">
              <p className="text-sm sm:text-base font-medium text-foreground">Has Shades / Variants?</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Enable for cosmetics shades or numbers</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hasVariants}
              onClick={() => setHasVariants((v) => !v)}
              className={`relative h-7 w-12 sm:h-8 sm:w-14 shrink-0 rounded-full transition-colors cursor-pointer ${
                hasVariants ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-1 sm:top-1.5 size-5 rounded-full bg-white shadow transition-transform ${
                  hasVariants ? "translate-x-6 sm:translate-x-8" : "translate-x-1 sm:translate-x-1.5"
                }`}
              />
            </button>
          </div>

          {hasVariants && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2 sm:gap-3">
                <input
                  value={shadeInput}
                  onChange={(e) => setShadeInput(e.target.value)}
                  placeholder="e.g. Shade 01, Natural Beige"
                  className="flex-1 rounded-xl bg-card px-3.5 py-2.5 sm:py-3 text-sm sm:text-base outline-none ring-1 ring-black/5 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={addShade}
                  className="rounded-xl bg-primary px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
              </div>
              {shades.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {shades.map((s, i) => (
                    <span
                      key={`${s}-${i}`}
                      className="flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs sm:text-sm font-medium text-primary"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => setShades((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label={`Remove ${s}`}
                        className="cursor-pointer hover:text-primary/70 transition-colors"
                      >
                        <X className="size-3.5 sm:size-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 sm:gap-4 border-t border-black/5 pt-4 sm:pt-5">
        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-muted-foreground cursor-pointer hover:bg-black/5 rounded-xl transition-colors">
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="rounded-full bg-primary px-6 py-2.5 sm:py-3 font-semibold text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
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
        className="w-full rounded-xl bg-surface px-3.5 py-3 sm:py-3.5 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 placeholder:text-muted-foreground"
      />
    </label>
  );
}