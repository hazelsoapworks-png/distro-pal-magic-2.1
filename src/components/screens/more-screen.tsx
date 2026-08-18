import { useState, useMemo } from "react";
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
  LogOut,
  Chrome,
} from "lucide-react";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { Modal } from "@/components/modal";
import { signInWithGoogle, signOutGoogle } from "@/lib/google";

export function MoreScreen() {
  const {
    profile,
    updateProfile,
    syncEnabled,
    setSyncEnabled,
    googleEmail,
    setGoogleEmail,
    dailyTarget,
    setDailyTarget,
  } = useStore();
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetValue, setTargetValue] = useState(String(dailyTarget));
  const [profileOpen, setProfileOpen] = useState(false);
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  
  // Profile edit states including Company Name and GSTIN
  const [name, setName] = useState(profile.name);
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [gstin, setGstin] = useState(profile.gstin);

  const googleConnected = googleEmail.trim().length > 0;

  const openDpasFolder = async () => {
    try {
      const stats = await Filesystem.stat({
        path: "DPAS/data.json",
        directory: Directory.Documents,
      });
      alert(`Folder Found! File size: ${stats.size} bytes. Location: Documents/DPAS/data.json`);
    } catch (e) {
      alert("No data file found yet. Please perform some action to save data first.");
    }
  };

  const googleSubtitle = useMemo(() => {
    return googleConnected
      ? googleEmail
      : "Tap to Sign in with Google";
  }, [googleConnected, googleEmail]);

  const openProfile = () => {
    setName(profile.name);
    setCompanyName(profile.companyName);
    setPhone(profile.phone);
    setAddress(profile.address);
    setGstin(profile.gstin);
    setProfileOpen(true);
  };

  const saveProfile = () => {
    if (!name.trim()) return;
    updateProfile({
      name: name.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gstin: gstin.trim(),
    });
    setProfileOpen(false);
  };

  return (
    <div className="pb-6 max-w-7xl mx-auto w-full">
      <AppHeader title="Executive Settings & Profile" rounded />

      <div className="px-4 sm:px-6 pt-4">
        {/* Profile Card */}
        <div className="rounded-2xl bg-card p-4 sm:p-6 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-full bg-brand-soft text-primary">
              <UserRound className="size-8 sm:size-10" />
            </span>
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-lg sm:text-xl font-bold text-foreground truncate">{profile.companyName || profile.name}</p>
              <p className="text-sm sm:text-base text-muted-foreground truncate">Proprietor: {profile.name}</p>
              <p className="mt-0.5 text-xs sm:text-sm font-semibold text-primary truncate">GSTIN: {profile.gstin || "Not Set"}</p>
            </div>
            <button
              type="button"
              onClick={openProfile}
              aria-label="Edit profile"
              className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary cursor-pointer hover:bg-black/5 transition-colors"
            >
              <Pencil className="size-4 sm:size-5" />
            </button>
          </div>

          {(profile.phone || profile.address) && (
            <div className="mt-4 sm:mt-5 space-y-2 border-t border-black/5 pt-4">
              {profile.phone && (
                <p className="flex items-center gap-2.5 text-sm sm:text-base text-muted-foreground">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{profile.phone}</span>
                </p>
              )}
              {profile.address && (
                <p className="flex items-start gap-2.5 text-sm sm:text-base text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="line-clamp-2">{profile.address}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sync toggle */}
        <div className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4 rounded-2xl bg-card p-4 sm:p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow">
          <span className="flex size-11 sm:size-12 items-center justify-center rounded-full bg-brand-soft text-primary shrink-0">
            <RefreshCcw className="size-5 sm:size-6" />
          </span>
          <div className="flex-1 min-w-0 pr-2">
            <p className="font-semibold text-foreground text-base sm:text-lg truncate">Real-Time Data Sync</p>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {syncEnabled ? "Connected to Central ERP" : "Sync paused"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={syncEnabled}
            aria-label="Toggle real-time data sync"
            onClick={() => setSyncEnabled(!syncEnabled)}
            className={`relative h-7 w-12 sm:h-8 sm:w-14 shrink-0 rounded-full transition-colors cursor-pointer ${
              syncEnabled ? "bg-primary" : "bg-black/20"
            }`}
          >
            <span
              className={`absolute top-1 sm:top-1.5 size-5 rounded-full bg-card transition-all ${
                syncEnabled ? "left-6 sm:left-8" : "left-1 sm:left-1.5"
              }`}
            />
          </button>
        </div>

        <h2 className="mb-3 sm:mb-4 mt-6 sm:mt-8 text-lg sm:text-xl font-bold text-foreground">Configuration & Tools</h2>
        
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ToolRow
            icon={<Mail className="size-5 sm:size-6" />}
            title="Google Account"
            subtitle={googleSubtitle}
            onClick={() => setGoogleDialogOpen(true)}
          />

          <ToolRow
            icon={<FolderOpen className="size-5 sm:size-6" />}
            title="Open DPAS Folder"
            subtitle="Check local backup status"
            onClick={openDpasFolder}
          />
          
          <ToolRow
            icon={<SlidersHorizontal className="size-5 sm:size-6" />}
            title="Target Settings"
            subtitle={`Daily target: ${formatINR(dailyTarget)}`}
            onClick={() => {
              setTargetValue(String(dailyTarget));
              setTargetOpen(true);
            }}
          />
        </div>
      </div>

      {/* Edit profile Modal */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)}>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">Edit Distributor Profile</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your firm details, GSTIN, and contact info for invoices.
        </p>
        <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <Labelled label="Company / Firm Name">
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. SalesBeat Distributors"
              className="w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
            />
          </Labelled>

          <Labelled label="Proprietor / Owner Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
            />
          </Labelled>

          <Labelled label="GSTIN Number">
            <input
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              placeholder="27AABCS1429B1ZX"
              className="w-full rounded-xl bg-surface px-3.5 py-3 text-base text-foreground uppercase outline-none ring-1 ring-transparent focus:ring-primary/40"
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

          <Labelled label="Business Address">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Full office or warehouse address"
              className="w-full resize-none rounded-xl bg-surface px-3.5 py-3 text-base text-foreground outline-none ring-1 ring-transparent focus:ring-primary/40"
            />
          </Labelled>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setProfileOpen(false)}
            className="px-4 py-2 font-semibold text-muted-foreground cursor-pointer hover:bg-black/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveProfile}
            className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </Modal>

      {/* Target Settings Modal */}
      <Modal open={targetOpen} onClose={() => setTargetOpen(false)}>
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">Target Settings</h3>
        <label className="mt-4 sm:mt-5 block">
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
            className="px-4 py-2 font-semibold text-muted-foreground cursor-pointer hover:bg-black/5 rounded-xl transition-colors"
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
            className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </Modal>

      {/* Google Auth Modal */}
      <Modal
        open={googleDialogOpen}
        onClose={() => setGoogleDialogOpen(false)}
      >
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">
          {googleConnected ? "Google Account" : "Google Sign In"}
        </h3>

        <div className="mt-4 sm:mt-5 rounded-xl border border-black/10 bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </p>

          {googleConnected ? (
            <>
              <p className="mt-2 font-semibold text-green-600">
                Connected
              </p>
              <p className="mt-1 text-sm text-foreground break-all">
                {googleEmail}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 font-semibold text-amber-600">
                Not Connected
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Continue with your Google Account.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setGoogleDialogOpen(false)}
            className="px-4 py-2 font-semibold text-muted-foreground cursor-pointer hover:bg-black/5 rounded-xl transition-colors"
          >
            {googleConnected ? "Close" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={async () => {
              if (googleConnected) {
                await signOutGoogle();
                setGoogleEmail("");
              } else {
                const result = await signInWithGoogle();
                if (result.success) {
                  setGoogleEmail(result.email);
                } else {
                  console.log("Google Sign In Failed");
                }
              }
              setGoogleDialogOpen(false);
            }}
            className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center gap-2">
              {googleConnected ? (
                <LogOut className="size-4" />
              ) : (
                <Chrome className="size-4" />
              )}
              {googleConnected ? "Sign Out" : "Sign in with Google"}
            </span>
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
      className={`flex w-full items-center gap-3 sm:gap-4 rounded-2xl bg-card p-4 sm:p-5 text-left shadow-sm ring-1 ring-black/5 transition-all active:scale-95 cursor-pointer hover:shadow-md ${
        placeholder ? "opacity-60" : ""
      }`}
    >
      <span className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-primary">
        {icon}
      </span>
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-semibold text-foreground text-base sm:text-lg truncate">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </button>
  );
}