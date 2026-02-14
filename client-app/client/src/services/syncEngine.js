import { supabase, isSupabaseConfigured } from './supabaseClient';

/* ═══════════════════════════════════════════════════════════════
   SYNC ENGINE — Offline-first bidirectional sync
   
   Strategy:
   • localStorage is the fast cache (reads are instant)
   • Supabase is the source of truth (writes are queued)
   • Changes made offline are queued and flushed on reconnect
   • Conflict resolution: server-wins with timestamp comparison
   ═══════════════════════════════════════════════════════════════ */

const SYNC_QUEUE_KEY = 'mithra-sync-queue';
const LAST_SYNC_KEY = 'mithra-last-sync';

class SyncEngine {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.listeners = new Set();

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notify('online');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notify('offline');
    });
  }

  /* ── Event system ── */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    this.listeners.forEach(fn => {
      try { fn(event, data); } catch (e) { console.error('Sync listener error:', e); }
    });
  }

  /* ── Queue management ── */
  _getQueue() {
    try { return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]'); }
    catch { return []; }
  }

  _saveQueue(queue) {
    try { localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue)); }
    catch {
      /* quota exceeded — drop oldest entries */
      try {
        const trimmed = queue.slice(-50);
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(trimmed));
        this.notify('quota_exceeded', { dropped: queue.length - trimmed.length });
      }
      catch { }
    }
  }

  /** Enqueue a write operation for sync */
  enqueue(operation) {
    const queue = this._getQueue();
    queue.push({
      ...operation,
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      retries: 0,
    });
    this._saveQueue(queue);

    if (this.isOnline && isSupabaseConfigured) {
      this.processQueue();
    }
  }

  /** Process all pending operations */
  async processQueue() {
    if (!supabase || this.syncInProgress || !this.isOnline) return;
    this.syncInProgress = true;
    this.notify('syncing');

    const queue = this._getQueue();
    if (queue.length === 0) {
      this.syncInProgress = false;
      this.notify('idle');
      return;
    }

    const failed = [];
    for (const op of queue) {
      try {
        await this._executeOperation(op);
      } catch (e) {
        console.warn('[Sync] Operation failed:', op.table, op.action, e.message);
        op.retries += 1;
        if (op.retries < 5) {
          failed.push(op);
        } else {
          console.error('[Sync] Dropping operation after 5 retries:', op);
        }
      }
    }

    this._saveQueue(failed);
    try { localStorage.setItem(LAST_SYNC_KEY, Date.now().toString()); } catch { }
    this.syncInProgress = false;
    this.notify(failed.length > 0 ? 'partial' : 'synced');
  }

  /** Execute a single sync operation against Supabase */
  async _executeOperation(op) {
    if (!supabase) throw new Error('Supabase not configured');

    switch (op.action) {
      case 'upsert': {
        const { error } = await supabase.from(op.table).upsert(op.data, { onConflict: op.onConflict || 'id' });
        if (error) throw error;
        break;
      }
      case 'insert': {
        const { error } = await supabase.from(op.table).insert(op.data);
        if (error) throw error;
        break;
      }
      case 'update': {
        const { error } = await supabase.from(op.table).update(op.data).match(op.match);
        if (error) throw error;
        break;
      }
      case 'delete': {
        const { error } = await supabase.from(op.table).delete().match(op.match);
        if (error) throw error;
        break;
      }
      default:
        throw new Error(`Unknown sync action: ${op.action}`);
    }
  }

  /* ── Full table sync (pull + merge) ── */

  /** Pull all rows for a user from a table */
  async pull(table, userId, select = '*') {
    if (!supabase || !this.isOnline) return null;
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  /** Full sync: push local data + pull server data, merge by timestamp */
  async syncTable(table, userId, localData, { onConflict = 'id', mergeKey = 'id' } = {}) {
    if (!supabase || !this.isOnline) return localData;

    try {
      // 1. Push local data
      if (localData && localData.length > 0) {
        const rows = localData.map(item => ({
          ...item,
          user_id: userId,
          updated_at: item.updated_at || new Date().toISOString(),
        }));
        const { error } = await supabase.from(table).upsert(rows, { onConflict });
        if (error) {
          console.warn(`[Sync] Push to ${table} failed:`, error.message);
        }
      }

      // 2. Pull server data
      const serverData = await this.pull(table, userId);
      if (!serverData) return localData;

      // 3. Merge: newer timestamp wins
      const merged = new Map();
      (localData || []).forEach(item => merged.set(item[mergeKey], item));
      serverData.forEach(item => {
        const local = merged.get(item[mergeKey]);
        if (!local || new Date(item.updated_at) > new Date(local.updated_at || 0)) {
          merged.set(item[mergeKey], item);
        }
      });

      try { localStorage.setItem(LAST_SYNC_KEY, Date.now().toString()); } catch { }
      return Array.from(merged.values());
    } catch (e) {
      console.error(`[Sync] Table sync failed for ${table}:`, e);
      return localData; // fallback to local
    }
  }

  /* ── Status helpers ── */
  getPendingCount() {
    return this._getQueue().length;
  }

  getLastSyncTime() {
    const ts = localStorage.getItem(LAST_SYNC_KEY);
    return ts ? new Date(parseInt(ts)) : null;
  }

  get isConfigured() {
    return isSupabaseConfigured;
  }
}

export const syncEngine = new SyncEngine();
