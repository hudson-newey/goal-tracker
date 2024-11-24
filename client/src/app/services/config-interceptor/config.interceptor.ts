import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { noop, Observable, of } from "rxjs";
import { ClientConfigService } from "../clientConfig/client-config.service";
import { VirtualDatabaseService } from "../virtualDatabase/virtual-database.service";
import { SyncQueueService } from "../syncQueue/sync-queue.service";
import { PingService } from "../ping/ping.service";

@Injectable()
export class ConfigInterceptor implements HttpInterceptor {
  public constructor(
    private config: ClientConfigService,
    private virtualDb: VirtualDatabaseService,
    private syncService: SyncQueueService,
    private pingService: PingService,
  ) {}

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const hasCustomServer = this.config.isCustomServerUrlSet();
    const hasServerConnection = this.syncService.connectionStatus;
    const shouldPassthroughRequest = hasCustomServer && hasServerConnection;

    const isPingRoute = request.url.endsWith(this.pingService.pingRoute);

    if (shouldPassthroughRequest || isPingRoute) {
      return this.realDatabaseResponse(request, next, isPingRoute);
    }

    return this.virtualDatabaseResponse(request);
  }

  private realDatabaseResponse(
    request: HttpRequest<unknown>,
    next: HttpHandler,
    isPingRoute: boolean
  ): Observable<HttpEvent<unknown>> {
    return new Observable<HttpEvent<unknown>>((observer) => {
      // use the real apis database
      const subscription = next.handle(request).subscribe({
        next: (data) => observer.next(data),
        error: () => {
          // if the request fails, because we could not connect to the server
          // we will set the connection status to false
          // and return the virtual database representation
          this.syncService.connectionStatus = false;

          // if it is a ping route we do not want to commit it to the virtual
          // database because it would return a stale response
          if (isPingRoute) {
            return noop();
          }

          return this.virtualDatabaseResponse(request);
        },
        complete: () => observer.complete(),
      });

      // Cleanup subscription on unsubscribe
      return () => subscription.unsubscribe();
    });
  }

  private virtualDatabaseResponse(
    request: HttpRequest<unknown>,
  ): Observable<HttpEvent<unknown>> {
    const data = this.virtualDb.applyApiRequest(request);

    return of(
      new HttpResponse({
        status: 200,
        body: { data },
      }),
    );
  }
}
