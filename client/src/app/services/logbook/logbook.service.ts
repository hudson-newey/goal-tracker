import { Injectable } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { createUrl } from "../helpers";
import { ILogbook, Logbook } from "../../models/logbook";
import { Id } from "../../types/helpers";
import { ApiHttpResponse, EmptyResponse } from "../../types/services";

@Injectable()
export class LogbookService extends AbstractService {
  constructor(private http: HttpClient) {
    super();
  }

  // GET /logbooks
  public getLogbooks(): Observable<ApiHttpResponse<ILogbook[]>> {
    const endpoint: string = createUrl("/logbooks");
    return this.http.get(endpoint) as Observable<ApiHttpResponse<ILogbook[]>>;
  }

  // GET /logbooks/:logbookId
  public getLogbook(logbookId: Id): Observable<ApiHttpResponse<ILogbook>> {
    const endpoint: string = createUrl(`/logbooks/${logbookId}`);
    return this.http.get(endpoint) as Observable<ApiHttpResponse<ILogbook>>;
  }

  // POST /logbooks
  public createLogbook(model: Logbook): Observable<ApiHttpResponse<ILogbook>> {
    const endpoint: string = createUrl("/logbooks");
    return this.http.post(endpoint, model) as Observable<
      ApiHttpResponse<ILogbook>
    >;
  }

  // PUT /logbooks/:logbookId
  public updateLogbook(model: Logbook): Observable<ApiHttpResponse<ILogbook>> {
    const endpoint: string = createUrl(`/logbooks/${model.ClientId}`);
    return this.http.put(endpoint, model) as Observable<
      ApiHttpResponse<ILogbook>
    >;
  }

  // DELETE /logbooks/:logbookId
  public deleteLogbook(logbookId: Id): Observable<EmptyResponse> {
    const endpoint: string = createUrl(`/logbooks/${logbookId}`);
    return this.http.delete(endpoint) as Observable<EmptyResponse>;
  }
}
