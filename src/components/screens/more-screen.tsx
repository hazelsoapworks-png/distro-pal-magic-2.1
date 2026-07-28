import { useState } from "react";
import {
  UserRound,
  RefreshCcw,
  SlidersHorizontal,
  Printer,
  DatabaseBackup,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";
import { useStore, formatINR } from "@/lib/store";
import { AppHeader } from "@/components/app-header";
import { Modal } from "@/components/modal";

export function MoreScreen() {
  const { profile, syncEnabled, setSyncEnabled, dailyTarget, setDailyTarget } = useStore();
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetValue, setTargetValue] = useState(String(dailyTarget));

  return (
    <div className="pb-6">
      <AppHeader title="Executive Settings & Profile" rounded />

      <div className="px-4 pt-4">
        {/* Profile */}
        <div className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-black/5">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-primary">
            <UserRound className="size-8" />
          </span>
          <div>
            <p className="text-lg font-bold text-foreground">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
            <p className="mt-0.5 text-sm font-medium text-primary">{profile.zone}</p>
          </div>
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
            icon={<SlidersHorizontal className="size-5" />}
            title="Target Settings"
            subtitle={`Daily target: ${formatINR(dailyTarget)}`}
            onClick={() => {
              setTargetValue(String(dailyTarget));
              setTargetOpen(true);
            }}
          />
          <ToolRow
            icon={<Printer className="size-5" />}
            title="Bluetooth Receipt Printer"
            subtitle="Thermal Printer - Disconnected"
          />
          <ToolRow
            icon={<DatabaseBackup className="size-5" />}
            title="Sync Offline Database"
            subtitle="All orders & collections backed up"
          />
          <ToolRow
            icon={<LifeBuoy className="size-5" />}
            title="Help & Support Hotline"
            subtitle="Talk to your regional supervisor"
          />
        </div>
      </div>

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

function ToolRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm ring-1 ring-black/5"
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
