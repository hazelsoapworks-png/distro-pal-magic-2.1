import type { ScreenEntry, ScreenName, TabId } from "@/lib/types";

export const TAB_SCREENS: TabId[] = [
  "home",
  "beat",
  "accounts",
  "reports",
  "more",
];

export function initialNavigationStack(): ScreenEntry[] {
  return [{ name: "home" }];
}

export function isTabScreen(name: ScreenName): name is TabId {
  return TAB_SCREENS.includes(name as TabId);
}

export function sameScreen(
  first: ScreenEntry | undefined,
  second: ScreenEntry,
): boolean {
  if (!first) return false;

  return (
    first.name === second.name &&
    JSON.stringify(first.params ?? {}) === JSON.stringify(second.params ?? {})
  );
}

export function navigateStack(
  stack: ScreenEntry[],
  destination: ScreenEntry,
): ScreenEntry[] {
  const current = stack[stack.length - 1];

  if (sameScreen(current, destination)) {
    return stack;
  }

  if (isTabScreen(destination.name)) {
    return [destination];
  }

  return [...stack, destination];
}

export function goBackStack(stack: ScreenEntry[]): ScreenEntry[] {
  if (stack.length <= 1) {
    return stack;
  }

  return stack.slice(0, -1);
}
