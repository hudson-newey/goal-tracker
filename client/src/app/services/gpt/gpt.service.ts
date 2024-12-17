import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { Observable } from "rxjs";
import { ApiHttpResponse } from "src/app/types/services";
import { createUrl } from "../helpers";
import { IHabit } from "src/app/models/habit";
import { IGoal } from "src/app/models/goal";

@Injectable()
export class GptService extends AbstractService {
  http = inject(HttpClient);

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
