import { useState } from "react";
import {
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Receipt,
  Banknote,
  X,
  Search,
  MessageCircle,
  LocateFixed,
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filtered = shops
    .filter((s) => (tab === "all" ? true : s.status === tab))
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: `All Outlets (${counts.all})` },
    { key: "pending", label: `Pending Visit (${counts.pending})` },
    { key: "ordered", label: `Order Taken (${counts.ordered})` },
    { key: "paid", label: `Paid (${counts.paid})` },
  ];

  const sendWhatsApp = (phone: string, message: string) => {
    if (!phone) return;
    const url = `https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pb-6 max-w-7xl mx-auto w-full">
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
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/15 cursor-pointer"
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

      {/* Search Bar */}
      <div className="bg-card px-4 sm:px-6 py-3 border-b border-black/5">
        <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search outlet name..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-brand-soft px-4 sm:px-6 py-3">
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

      <div className="flex gap-5 overflow-x-auto border-b border-black/5 bg-card px-4 sm:px-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 border-b-2 py-3 text-sm font-semibold transition-colors cursor-pointer ${
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
        <div className="mx-4 sm:mx-6 mt-4 flex items-center justify-between rounded-xl bg-warning-soft px-4 py-2.5 text-sm text-warning">
          <span>Tap the trash icon on a shop to delete it.</span>
          <button type="button" onClick={() => setDeleteMode(false)} aria-label="Exit delete mode" className="cursor-pointer p-1">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Grid Layout Starts Here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-6 pt-4">
        {filtered.map((shop) => {
          const meta = STATUS_META[shop.status];
          return (
            <div key={shop.id} className="flex flex-col justify-between rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
              
              {/* Top Section */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-foreground truncate pr-2">{shop.name}</h2>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>
                        {meta.label}
                      </span>
                      {deleteMode && (
                        <button
                          type="button"
                          onClick={() => deleteShop(shop.id)}
                          className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Last Order: {shop.lastOrderDate || "Never"}
                    </span>
                  </div>
                </div>

                {/* Clickable Map Address */}
                <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-primary line-clamp-2"
                  >
                    {shop.address.includes("http") ? "View Location on Map" : shop.address}
                  </a>
                </p>

                <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="hover:underline">
                    {shop.phone}
                  </a>
                </p>

                <p 
                  className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-success transition-colors w-fit"
                  onClick={() => sendWhatsApp(shop.whatsapp || shop.phone, "Hello, regarding your store order")}
                >
                  <MessageCircle className="size-4 shrink-0 text-success" />
                  {shop.whatsapp || shop.phone}
                </p>
              </div>

              {/* Bottom Section */}
              <div className="mt-4 pt-2 border-t border-black/5">
                <div className="rounded-xl bg-surface p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Outstanding</p>
                      <p className="mt-0.5 text-lg font-bold text-warning">
                        {formatINR(shop.dues)}
                      </p>
                    </div>
                    <div className="text-right">
                      {shop.status === "ordered" && shop.orderAmount != null && (
                        <span className="block text-sm font-semibold text-primary">
                          Order: {formatINR(shop.orderAmount)}
                        </span>
                      )}
                      {shop.status === "paid" && shop.paidAmount != null && (
                        <span className="block text-sm font-semibold text-success">
                          Paid: {formatINR(shop.paidAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("orderBooking", { shopId: shop.id, beatId: beat.id })}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Receipt className="size-5" />
                    Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectShop({ id: shop.id, name: shop.name, dues: shop.dues })}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success py-3 font-semibold text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    <Banknote className="size-5" />
                    Collect
                  </button>
                  <a
                    href={`tel:${shop.phone.replace(/\s/g, "")}`}
                    className="flex size-12 items-center justify-center rounded-xl border border-black/10 bg-card text-primary hover:bg-surface transition-colors cursor-pointer"
                  >
                    <Phone className="size-5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No outlets in this list.
          </div>
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
        shops={shops}
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
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface cursor-pointer"
    >
      {icon}
      <span className={`font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{label}</span>
    </button>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  actionIcon,
  onAction,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40 placeholder:text-muted-foreground ${
            actionIcon ? "pr-12" : ""
          }`}
        />
        {actionIcon && (
          <button
            type="button"
            onClick={onAction}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            title="Get Current Location"
          >
            {actionIcon}
          </button>
        )}
      </div>
    </label>
  );
}

function AddShopModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (shop: any) => void }) {
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [dues, setDues] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      owner: owner.trim() || "Owner",
      phone: phone.trim() || "+91 90000 00000",
      whatsapp: whatsapp.trim() || phone.trim() || "+91 90000 00000",
      address: address.trim() || "Address",
      dues: Number(dues) || 0,
    });
    setName("");
    setOwner("");
    setPhone("");
    setWhatsapp("");
    setAddress("");
    setDues("");
  };

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const mapLink = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
          setAddress(address ? `${address} - ${mapLink}` : mapLink);
        },
        () => alert("Please turn on GPS/Location permissions.")
      );
    } else {
      alert("GPS is not supported on this device.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-xl font-bold text-foreground">Add New Shop</h3>
      <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        <LabeledInput label="Shop Name" value={name} onChange={setName} placeholder="e.g. Sharma Kirana Store" />
        <LabeledInput label="Owner Name" value={owner} onChange={setOwner} placeholder="e.g. Ramesh Sharma" />
        <LabeledInput label="Calling Phone" value={phone} onChange={setPhone} placeholder="+91 98765 12345" type="tel" />
        <LabeledInput label="WhatsApp Number" value={whatsapp} onChange={setWhatsapp} placeholder="Leave empty if same as above" type="tel" />
        <LabeledInput
          label="Address (Tap icon for GPS)"
          value={address}
          onChange={setAddress}
          placeholder="Shop address"
          actionIcon={<LocateFixed className="size-5" />}
          onAction={handleGPS}
        />
        <LabeledInput label="Opening Dues (₹)" value={dues} onChange={setDues} placeholder="0" type="number" />
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-muted-foreground cursor-pointer">
          Cancel
        </button>
        <button type="button" onClick={submit} className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground cursor-pointer">
          Add Shop
        </button>
      </div>
    </Modal>
  );
}

function RenameBeatModal({ open, current, onClose, onSave }: { open: boolean; current: string; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(current);

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-xl font-bold text-foreground">Edit Beat Name</h3>
      <div className="mt-4">
        <LabeledInput label="Beat Name" value={name} onChange={setName} placeholder="Enter beat name" />
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-muted-foreground cursor-pointer">
          Cancel
        </button>
        <button type="button" onClick={() => onSave((name || current).trim())} className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground cursor-pointer">
          Save
        </button>
      </div>
    </Modal>
  );
}

function CollectModal({
  shop,
  shops,
  onClose,
  onCollect,
}: {
  shop: { id: string; name: string; dues: number } | null;
  shops: any[];
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
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-colors ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:bg-black/5"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-muted-foreground cursor-pointer">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            const amt = Number(amount);
            if (amt > 0) {
              onCollect(amt, mode);
              if (shop) {
                const remaining = Math.max(0, shop.dues - amt);
                const msg = `Payment received from ${shop.name}: ₹${amt} via ${mode}. Remaining dues: ₹${remaining}`;
                const shopData = shops.find((s) => s.id === shop.id);
                const phone = shopData?.whatsapp || shopData?.phone || "";
                if (phone) {
                  const url = `https://wa.me/91${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
                  window.open(url, '_blank');
                }
              }
            }
          }}
          className="rounded-full bg-success px-6 py-2.5 font-semibold text-white cursor-pointer hover:bg-emerald-600 transition-colors"
        >
          Record Collection
        </button>
      </div>
    </Modal>
  );
}