import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { Observable } from "rxjs";
import { ApiHttpResponse } from "../../types/services";
import { createUrl } from "../helpers";
import { IHabit } from "../../models/habit";
import { IGoal } from "../../models/goal";

@Injectable({ providedIn: "root" })
export class GptService extends AbstractService {
  private readonly http = inject(HttpClient);

  public getHabitsForGoal(
    goalModel: IGoal,
  ): Observable<ApiHttpResponse<IGoal[]>> {
    const endpoint = createUrl("/ai/habits");
    return this.http.post(endpoint, goalModel) as Observable<
      ApiHttpResponse<IGoal[]>
    >;
  }

  public getTasksForGoal(
    goalModel: IGoal,
  ): Observable<ApiHttpResponse<IHabit[]>> {
    const endpoint = createUrl("/ai/tasks");
    return this.http.post(endpoint, goalModel) as Observable<
      ApiHttpResponse<IHabit[]>
    >;
  }
}
