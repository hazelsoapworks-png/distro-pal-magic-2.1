import { useState } from "react";
import {
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  User,
  Phone,
  Receipt,
  Banknote,
  X,
} from "lucide-react";
import { useStore, formatINR, type ShopStatus } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { Modal } from "@/components/modal";

type TabKey = "all" | "pending" | "ordered" | "paid";

const STATUS_META: Record<ShopStatus, { label: string; cls: string }> = {
  pending: { label: "Pending Visit", cls: "bg-warning-soft text-warning" },
  ordered: { label: "Order Taken", cls: "bg-brand-soft text-primary" },
  paid: { label: "Paid", cls: "bg-success-soft text-success" },
};

export function BeatDetailScreen({ beatId }: { beatId?: string }) {
  const {
    beats,
    shopsForBeat,
    duesForBeat,
    navigate,
    addShop,
    renameBeat,
    deleteShop,
    collectPayment,
  } = useStore();

  const beat = beats.find((b) => b.id === beatId);
  const shops = beat ? shopsForBeat(beat.id) : [];

  const [tab, setTab] = useState<TabKey>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [collectShop, setCollectShop] = useState<{ id: string; name: string; dues: number } | null>(null);

  if (!beat) {
    return (
      <div className="p-6">
        <AppHeader title="Beat" showBack rounded />
        <p className="mt-6 text-center text-muted-foreground">Beat not found.</p>
      </div>
    );
  }

  const visited = shops.filter((s) => s.status !== "pending").length;
  const counts = {
    all: shops.length,
    pending: shops.filter((s) => s.status === "pending").length,
    ordered: shops.filter((s) => s.status === "ordered").length,
    paid: shops.filter((s) => s.status === "paid").length,
  };
  const filtered =
    tab === "all" ? shops : shops.filter((s) => s.status === tab);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: `All Outlets (${counts.all})` },
    { key: "pending", label: `Pending Visit (${counts.pending})` },
    { key: "ordered", label: `Order Taken (${counts.ordered})` },
    { key: "paid", label: `Paid (${counts.paid})` },
  ];

  return (
    <div className="pb-6">
      <AppHeader
        title={`${beat.name} Beat`}
        subtitle={`${beat.area} • ${shops.length} Outlets`}
        showBack
        right={
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Beat options"
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
            >
              <MoreVertical className="size-6" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
                <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-2xl bg-card py-2 text-foreground shadow-xl ring-1 ring-black/5">
                  <MenuItem
                    icon={<Plus className="size-5 text-primary" />}
                    label="Add New Shop"
                    onClick={() => {
                      setMenuOpen(false);
                      setAddOpen(true);
                    }}
                  />
                  <MenuItem
                    icon={<Pencil className="size-5 text-teal" />}
                    label="Edit Beat Name"
                    onClick={() => {
                      setMenuOpen(false);
                      setRenameOpen(true);
                    }}
                  />
                  <MenuItem
                    icon={<Trash2 className="size-5 text-destructive" />}
                    label="Delete Shop"
                    danger
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteMode((v) => !v);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        }
      />

      {/* Progress bar */}
      <div className="flex items-center justify-between bg-brand-soft px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Visits Progress</p>
          <p className="font-bold text-primary">
            {visited} / {shops.length} Outlets Visited
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Beat Outstanding</p>
          <p className="font-bold text-warning">{formatINR(duesForBeat(beat.id))}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-5 overflow-x-auto border-b border-black/5 bg-card px-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 border-b-2 py-3 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {deleteMode && (
        <div className="mx-4 mt-4 flex items-center justify-between rounded-xl bg-warning-soft px-4 py-2.5 text-sm text-warning">
          <span>Tap the trash icon on a shop to delete it.</span>
          <button type="button" onClick={() => setDeleteMode(false)} aria-label="Exit delete mode">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Shop cards */}
      <div className="space-y-4 px-4 pt-4">
        {filtered.map((shop) => {
          const meta = STATUS_META[shop.status];
          return (
            <div key={shop.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-foreground">{shop.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>
                    {meta.label}
                  </span>
                  {deleteMode && (
                    <button
                      type="button"
                      onClick={() => deleteShop(shop.id)}
                      aria-label={`Delete ${shop.name}`}
                      className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-4 shrink-0" />
                {shop.owner} • {shop.phone}
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary" />
                {shop.address}
              </p>

              <div className="mt-3 rounded-xl bg-surface p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Outstanding Dues</p>
                    <p className="mt-0.5 text-lg font-bold text-warning">
                      {formatINR(shop.dues)}
                    </p>
                  </div>
                  {shop.status === "ordered" && shop.orderAmount != null && (
                    <span className="text-sm font-semibold text-primary">
                      Order: {formatINR(shop.orderAmount)}
                    </span>
                  )}
                  {shop.status === "paid" && shop.paidAmount != null && (
                    <span className="text-sm font-semibold text-success">
                      Paid: {formatINR(shop.paidAmount)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("orderBooking", { shopId: shop.id, beatId: beat.id })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
                >
                  <Receipt className="size-5" />
                  Order
                </button>
                <button
                  type="button"
                  onClick={() => setCollectShop({ id: shop.id, name: shop.name, dues: shop.dues })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success py-3 font-semibold text-white"
                >
                  <Banknote className="size-5" />
                  Collect
                </button>
                <a
                  href={`tel:${shop.phone.replace(/\s/g, "")}`}
                  aria-label={`Call ${shop.name}`}
                  className="flex size-12 items-center justify-center rounded-xl border border-black/10 bg-card text-primary"
                >
                  <Phone className="size-5" />
                </a>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">No outlets in this list.</p>
        )}
      </div>

      <AddShopModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(shop) => {
          addShop(beat.id, shop);
          setAddOpen(false);
        }}
      />
      <RenameBeatModal
        open={renameOpen}
        current={beat.name}
        onClose={() => setRenameOpen(false)}
        onSave={(name) => {
          renameBeat(beat.id, name);
          setRenameOpen(false);
        }}
      />
      <CollectModal
        shop={collectShop}
        onClose={() => setCollectShop(null)}
        onCollect={(amount, mode) => {
          if (collectShop) collectPayment(collectShop.id, amount, mode);
          setCollectShop(null);
        }}
      />
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
    >
      {icon}
      <span className={`font-medium ${danger ? "text-destructive" : "text-foreground"}`}>
        {label}
      </span>
    </button>
  );
}

function LabeledInput({
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

function AddShopModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (shop: { name: string; owner: string; phone: string; address: string; dues: number }) => void;
}) {
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dues, setDues] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      owner: owner.trim() || "Owner",
      phone: phone.trim() || "+91 90000 00000",
      address: address.trim() || "Address",
      dues: Number(dues) || 0,
    });
    setName("");
    setOwner("");
    setPhone("");
    setAddress("");
    setDues("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-xl font-bold text-foreground">Add New Shop</h3>
      <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        <LabeledInput label="Shop Name" value={name} onChange={setName} placeholder="e.g. Sharma Kirana Store" />
        <LabeledInput label="Owner Name" value={owner} onChange={setOwner} placeholder="e.g. Ramesh Sharma" />
        <LabeledInput label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 12345" />
        <LabeledInput label="Address" value={address} onChange={setAddress} placeholder="Shop address" />
        <LabeledInput label="Opening Dues (₹)" value={dues} onChange={setDues} placeholder="0" type="number" />
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
          Add Shop
        </button>
      </div>
    </Modal>
  );
}

function RenameBeatModal({
  open,
  current,
  onClose,
  onSave,
}: {
  open: boolean;
  current: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(current);

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-xl font-bold text-foreground">Edit Beat Name</h3>
      <div className="mt-4">
        <LabeledInput label="Beat Name" value={name} onChange={setName} placeholder="Enter beat name" />
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-muted-foreground">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave((name || current).trim())}
          className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

function CollectModal({
  shop,
  onClose,
  onCollect,
}: {
  shop: { id: string; name: string; dues: number } | null;
  onClose: () => void;
  onCollect: (amount: number, mode: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("UPI");

  return (
    <Modal open={!!shop} onClose={onClose}>
      <div className="flex items-center gap-2">
        <Banknote className="size-6 text-success" />
        <h3 className="text-xl font-bold text-foreground">Collect Payment</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {shop?.name} • Dues {shop ? formatINR(shop.dues) : ""}
      </p>
      <div className="mt-4 space-y-3">
        <LabeledInput label="Amount (₹)" value={amount} onChange={setAmount} placeholder="0" type="number" />
        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">Payment Mode</span>
          <div className="flex gap-2">
            {["UPI", "Cash", "Cheque"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-muted-foreground">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            const amt = Number(amount);
            if (amt > 0) onCollect(amt, mode);
          }}
          className="rounded-full bg-success px-6 py-2.5 font-semibold text-white"
        >
          Record Collection
        </button>
      </div>
    </Modal>
  );
}
