import { HttpClient, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { ClientConfigService } from "../clientConfig/client-config.service";
import { PingService } from "../ping/ping.service";
import { Observable, first, interval } from "rxjs";
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

    // immediately update the connection status
    this.updateConnectionStatus();

    // set up a regular interval to check the connection status
    // (defaults to every 5 seconds)
    this.timer = interval(5_000);
    this.timer.subscribe(() => this.updateConnectionStatus());
  }

  public connectionStatus = false;
  private timer: Observable<number>;
  private ticksSinceLastSync = 0;
  private syncQueueLocalStorageKey = "syncQueue";

  public attemptSync(): void {
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
          .pipe(first())
          .subscribe(() => successCallback());
      } else if (method === "PUT") {
        this.http
          .put(url, body)
          .pipe(first())
          .subscribe(() => successCallback());
      } else if (method === "DELETE") {
        this.http
          .delete(url)
          .pipe(first())
          .subscribe(() => successCallback());
      }
    });

    // we attempt to sync again after we have completed in the hopes that we
    // will not have any more information to push and we can short-circut and
    // start pulling from the database
    // we attempt to push further data to the database in the rare case that
    // the user has created more items to push in the time it took to sync
    this.attemptSync();
  }

  public syncFromDatabase(): void {
    if (!this.config.isCustomServerUrlSet() || !this.connectionStatus) {
      return;
    }

    const virtualTables = this.virtualDatabase.knownVirtualTables();

    virtualTables.forEach((table) => {
      const url = createUrl(`/${table}`);
      this.http
        .get(url)
        .pipe(first())
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

  private updateConnectionStatus(): void {
    this.pingService
      .hasServerConnection()
      .pipe(first())
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
  }
}
