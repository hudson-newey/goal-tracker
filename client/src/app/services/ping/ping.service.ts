import { Injectable, inject } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { ApiHttpResponse } from "src/app/types/services";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, map, of } from "rxjs";
import { createUrl } from "../helpers";
import { ClientConfigService } from "../clientConfig/client-config.service";

@Injectable({ providedIn: "root" })
export class PingService extends AbstractService {
  http = inject(HttpClient);
  private config = inject(ClientConfigService);

  public pingRoute = "/ping";

  public pingServer(): Observable<ApiHttpResponse<string>> {
    let endpoint = createUrl("/ping");
    return this.http.get<ApiHttpResponse<string>>(endpoint);
  }

  public hasServerConnection(): Observable<boolean> {
    if (!navigator.onLine || !this.config.isCustomServerUrlSet()) {
      return of(false);
    }

    return this.pingServer()
      .pipe(
        map((response) => {
          return response.message === "Success";
        }),
      )
      .pipe(
        catchError(() => {
          return of(false);
        }),
      );
  }
}
