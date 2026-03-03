import { apiFetch } from './firebaseClient';

/* ═══════════════════════════════════════════════════════════════
   SYNC ENGINE — Offline-first bidirectional sync
   
   Strategy:
   • localStorage is the fast cache (reads are instant)
   • Backend API is the source of truth (writes are queued)
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

    if (this.isOnline) {
      this.processQueue();
    }
  }

  /** Process all pending operations */
  async processQueue() {
    if (this.syncInProgress || !this.isOnline) return;
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

  /** Execute a single sync operation against API */
  async _executeOperation(op) {
    const endpoint = `/${op.table}`;
    
    switch (op.action) {
      case 'upsert':
      case 'insert': {
        await apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(op.data),
        });
        break;
      }
      case 'update': {
        const { id, ...updateData } = op.data;
        await apiFetch(`${endpoint}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });
        break;
      }
      case 'delete': {
        const id = op.data?.id || op.match?.id;
        if (!id) throw new Error('Delete requires an id');
        await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' });
        break;
      }
      default:
        throw new Error(`Unknown sync action: ${op.action}`);
    }
  }

  /* ── Full table sync (pull + merge) ── */

  /** Pull all rows for a user from a table */
  async pull(table, userId, select = '*') {
    if (!this.isOnline) return null;
    try {
      const res = await apiFetch(`/${table}`);
      return res[table] || res.data || [];
    } catch (error) {
      console.warn(`[SyncEngine] Pull failed for ${table}:`, error.message);
      return null;
    }
  }

  /** Full sync: pull remote rows, merge with local cache (server-wins on conflict).
   *  Returns merged dataset. Queued offline mutations are flushed first. */
  async syncTable(table, userId, localData, opts = {}) {
    if (!this.isOnline || !userId) {
      return localData; // offline — return cached data as-is
    }

    // 1. Flush any pending queue items for this table first
    await this.processQueue();

    // 2. Pull all remote rows
    let remote;
    try {
      remote = await this.pull(table, userId, opts.select || '*');
    } catch (e) {
      console.warn(`[SyncEngine] Pull failed for ${table}:`, e.message);
      return localData; // network error — keep local cache
    }
    if (!remote) return localData;

    // 3. Server-wins merge: index remote by id, overlay onto local
    const remoteMap = new Map(remote.map(r => [r.id, r]));
    const localMap = new Map((localData || []).map(l => [l.id, l]));

    // Start with all remote rows (they win on conflict)
    const merged = new Map(remoteMap);

    // Add local-only rows that aren't on remote (offline-created, not yet synced)
    for (const [id, localRow] of localMap) {
      if (!merged.has(id)) {
        merged.set(id, localRow);
      }
    }

    const result = Array.from(merged.values());
    try { localStorage.setItem(LAST_SYNC_KEY, Date.now().toString()); } catch {}
    return result;
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
    return true; // Always configured when using Firebase
  }
}

export const syncEngine = new SyncEngine();
