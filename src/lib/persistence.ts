/**
 * DPAS offline persistence layer.
 *
 * Demo data केवल पहली installation पर save होता है।
 * बाद में हमेशा user का saved data ही उपयोग होता है।
 */

export const STORAGE_KEY = "dpas.state";
export const SCHEMA_VERSION = 3;

type Data = Record<string, unknown>;

type Envelope = {
  version: number;
  savedAt: string;
  data: Data;
};

const migrations: Record<number, (data: Data) => Data> = {
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

  3: (data) => ({
    ...data,
  }),
};

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function readEnvelope(): Envelope | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<Envelope>;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.data ||
      typeof parsed.data !== "object"
    ) {
      return null;
    }

    return {
      version: typeof parsed.version === "number" ? parsed.version : 1,
      savedAt:
        typeof parsed.savedAt === "string"
          ? parsed.savedAt
          : new Date().toISOString(),
      data: parsed.data as Data,
    };
  } catch {
    return null;
  }
}

function runMigrations(envelope: Envelope): Data {
  let data = envelope.data;

  for (
    let version = envelope.version + 1;
    version <= SCHEMA_VERSION;
    version += 1
  ) {
    const migration = migrations[version];

    if (migration) {
      data = migration(data);
    }
  }

  return data;
}

export function hasPersistedState(): boolean {
  return readEnvelope() !== null;
}

export function loadState<T extends Data>(defaults: T): T {
  if (!isBrowser()) {
    return defaults;
  }

  const envelope = readEnvelope();

  if (!envelope) {
    saveState(defaults);
    return defaults;
  }

  const migrated = runMigrations(envelope);
  const merged: Data = { ...defaults };

  Object.keys(defaults).forEach((key) => {
    const storedValue = migrated[key];

    if (storedValue === undefined || storedValue === null) {
      return;
    }

    const defaultValue = defaults[key];

    if (
      typeof storedValue === "object" &&
      !Array.isArray(storedValue) &&
      typeof defaultValue === "object" &&
      defaultValue !== null &&
      !Array.isArray(defaultValue)
    ) {
      merged[key] = {
        ...(defaultValue as Data),
        ...(storedValue as Data),
      };
      return;
    }

    merged[key] = storedValue;
  });

  if (envelope.version !== SCHEMA_VERSION) {
    saveState(merged);
  }

  return merged as T;
}

export function saveState(data: Data): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const envelope: Envelope = {
      version: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      data,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Storage quota या device error की वजह से app crash नहीं होगी।
  }
}

export function clearState(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // कोई action जरूरी नहीं।
  }
}
