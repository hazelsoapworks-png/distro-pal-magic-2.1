/**
 * DPAS local persistence layer.
 *
 * Goals:
 *  - Offline-first: everything lives in the device's localStorage.
 *  - Seed/demo data is written ONLY on first install.
 *  - User data is NEVER overwritten by demo data on later launches.
 *  - Schema changes are handled by explicit, ordered migrations so that
 *    future app updates preserve existing user data.
 */

export const STORAGE_KEY = "dpas.state";
export const SCHEMA_VERSION = 2;

type Data = Record<string, unknown>;

type Envelope = {
  version: number;
  savedAt: string;
  data: Data;
};

/**
 * Ordered migrations. Key = the version the migration upgrades TO.
 * Each migration receives the previous data shape and returns the new one.
 * Never delete a migration — older installs may still be on an old version.
 */
const migrations: Record<number, (data: Data) => Data> = {
  // v1 -> v2: profile gained editable phone + address fields.
  2: (data) => {
    const profile = (data.profile as Data | undefined) ?? {};
    return {
      ...data,
      profile: {
        phone: "",
        address: "",
        ...profile,
      },
    };
  },
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readEnvelope(): Envelope | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Envelope>;
    if (!parsed || typeof parsed !== "object" || typeof parsed.data !== "object") return null;
    return {
      version: typeof parsed.version === "number" ? parsed.version : 1,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
      data: (parsed.data ?? {}) as Data,
    };
  } catch {
    return null;
  }
}

function runMigrations(envelope: Envelope): Data {
  let data = envelope.data;
  for (let v = envelope.version + 1; v <= SCHEMA_VERSION; v++) {
    const migrate = migrations[v];
    if (migrate) data = migrate(data);
  }
  return data;
}

/** True once the app has been installed and state written at least once. */
export function hasPersistedState() {
  return readEnvelope() !== null;
}

/**
 * Load persisted state, merged over the provided defaults.
 *
 * - First install (nothing stored): defaults (which contain seed data) are
 *   returned and immediately written, so the seed becomes the user's baseline.
 * - Later launches: every key that exists in storage wins over the default,
 *   so demo data can never clobber real user data. Keys added by a newer app
 *   version fall back to their default value.
 */
export function loadState<T extends Data>(defaults: T): T {
  if (!isBrowser()) return defaults;

  const envelope = readEnvelope();
  if (!envelope) {
    saveState(defaults);
    return defaults;
  }

  const migrated = runMigrations(envelope);
  const merged = { ...defaults } as Data;

  for (const key of Object.keys(defaults)) {
    const stored = migrated[key];
    if (stored === undefined || stored === null) continue;
    // Shallow-merge plain objects so newly added sub-fields keep their default.
    const def = (defaults as Data)[key];
    if (
      typeof stored === "object" &&
      !Array.isArray(stored) &&
      typeof def === "object" &&
      def !== null &&
      !Array.isArray(def)
    ) {
      merged[key] = { ...(def as Data), ...(stored as Data) };
    } else {
      merged[key] = stored;
    }
  }

  if (envelope.version !== SCHEMA_VERSION) saveState(merged);
  return merged as T;
}

/** Persist the full application state. Safe to call on every change. */
export function saveState(data: Data) {
  if (!isBrowser()) return;
  try {
    const envelope: Envelope = {
      version: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      data,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Storage full / disabled — keep the app usable rather than crashing.
  }
}

/** Wipe local data (factory reset). Seed data reloads on next launch. */
export function clearState() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
