import { HttpClient, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { ClientConfigService } from "../clientConfig/client-config.service";
import { PingService } from "../ping/ping.service";
import { Observable, interval, take } from "rxjs";
import { VirtualDatabaseService } from "../virtualDatabase/virtual-database.service";
import { createUrl } from "../helpers";
import { ApiHttpResponse } from "src/app/types/services";

@Injectable({ providedIn: "root" })
export class SyncQueueService extends AbstractService {
  constructor(
    private http: HttpClient,
    private pingService: PingService,
    private config: ClientConfigService,
    private virtualDatabase: VirtualDatabaseService,
  ) {
    super();

    this.timer = interval(3_000);

    this.timer.subscribe(() => {
      this.pingService
        .hasServerConnection()
        .pipe(take(1))
        .subscribe((status) => {
          this.connectionStatus = status;

          // attempt to sync the virtual database to the real database every 50 seconds
          // we primarily do this so that we can update the virtual database with the real database
          if (this.ticksSinceLastSync >= 5 && this.connectionStatus) {
            this.attemptSync();
            this.ticksSinceLastSync = 0;
          }

          if (this.connectionStatus) {
            this.ticksSinceLastSync++;
          }
        });
    });
  }

  public connectionStatus = false;
  private timer: Observable<number>;
  private ticksSinceLastSync = 0;
  private syncQueueLocalStorageKey = "syncQueue";

  public attemptSync(): void {
    console.debug("Attempting sync with database");

    const syncQueue =
      JSON.parse(localStorage.getItem("syncQueue") as string) ?? [];

    const numberOfItems = syncQueue.length;

    if (numberOfItems === 0) {
      this.syncFromDatabase();
      return;
    }

    if (!this.shouldFlushSyncQueue()) {
      return;
    }

    syncQueue.forEach((request: HttpRequest<unknown>, i: number) => {
      const method = request.method;
      const body = request.body;
      const url = createUrl(request.url);

      const successCallback = () => {
        // remove the item from local storage
        // I do this so that if one request fails, it won't be removed from the queue
        const index = syncQueue.indexOf(request);
        syncQueue.splice(index, 1);
        localStorage.setItem(
          this.syncQueueLocalStorageKey,
          JSON.stringify(syncQueue),
        );

        // after the last item is removed, we should attempt to sync the virtual database
        // with the real database
        if (i === numberOfItems - 1) {
          this.syncFromDatabase();
        }
      };

      if (method === "POST") {
        this.http
          .post(url, body)
          .pipe(take(1))
          .subscribe(() => successCallback());
      } else if (method === "PUT") {
        this.http
          .put(url, body)
          .pipe(take(1))
          .subscribe(() => successCallback());
      } else if (method === "DELETE") {
        this.http
          .delete(url)
          .pipe(take(1))
          .subscribe(() => successCallback());
      }
    });
  }

  public syncFromDatabase(): void {
    if (!this.config.isCustomServerUrlSet() || !this.connectionStatus) {
      return;
    }

    console.debug("Attemping to sync from upstream");

    const virtualTables = this.virtualDatabase.knownVirtualTables();

    virtualTables.forEach((table) => {
      const url = createUrl(`/${table}`);
      this.http
        .get(url)
        .pipe(take(1))
        .subscribe((response) => {
          const responseBody = response as ApiHttpResponse<any>;
          this.virtualDatabase.updateTable(
            table,
            JSON.stringify(responseBody.data),
          );
        });
    });
  }

  public shouldFlushSyncQueue(): boolean {
    const syncQueue =
      JSON.parse(localStorage.getItem("syncQueue") as string) ?? [];
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
}
