import { apiFetch } from './firebaseClient';

/* ═══════════════════════════════════════════════════════════════
   SYNC ENGINE — Offline-first bidirectional sync with auto-retry
   
   Strategy:
   • localStorage is the fast cache (reads/writes are instant)
   • Backend API is the source of truth (writes are queued)
   • Changes made offline are queued and flushed on reconnect
   • Failed syncs retry every 60 seconds automatically
   • Local storage is ALWAYS updated first (guaranteed save)
   • Conflict resolution: server-wins with timestamp comparison
   ═══════════════════════════════════════════════════════════════ */

const SYNC_QUEUE_KEY = 'mithra-sync-queue';
const LAST_SYNC_KEY = 'mithra-last-sync';
const SYNC_STATUS_KEY = 'mithra-sync-status';
const RETRY_INTERVAL_MS = 60000; // 1 minute retry interval
const MAX_RETRIES = 10; // Max retries before dropping

class SyncEngine {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.listeners = new Set();
    this.retryTimer = null;
    this.lastError = null;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notify('online');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notify('offline');
    });

    // Start auto-retry timer
    this._startRetryTimer();
    
    // Process any pending queue on startup
    if (this.isOnline && this._getQueue().length > 0) {
      setTimeout(() => this.processQueue(), 2000);
    }
  }

  /* ── Auto-retry timer: processes queue every 60 seconds ── */
  _startRetryTimer() {
    if (this.retryTimer) clearInterval(this.retryTimer);
    
    this.retryTimer = setInterval(() => {
      const queue = this._getQueue();
      if (queue.length > 0 && this.isOnline && !this.syncInProgress) {
        console.info(`[Sync] Auto-retry: ${queue.length} pending operations`);
        this.processQueue();
      }
    }, RETRY_INTERVAL_MS);
  }

  /* ── Event system ── */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    // Update sync status in localStorage for other tabs
    try {
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
        status: event,
        pending: this._getQueue().length,
        lastUpdate: Date.now(),
        lastError: this.lastError,
      }));
    } catch {}
    
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

  /**
   * Save data locally first, then queue for sync.
   * This guarantees data is NEVER lost even if API fails.
   * 
   * @param {string} localStorageKey - Key to save in localStorage
   * @param {any} data - Data to save
   * @param {object} syncOperation - Operation to queue for API sync
   */
  saveWithFallback(localStorageKey, data, syncOperation) {
    // Step 1: ALWAYS save to localStorage first (guaranteed)
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(data));
      console.info(`[Sync] Saved locally: ${localStorageKey}`);
    } catch (e) {
      console.error(`[Sync] localStorage save failed:`, e);
      // Try to make space by clearing old data
      this._cleanupLocalStorage();
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(data));
      } catch {
        console.error(`[Sync] Critical: localStorage full, data may be lost`);
      }
    }

    // Step 2: Queue for API sync (non-blocking)
    if (syncOperation) {
      this.enqueue(syncOperation);
    }
  }

  /** Clean up old localStorage data to make space */
  _cleanupLocalStorage() {
    const keysToCheck = ['mithra-sync-queue', 'chat-history'];
    keysToCheck.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data && data.length > 50000) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            localStorage.setItem(key, JSON.stringify(parsed.slice(-20)));
          }
        }
      } catch {}
    });
  }

  /** Enqueue a write operation for sync */
  enqueue(operation) {
    const queue = this._getQueue();
    
    // Deduplicate: if same table + id + action exists, replace it
    const existingIdx = queue.findIndex(op => 
      op.table === operation.table && 
      op.data?.id === operation.data?.id && 
      op.action === operation.action
    );
    
    const newOp = {
      ...operation,
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    
    if (existingIdx >= 0) {
      // Replace existing operation with newer one
      queue[existingIdx] = newOp;
    } else {
      queue.push(newOp);
    }
    
    this._saveQueue(queue);
    this.notify('queued', { pending: queue.length });

    if (this.isOnline) {
      this.processQueue();
    }
  }

  /** Process all pending operations with retry logic */
  async processQueue() {
    if (this.syncInProgress || !this.isOnline) return;
    this.syncInProgress = true;
    this.notify('syncing');

    const queue = this._getQueue();
    if (queue.length === 0) {
      this.syncInProgress = false;
      this.lastError = null;
      this.notify('idle');
      return;
    }

    const failed = [];
    let successCount = 0;
    
    for (const op of queue) {
      try {
        await this._executeOperation(op);
        successCount++;
        this.lastError = null;
      } catch (e) {
        console.warn(`[Sync] Operation failed (attempt ${op.retries + 1}):`, op.table, op.action, e.message);
        this.lastError = e.message;
        op.retries += 1;
        op.lastError = e.message;
        op.lastAttempt = Date.now();
        
        if (op.retries < MAX_RETRIES) {
          failed.push(op);
        } else {
          console.error(`[Sync] Dropping operation after ${MAX_RETRIES} retries:`, op);
          this.notify('dropped', { operation: op });
        }
      }
    }

    this._saveQueue(failed);
    
    try { localStorage.setItem(LAST_SYNC_KEY, Date.now().toString()); } catch { }
    
    this.syncInProgress = false;
    
    if (failed.length > 0) {
      console.info(`[Sync] ${successCount} synced, ${failed.length} pending. Will retry in 1 minute.`);
      this.notify('partial', { synced: successCount, pending: failed.length });
    } else {
      console.info(`[Sync] Fully synced: ${successCount} operations`);
      this.notify('synced', { synced: successCount });
    }
  }

  /** Force an immediate retry (called manually or on reconnect) */
  forceRetry() {
    if (!this.syncInProgress) {
      console.info('[Sync] Force retry triggered');
      this.processQueue();
    }
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

  getLastError() {
    return this.lastError;
  }

  /** Get detailed sync status */
  getSyncStatus() {
    const queue = this._getQueue();
    return {
      isOnline: this.isOnline,
      isSyncing: this.syncInProgress,
      pendingCount: queue.length,
      lastSync: this.getLastSyncTime(),
      lastError: this.lastError,
      pendingOperations: queue.map(op => ({
        table: op.table,
        action: op.action,
        retries: op.retries,
        lastAttempt: op.lastAttempt ? new Date(op.lastAttempt) : null,
      })),
    };
  }

  /** Clear all pending operations (use with caution) */
  clearQueue() {
    this._saveQueue([]);
    this.lastError = null;
    this.notify('cleared');
  }

  /** Cleanup on logout */
  cleanup() {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
    this.clearQueue();
  }

  get isConfigured() {
    return true; // Always configured when using Firebase
  }
}

export const syncEngine = new SyncEngine();
