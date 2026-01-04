import { openDB, IDBPDatabase } from 'idb';

// Database types
interface CachedItem {
  id: string;
  data: any;
  synced: boolean;
  updated_at: string;
}

interface SyncQueueItem {
  id: string;
  table: 'deals' | 'debts' | 'daily_moves';
  action: 'create' | 'update' | 'delete';
  data: any;
  created_at: string;
}

interface CacheMetaItem {
  table: string;
  last_synced: string;
}

const DB_NAME = 'control-room-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Deals store
        if (!db.objectStoreNames.contains('deals')) {
          const dealsStore = db.createObjectStore('deals', { keyPath: 'id' });
          dealsStore.createIndex('by-synced', 'synced');
        }
        
        // Debts store
        if (!db.objectStoreNames.contains('debts')) {
          const debtsStore = db.createObjectStore('debts', { keyPath: 'id' });
          debtsStore.createIndex('by-synced', 'synced');
        }
        
        // Daily moves store
        if (!db.objectStoreNames.contains('daily_moves')) {
          const movesStore = db.createObjectStore('daily_moves', { keyPath: 'id' });
          movesStore.createIndex('by-synced', 'synced');
        }
        
        // Sync queue
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
        
        // Cache metadata
        if (!db.objectStoreNames.contains('cache_meta')) {
          db.createObjectStore('cache_meta', { keyPath: 'table' });
        }
      },
    });
  }
  return dbPromise;
};

// Generic cache operations
export const cacheData = async <T extends { id: string }>(
  table: 'deals' | 'debts' | 'daily_moves',
  items: T[]
) => {
  const db = await getDB();
  const tx = db.transaction(table, 'readwrite');
  const store = tx.objectStore(table);
  
  for (const item of items) {
    await store.put({
      id: item.id,
      data: item,
      synced: true,
      updated_at: new Date().toISOString(),
    } as CachedItem);
  }
  
  await tx.done;
  
  // Update cache metadata
  const metaTx = db.transaction('cache_meta', 'readwrite');
  await metaTx.objectStore('cache_meta').put({
    table,
    last_synced: new Date().toISOString(),
  } as CacheMetaItem);
};

export const getCachedData = async <T>(
  table: 'deals' | 'debts' | 'daily_moves'
): Promise<T[]> => {
  const db = await getDB();
  const items = await db.getAll(table) as CachedItem[];
  return items.map(item => item.data as T);
};

export const getCacheMetadata = async (table: string): Promise<CacheMetaItem | undefined> => {
  const db = await getDB();
  return db.get('cache_meta', table) as Promise<CacheMetaItem | undefined>;
};

// Sync queue operations
export const addToSyncQueue = async (
  table: 'deals' | 'debts' | 'daily_moves',
  action: 'create' | 'update' | 'delete',
  data: any
) => {
  const db = await getDB();
  const id = `${table}-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await db.put('sync_queue', {
    id,
    table,
    action,
    data,
    created_at: new Date().toISOString(),
  } as SyncQueueItem);
  
  return id;
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  const db = await getDB();
  return db.getAll('sync_queue') as Promise<SyncQueueItem[]>;
};

export const removeFromSyncQueue = async (id: string) => {
  const db = await getDB();
  await db.delete('sync_queue', id);
};

export const clearSyncQueue = async () => {
  const db = await getDB();
  await db.clear('sync_queue');
};

// Update local cache for offline changes
export const updateLocalCache = async <T extends { id: string }>(
  table: 'deals' | 'debts' | 'daily_moves',
  id: string,
  data: T,
  synced: boolean = false
) => {
  const db = await getDB();
  await db.put(table, {
    id,
    data,
    synced,
    updated_at: new Date().toISOString(),
  } as CachedItem);
};

export const deleteFromLocalCache = async (
  table: 'deals' | 'debts' | 'daily_moves',
  id: string
) => {
  const db = await getDB();
  await db.delete(table, id);
};

// Clear all data
export const clearAllData = async () => {
  const db = await getDB();
  await Promise.all([
    db.clear('deals'),
    db.clear('debts'),
    db.clear('daily_moves'),
    db.clear('sync_queue'),
    db.clear('cache_meta'),
  ]);
};
