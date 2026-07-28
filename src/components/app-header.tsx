import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ReactNode } from "react";

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  right,
  rounded = false,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  rounded?: boolean;
}) {
  const { goBack } = useStore();

  return (
    <header
      className={`bg-primary text-primary-foreground px-4 pt-5 pb-6 ${
        rounded ? "rounded-b-3xl" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {showBack && (
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back one step"
            className="mt-0.5 -ml-1 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15 active:bg-white/25"
          >
            <ArrowLeft className="size-6" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-tight text-balance">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-primary-foreground/85">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
