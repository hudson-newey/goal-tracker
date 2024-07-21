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
    private pingService: PingService
  ) {}

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const hasServerConnection =
      this.config.isCustomServerUrlSet() && this.syncService.connectionStatus;

    if (hasServerConnection || request.url.endsWith(this.pingService.pingRoute)) {
      // use the real apis database
      return next.handle(request);
    }

    // use the virtual database
    const data = this.virtualDb.applyApiRequest(request);

    return of(
      new HttpResponse({
        status: 200,
        body: {
          data,
        },
      })
    );
  }
}
