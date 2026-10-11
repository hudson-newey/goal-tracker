import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { ClientConfigService } from "../clientConfig/client-config.service";
import { PingService } from "../ping/ping.service";
import { Observable, first, interval } from "rxjs";
import {
  SyncOp,
  VirtualDatabaseService,
} from "../virtualDatabase/virtual-database.service";
import { ApiHttpResponse } from "../../types/services";

const PING_INTERVAL_MS = 5_000;
const PULL_INTERVAL_TICKS = 10;

@Injectable({ providedIn: "root" })
export class SyncQueueService extends AbstractService {
  private readonly http = inject(HttpClient);
  private readonly pingService = inject(PingService);
  private readonly config = inject(ClientConfigService);
  private readonly virtualDatabase = inject(VirtualDatabaseService);

  public connectionStatus = false;

  private syncing = false;
  private ticksSinceLastPull = 0;
  private readonly syncQueueLocalStorageKey = "syncQueue";

  constructor() {
    super();

    // migrate the legacy queue format (serialized HttpRequest objects)
    this.migrateLegacyQueue();

    // immediately update the connection status
    this.updateConnectionStatus();

    // set up a regular interval to check the connection status
    this.interval = interval(PING_INTERVAL_MS);
    this.interval.subscribe(() => this.updateConnectionStatus());
  }

  private interval: ReturnType<typeof interval>;

  /**
   * Push every locally made change to the server (replaying the queue),
   * then pull the server state so all clients converge.
   */
  public async attemptSync(): Promise<void> {
    if (!this.config.isCustomServerUrlSet()) {
      return;
    }

    if (this.syncing) {
      return;
    }

    if (!this.connectionStatus || !navigator.onLine) {
      return;
    }

    this.syncing = true;

    try {
      // compact first so we replay the minimum number of operations
      const compacted = this.compactQueue();
      this.virtualDatabase.setQueue(compacted);

      const allApplied = await this.replayQueue();

      if (allApplied) {
        this.syncFromDatabase();
      }
    } finally {
      this.syncing = false;
    }
  }

  public syncFromDatabase(): void {
    if (!this.config.isCustomServerUrlSet() || !this.connectionStatus) {
      return;
    }

    const virtualTables = this.virtualDatabase.knownVirtualTables();

    virtualTables.forEach((table) => {
      const endpoint = `${this.config.getCustomServerUrl()}/${table}`;

      this.http
        .get(endpoint)
        .pipe(first())
        .subscribe({
          next: (response) => {
            const responseBody = response as ApiHttpResponse<any>;

            if (!Array.isArray(responseBody?.data)) {
              return;
            }

            this.virtualDatabase.updateTable(
              table,
              JSON.stringify(responseBody.data),
            );
          },
          error: () => {
            // a failed pull must never touch local data
          },
        });
    });
  }

  public shouldFlushSyncQueue(): boolean {
    const syncQueue = this.virtualDatabase.getQueue();
    const hasRealServer = this.config.isCustomServerUrlSet();
    const hasInternetConnection = navigator.onLine;
    const serverConnection = this.connectionStatus;

    return (
      syncQueue.length > 0 &&
      hasRealServer &&
      hasInternetConnection &&
      serverConnection
    );
  }

  /**
   * Collapse the queue so that each record has at most one pending op.
   *
   * The server upserts by ClientId and applies last-write-wins, so only the
   * latest op per record matters. A record that was created and deleted
   * entirely offline never needs to reach the server at all.
   */
  public compactQueue(): SyncOp[] {
    const queue = this.virtualDatabase.getQueue();

    const groups = new Map<string, SyncOp[]>();

    for (const op of queue) {
      if (!op || !op.method || !op.table || !op.clientId) {
        continue;
      }

      const key = `${op.table}:${op.clientId}`;
      const group = groups.get(key) ?? [];
      group.push(op);
      groups.set(key, group);
    }

    const compacted: SyncOp[] = [];

    groups.forEach((ops) => {
      ops.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      const lastOp = ops[ops.length - 1];

      if (
        lastOp.method === "DELETE" &&
        ops.some((op) => op.method === "POST")
      ) {
        // created and deleted while offline: the server never saw it
        return;
      }

      // the last op already contains the full record state, so any earlier
      // POSTs/PUTs for this record are superseded
      compacted.push(lastOp);
    });

    // preserve the original queue order as much as possible
    return queue.filter((op) => compacted.includes(op));
  }

