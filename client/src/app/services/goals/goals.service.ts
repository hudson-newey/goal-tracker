import { Injectable } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { createUrl, setLastUpdated } from "../helpers";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { IGoal, Goal } from "../../models/goal";
import { Id } from "../../types/helpers";
import { ApiHttpResponse, EmptyResponse } from "../../types/services";
import { ITask } from "src/app/models/task";
import { IHabit } from "src/app/models/habit";

@Injectable()
export class GoalsService extends AbstractService {
  public constructor(private http: HttpClient) {
    super();
  }

  // GET /goals
  public listGoals(): Observable<ApiHttpResponse<IGoal[]>> {
    const endpoint: string = createUrl("/goals");
    return this.http.get(endpoint) as Observable<ApiHttpResponse<IGoal[]>>;
  }

  // GET /goals?q=name
  // gets a list of goal models from a partial name
  public findGoals(searchTerm: string): Observable<ApiHttpResponse<IGoal[]>> {
    const endpoint: string = createUrl(`/goals?q=${searchTerm}`);
    return this.http.get(endpoint) as Observable<ApiHttpResponse<IGoal[]>>;
  }

  // GET /goals/:goalId
  public getGoal(goalId: Id): Observable<ApiHttpResponse<IGoal>> {
    const endpoint: string = createUrl(`/goals/${goalId}`);
    return this.http.get(endpoint) as Observable<ApiHttpResponse<IGoal>>;
  }

  // POST /goals
  public createGoal(model: Goal): Observable<ApiHttpResponse<IGoal>> {
    setLastUpdated(model);

    const endpoint: string = createUrl("/goals");
    return this.http.post(endpoint, model) as Observable<
      ApiHttpResponse<IGoal>
    >;
  }

  // PUT /goals/:goalId
  public updateGoal(model: Goal): Observable<ApiHttpResponse<IGoal>> {
    setLastUpdated(model);

    const endpoint: string = createUrl(`/goals/${model.ClientId}`);
    return this.http.put(endpoint, model) as Observable<ApiHttpResponse<IGoal>>;
  }

  // DELETE /goals/:goalId
  public deleteGoal(goalId: Id): Observable<EmptyResponse> {
    const endpoint: string = createUrl(`/goals/${goalId}`);
    return this.http.delete(endpoint) as Observable<EmptyResponse>;
  }

  // associations
  public getGoalTasks(goalId: Id): Observable<ApiHttpResponse<ITask[]>> {
    const endpoint: string = createUrl(`/goals/${goalId}/tasks`);
    return this.http.get(endpoint) as Observable<ApiHttpResponse<ITask[]>>;
  }

  public getGoalHabits(goalId: Id): Observable<ApiHttpResponse<IHabit[]>> {
    const endpoint: string = createUrl(`/goals/${goalId}/habits`);
    return this.http.get(endpoint) as Observable<ApiHttpResponse<IHabit[]>>;
  }
}
