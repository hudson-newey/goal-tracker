import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from "@angular/common/http";
import { Observable, of } from "rxjs";
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
    const hasServerConnection = this.config.isCustomServerUrlSet();

    if (
      hasServerConnection ||
      request.url.endsWith(this.pingService.pingRoute)
    ) {
      // use the real apis database
      return new Observable<HttpEvent<unknown>>((observer) => {
        const subscription = next.handle(request).subscribe({
          next: (event) => observer.next(event),
          error: () => {
            // if the request fails, because we could not connect to the server
            // we will set the connection status to false
            // and return the virtual database representation
            this.syncService.connectionStatus = false;
          },
          complete: () => observer.complete(),
        });

        // Return the virtual database model until the request completes
        observer.next(this.virtualDatabaseResponse(request));

        // Cleanup subscription on unsubscribe
        return () => subscription.unsubscribe();
      });
    }

    return this.virtualDatabaseResponse(request);
  }

  private virtualDatabaseResponse(
    request: HttpRequest<unknown>,
  ): any {
    const data = this.virtualDb.applyApiRequest(request);

    return of(
      new HttpResponse({
        status: 200,
        body: { data },
      }),
    );
  }
}
