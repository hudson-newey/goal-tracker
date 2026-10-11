import { Injectable, inject } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Observable, catchError, of, tap } from "rxjs";
import { ClientConfigService } from "../clientConfig/client-config.service";
import { VirtualDatabaseService } from "../virtualDatabase/virtual-database.service";
import { SyncQueueService } from "../syncQueue/sync-queue.service";
import { PingService } from "../ping/ping.service";

@Injectable()
export class ConfigInterceptor implements HttpInterceptor {
  private readonly config = inject(ClientConfigService);
  private readonly virtualDb = inject(VirtualDatabaseService);
  private readonly syncService = inject(SyncQueueService);
  private readonly pingService = inject(PingService);

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const isPingRoute = request.url.endsWith(this.pingService.pingRoute);

    // the ping route must always reach the real server, otherwise we could
    // never detect that the server is reachable
    if (isPingRoute) {
      return next.handle(request);
    }

    const info = this.virtualDb.requestInfo(request.url);

    // routes that don't map to a virtual table (AI suggestions, search, ...)
    // are always sent to the real server, or answered locally when offline
    if (!info.table) {
      return this.handleNonVirtualRoute(request, next);
    }

    const hasServerConnection = this.syncService.connectionStatus;

    if (hasServerConnection) {
      return this.realDatabaseResponse(request, next, info.table);
    }

    return this.virtualDatabaseResponse(request);
  }

  /**
   * Try the real server. If the request fails (the connection dropped), the
   * request is answered from the virtual database instead.
   */
  private realDatabaseResponse(
    request: HttpRequest<unknown>,
    next: HttpHandler,
    table: string,
  ): Observable<HttpEvent<unknown>> {
    const info = this.virtualDb.requestInfo(request.url);

    return next.handle(request).pipe(
      // merge the server's response into the local table so the UI
      // refreshes immediately while online (pages listen to the virtual
      // database change notifier) and so the app keeps working offline
      tap((event) => {
        if (!(event instanceof HttpResponse)) {
          return;
        }

        const data = (event.body as any)?.data;

        if (request.method === "GET") {
          // cache list responses so the app can fall back to them when the
          // connection drops mid-session
          if (!info.id && !info.subResource && Array.isArray(data)) {
            this.virtualDb.updateTable(table, JSON.stringify(data));
          }

          return;
        }

        if (request.method === "OPTIONS") {
          return;
        }

        this.virtualDb.applyServerResult(request.method, table, info.id, data);
      }),
      catchError(() => {
        this.syncService.connectionStatus = false;

        // answer from the local database; mutating requests are safe to
        // apply again because the server upserts by ClientId
        return this.virtualDatabaseResponse(request);
      }),
    );
  }

  private virtualDatabaseResponse(
    request: HttpRequest<unknown>,
  ): Observable<HttpEvent<unknown>> {
    const data = this.virtualDb.applyApiRequest(request);

    return of(
      new HttpResponse({
        status: 200,
        body: { data: data ?? null },
      }),
    );
  }

  /**
   * Routes without a virtual table (e.g. /ai/*). When the server cannot be
   * reached, answer with a well-formed empty response instead of letting a
   * network error crash subscribers that have no error handler.
   */
  private handleNonVirtualRoute(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(() => {
        this.syncService.connectionStatus = false;

        return of(
          new HttpResponse({
            status: 200,
            body: { data: [], message: "Offline" },
          }),
        );
      }),
    );
  }
}
