import { openDB, DBSchema, IDBPDatabase } from "idb";

interface MashafDB extends DBSchema {
  bookmarks: {
    key: string;
    value: {
      id: string;
      surah: number;
      ayah: number;
      note?: string;
      color?: string;
      createdAt: number;
    };
    indexes: { "by-surah": number };
  };
  cache: {
    key: string;
    value: {
      key: string;
      data: unknown;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MashafDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MashafDB>("mashaf-db", 1, {
      upgrade(db) {
        const bookmarkStore = db.createObjectStore("bookmarks", { keyPath: "id" });
        bookmarkStore.createIndex("by-surah", "surah");
        db.createObjectStore("cache", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

export async function cacheData(key: string, data: unknown) {
  const db = await getDB();
  await db.put("cache", { key, data, timestamp: Date.now() });
}

export async function getCachedData<T>(key: string, maxAgeMs?: number): Promise<T | null> {
  const db = await getDB();
  const entry = await db.get("cache", key);
  if (!entry) return null;
  if (maxAgeMs && Date.now() - entry.timestamp > maxAgeMs) return null;
  return entry.data as T;
}
