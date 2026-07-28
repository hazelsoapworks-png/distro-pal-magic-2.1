import { Home, Map, Wallet, BarChart3, MoreHorizontal } from "lucide-react";
import { useStore, type TabId } from "@/lib/store";

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "beat", label: "Beat", icon: Map },
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "more", label: "More", icon: MoreHorizontal },
];

export function BottomNav() {
  const { activeTab, switchTab } = useStore();

  return (
    <nav className="shrink-0 border-t border-black/5 bg-card px-2 pb-2 pt-2">
      <ul className="flex items-center justify-between">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => switchTab(id)}
                aria-current={active ? "page" : undefined}
                className="flex w-full flex-col items-center gap-1 py-1"
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-brand-soft text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <span
                  className={`text-xs font-medium ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
