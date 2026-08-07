import { useState } from "react";
import {
  Search,
  Plus,
  Map,
  MapPin,
  Pencil,
  Trash2,
  ArrowLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { Modal } from "@/components/modal";

export function BeatScreen() {
  const {
  beats,
  shopsForBeat,
  duesForBeat,
  navigate,
  goBack,
  addBeat,
  renameBeat,
  deleteBeat,
} = useStore();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editBeat, setEditBeat] = useState<{ id: string; name: string } | null>(null);

  const filtered = beats.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.area.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative pb-24">
      <header className="app-safe-top rounded-b-3xl bg-primary px-4 pb-5 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Beat Management</h1>
            <p className="mt-0.5 text-sm text-primary-foreground/85">
              {beats.length} Active Beats Listed
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            aria-label="Add beat"
            className="flex size-10 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
          >
            <Plus className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card px-4 py-3">
          <Search className="size-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search beats or area..."
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <div className="space-y-4 px-4 pt-4">
        {filtered.map((b) => {
          const shops = shopsForBeat(b.id);
          const pending = shops.filter((s) => s.status === "pending").length;
          return (
            <div key={b.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-primary">
                  <Map className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-foreground">{b.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    {b.area}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditBeat({ id: b.id, name: b.name })}
                  aria-label={`Edit ${b.name}`}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Pencil className="size-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface px-3 py-3 text-center">
                <Metric label="Total Outlets" value={`${shops.length} Shops`} />
                <Metric label="Pending Visit" value={`${pending} Pending`} accent="text-primary" />
                <Metric
                  label="Outstanding Dues"
                  value={formatINR(duesForBeat(b.id))}
                  accent="text-warning"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-primary">
                  Active Beat Route
                </span>
                <button
                  type="button"
                  onClick={() => navigate("beatDetail", { beatId: b.id })}
                  className="flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  Manage Outlets <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">No beats match your search.</p>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        aria-label="Add new beat"
        style={{ transform: "translateX(calc(min(14rem, 50vw) - 4rem))" }}
        className="fixed bottom-24 left-1/2 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        <Plus className="size-7" />
      </button>

      <AddBeatModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addBeat} />
      <EditBeatModal
        beat={editBeat}
        onClose={() => setEditBeat(null)}
        onSave={(id, name) => {
          renameBeat(id, name);
          setEditBeat(null);
        }}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function AddBeatModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, area: string) => void;
}) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), area.trim() || "New Area");
    setName("");
    setArea("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center gap-2">
        <MapPin className="size-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Add New Beat</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Fill in the details below to create a new distribution beat.
      </p>
      <div className="mt-5 space-y-3">
        <Field icon={<Store className="size-5" />}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Beat Name"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </Field>
        <Field icon={<MapPin className="size-5" />}>
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Enter Area Name"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </Field>
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
          Add Beat
        </button>
      </div>
    </Modal>
  );
}

function EditBeatModal({
  beat,
  onClose,
  onSave,
}: {
  beat: { id: string; name: string } | null;
  onClose: () => void;
  onSave: (id: string, name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <Modal open={!!beat} onClose={onClose}>
      <div className="flex items-center gap-2">
        <Pencil className="size-5 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Edit Beat Name</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Current: {beat?.name}</p>
      <div className="mt-5">
        <Field icon={<Store className="size-5" />}>
          <input
            defaultValue={beat?.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter new beat name"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </Field>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-muted-foreground">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => beat && onSave(beat.id, (name || beat.name).trim())}
          className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface px-3.5 py-3 text-primary">
      {icon}
      <div className="flex-1 text-foreground">{children}</div>
    </div>
  );
}