  /**
   * Replay the queue to the server one op at a time. Ops are sent with
   * plain fetch so they never re-enter the Http interceptor (which would
   * re-apply them locally and re-queue them — the cause of the runaway
   * queue that used to fill up localStorage).
   *
   * Returns true when the whole queue has been applied.
   */
  private async replayQueue(): Promise<boolean> {
    for (;;) {
      const queue = this.virtualDatabase.getQueue();

      if (queue.length === 0) {
        return true;
      }

      const op = queue[0];

      if (!op.id) {
        // an op without an id could never be removed and would jam the
        // queue forever; drop it
        this.virtualDatabase.setQueue(queue.slice(1));
        continue;
      }

      const outcome = await this.replayOp(op);

      if (outcome === "retry") {
        return false;
      }

      this.removeFromQueue(op.id);
    }
  }

  private async replayOp(op: SyncOp): Promise<"applied" | "retry"> {
    const endpoint = this.config.getCustomServerUrl() ?? "";
    let url = `${endpoint}/${op.table}`;

    if (op.method === "POST") {
      url = `${endpoint}/${op.table}`;
    } else {
      url = `${endpoint}/${op.table}/${op.clientId}`;
    }

    const init: RequestInit = {
      method: op.method,
      headers: { "Content-Type": "application/json" },
    };

    if (op.method === "DELETE") {
      // the server uses this for last-write-wins conflict resolution
      url += `?lastUpdated=${encodeURIComponent(op.timestamp)}`;
    } else {
      init.body = JSON.stringify(op.body ?? {});
    }

    try {
      const response = await fetch(url, init);

      if (response.status >= 500) {
        // transient server error: keep the op and try again later
        return "retry";
      }

      // 2xx: applied. 4xx: the server rejected the op permanently (e.g. it
      // lost a conflict and the server already has a newer version, or the
      // record no longer exists). Either way the next pull converges local
      // state, so the op must not be kept (it would jam the queue).
      return "applied";
    } catch {
      // network failure: stop replaying, keep everything, retry next tick
      return "retry";
    }
  }

  private removeFromQueue(opId: string): void {
    // re-read the queue: ops may have been appended while replaying
    const freshQueue = this.virtualDatabase.getQueue();
    this.virtualDatabase.setQueue(freshQueue.filter((op) => op.id !== opId));
  }

  private migrateLegacyQueue(): void {
    const raw = localStorage.getItem(this.syncQueueLocalStorageKey);

    if (!raw) {
      return;
    }

    let parsed: any[];

    try {
      parsed = JSON.parse(raw);
    } catch {
      localStorage.removeItem(this.syncQueueLocalStorageKey);
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return;
    }

    const alreadyMigrated = parsed.every(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        "table" in entry &&
        "timestamp" in entry,
    );

    if (alreadyMigrated) {
      return;
    }

    // legacy entries are serialized HttpRequest objects
    const migrated: SyncOp[] = [];

    for (const entry of parsed) {
      if (!entry || typeof entry !== "object" || !entry.method) {
        continue;
      }

      if (!["POST", "PUT", "DELETE"].includes(entry.method)) {
        continue;
      }

      const info = this.virtualDatabase.requestInfo(entry.url ?? "");

      if (!info.table) {
        continue;
      }

      const body = entry.body ?? {};
      const clientId = info.id ?? body?.ClientId ?? "";

      if (!clientId) {
        continue;
      }

      migrated.push({
        id: `${clientId}:${entry.method}:${migrated.length}`,
        method: entry.method,
        table: info.table,
        clientId: String(clientId),
        body,
        timestamp: body?.LastUpdated ?? new Date().toISOString(),
      });
    }

    this.virtualDatabase.setQueue(migrated);
  }

  private updateConnectionStatus(): void {
    this.pingService
      .hasServerConnection()
      .pipe(first())
      .subscribe((status) => {
        this.connectionStatus = status;

        if (!status) {
          return;
        }

        const hasPendingOps = this.virtualDatabase.getQueue().length > 0;

        if (hasPendingOps) {
          this.attemptSync();
          return;
        }

        // periodically refresh local data from the server (~every 50s) even
        // when there is nothing to push, so other clients' changes arrive
        this.ticksSinceLastPull++;

        if (this.ticksSinceLastPull >= PULL_INTERVAL_TICKS) {
          this.ticksSinceLastPull = 0;
          this.syncFromDatabase();
        }
      });
  }
}
