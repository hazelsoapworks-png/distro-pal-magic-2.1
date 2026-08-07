import {
  UserRound,
  RefreshCcw,
  SlidersHorizontal,
  FolderOpen,
  Mail,
  ChevronRight,
  Pencil,
  Phone,
  MapPin,
} from "lucide-react";
import {
  UserRound,
  RefreshCcw,
  SlidersHorizontal,
  Printer,
  DatabaseBackup,
  LifeBuoy,
  ChevronRight,
  Pencil,
  Phone,
  MapPin,
} from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { Modal } from "@/components/modal";

export function MoreScreen() {
  const {
    profile,
    updateProfile,
    syncEnabled,
    setSyncEnabled,
    dailyTarget,
    setDailyTarget,
  } = useStore();
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetValue, setTargetValue] = useState(String(dailyTarget));
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);

  const openProfile = () => {
    setName(profile.name);
    setPhone(profile.phone);
    setAddress(profile.address);
    setProfileOpen(true);
  };

  const saveProfile = () => {
    if (!name.trim()) return;
    updateProfile({ name: name.trim(), phone: phone.trim(), address: address.trim() });
    setProfileOpen(false);
  };

  return (
    <div className="pb-6">
      <AppHeader title="Executive Settings & Profile" rounded />

      <div className="px-4 pt-4">
        {/* Profile */}
        <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-soft text-primary">
              <UserRound className="size-8" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-foreground">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
              <p className="mt-0.5 text-sm font-medium text-primary">{profile.zone}</p>
            </div>
            <button
              type="button"
              onClick={openProfile}
              aria-label="Edit profile"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary"
            >
              <Pencil className="size-4" />
            </button>
          </div>

          {(profile.phone || profile.address) && (
            <div className="mt-3 space-y-1.5 border-t border-black/5 pt-3">
              {profile.phone && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-4 shrink-0 text-primary" />
                  {profile.phone}
                </p>
              )}
              {profile.address && (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  {profile.address}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sync toggle */}
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-primary">
            <RefreshCcw className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Real-Time Data Sync</p>
            <p className="text-sm text-muted-foreground">
              {syncEnabled ? "Connected to Central ERP" : "Sync paused"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={syncEnabled}
            aria-label="Toggle real-time data sync"
            onClick={() => setSyncEnabled(!syncEnabled)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              syncEnabled ? "bg-primary" : "bg-black/20"
            }`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-card transition-all ${
                syncEnabled ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        <h2 className="mb-3 mt-6 text-lg font-bold text-foreground">Configuration & Tools</h2>
        <div className="space-y-3">
         <ToolRow
  icon={<Mail className="size-5" />}
  title="Google Account"
  subtitle="Not Connected"
  onClick={() => {
    // Step 2
  }}
/>

<ToolRow
  icon={<FolderOpen className="size-5" />}
  title="Open DPAS Folder"
  subtitle="Open File Manager"
  onClick={() => {
    // Step 4
  }}
/>
          <ToolRow
            icon={<SlidersHorizontal className="size-5" />}
            title="Target Settings"
            subtitle={`Daily target: ${formatINR(dailyTarget)}`}
            onClick={() => {
              setTargetValue(String(dailyTarget));
              setTargetOpen(true);
            }}
          />
          {/* Placeholders — functionality intentionally not implemented yet. */}
        </div>
      </div>

      {/* Edit profile */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)}>
        <h3 className="text-xl font-bold text-foreground">Edit Profile</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Saved on this device and kept after restart.
        </p>
        <div className="mt-4 space-y-3">
          <Labelled label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
            />
          </Labelled>
          <Labelled label="Mobile Number">
            <input
              value={phone}
              inputMode="tel"
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 90000 00000"
              className="w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
            />
          </Labelled>
          <Labelled label="Address">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Address"
              className="w-full resize-none rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
            />
          </Labelled>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setProfileOpen(false)}
            className="px-4 py-2 font-semibold text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveProfile}
            className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground"
          >
            Save
          </button>
        </div>
      </Modal>

      <Modal open={targetOpen} onClose={() => setTargetOpen(false)}>
        <h3 className="text-xl font-bold text-foreground">Target Settings</h3>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Daily Sales Target (₹)
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
          />
        </label>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setTargetOpen(false)}
            className="px-4 py-2 font-semibold text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const v = Number(targetValue);
              if (v > 0) setDailyTarget(v);
              setTargetOpen(false);
            }}
            className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function ToolRow({
  icon,
  title,
  subtitle,
  onClick,
  placeholder,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  placeholder?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={placeholder}
      className={`flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-black/5 ${
        placeholder ? "opacity-60" : ""
      }`}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-primary">
        {icon}
      </span>
      <div className="flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="size-5 text-muted-foreground" />
    </button>
  );
}
