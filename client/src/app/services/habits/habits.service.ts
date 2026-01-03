import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AbstractService } from "../abstract-service.service";
import { createUrl, setLastUpdated } from "../helpers";
import { IHabit, Habit } from "../../models/habit";
import { Id } from "../../types/helpers";
import { ApiHttpResponse, EmptyResponse } from "../../types/services";

@Injectable({ providedIn: "root" })
export class HabitsService extends AbstractService {
  private readonly http = inject(HttpClient);

  // GET /habits
  public getHabits(): Observable<ApiHttpResponse<IHabit[]>> {
    const endpoint: string = createUrl("/habits");
    return this.http.get(endpoint) as Observable<ApiHttpResponse<IHabit[]>>;
  }

  // GET /habits/:habitId
  public getHabit(habitId: Id): Observable<ApiHttpResponse<IHabit>> {
    const endpoint: string = createUrl(`/habits/${habitId}`);
    return this.http.get(endpoint) as Observable<ApiHttpResponse<IHabit>>;
  }

  // POST /habits
  public createHabit(model: Habit): Observable<ApiHttpResponse<IHabit>> {
    setLastUpdated(model);
    const endpoint: string = createUrl("/habits");
    return this.http.post(endpoint, model) as Observable<
      ApiHttpResponse<IHabit>
    >;
  }

  // PUT /habits/:habitId
  public updateHabit(model: Habit): Observable<ApiHttpResponse<IHabit>> {
    setLastUpdated(model);
    const endpoint: string = createUrl(`/habits/${model.ClientId}`);
    return this.http.put(endpoint, model) as Observable<
      ApiHttpResponse<IHabit>
    >;
  }

  // DELETE /habits/:habitId
  public deleteHabit(modelId: Id): Observable<EmptyResponse> {
    const endpoint: string = createUrl(`/habits/${modelId}`);
    return this.http.delete(endpoint);
  }
}
