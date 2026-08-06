/**
 * DPAS Persistence Layer
 *
 * Purpose:
 * - Offline first storage
 * - User data must never be overwritten by demo data
 * - First install only seed data is saved
 * - Future backup/cloud sync ready
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
  /**
   * v1 -> v2
   * Profile fields added
   */
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

  /**
   * v2 -> v3
   * Future-proof storage marker
   */
  3: (data) => {
    return {
      ...data,
    };
  },
};

function isBrowser() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function readEnvelope(): Envelope | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Envelope>;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.data !== "object"
    ) {
      return null;
    }

    return {
      version:
        typeof parsed.version === "number"
          ? parsed.version
          : 1,

      savedAt:
        typeof parsed.savedAt === "string"
          ? parsed.savedAt
          : new Date().toISOString(),

      data: (parsed.data ?? {}) as Data,
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
    version++
  ) {
    const migration = migrations[version];

    if (migration) {
      data = migration(data);
    }
  }

  return data;
}


/**
 * Check if DPAS already has saved data.
 */
export function hasPersistedState() {
  return readEnvelope() !== null;
}


/**
 * Load state.
 *
 * First install:
 * - Save default data
 *
 * Later:
 * - Stored user data wins
 * - New app fields get default values
 */
export function loadState<T extends Data>(defaults: T): T {

  if (!isBrowser()) {
    return defaults;
  }


  const envelope = readEnvelope();


  /**
   * Fresh installation
   */
  if (!envelope) {

    saveState(defaults);

    return defaults;
  }


  const migrated = runMigrations(envelope);


  const merged: Data = {
    ...defaults,
  };


  Object.keys(defaults).forEach((key) => {

    const storedValue = migrated[key];


    if (
      storedValue === undefined ||
      storedValue === null
    ) {
      return;
    }


    const defaultValue = defaults[key];


    /**
     * Merge objects,
     * keep new fields from latest version.
     */
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

    } else {

      merged[key] = storedValue;

    }

  });


  /**
   * Save migrated state.
   */
  if (envelope.version !== SCHEMA_VERSION) {
    saveState(merged);
  }


  return merged as T;
}


/**
 * Save complete DPAS state.
 */
export function saveState(data: Data) {

  if (!isBrowser()) return;


  try {

    const envelope: Envelope = {

      version: SCHEMA_VERSION,

      savedAt:
        new Date().toISOString(),

      data,

    };


    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(envelope)
    );


  } catch {

    /**
     * Storage error should never crash app.
     */

  }

}


/**
 * Remove DPAS local data.
 */
export function clearState() {

  if (!isBrowser()) return;


  try {

    window.localStorage.removeItem(
      STORAGE_KEY
    );

  } catch {

  }

}
