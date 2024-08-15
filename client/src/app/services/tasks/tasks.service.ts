import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { createUrl } from "../helpers";
import { HttpClient } from "@angular/common/http";
import { AbstractService } from "../abstract-service.service";
import { ITask, Task } from "../../models/task";
import { Id } from "../../types/helpers";
import { ApiHttpResponse, EmptyResponse } from "../../types/services";

@Injectable()
export class TasksService extends AbstractService {
  public constructor(public http: HttpClient) {
    super();
  }

  public getTodaysRemainingTasks(): Observable<ApiHttpResponse<ITask[]>> {
    throw new Error("Not implemented");
  }

  // GET /tasks
  public getTasks(): Observable<ApiHttpResponse<ITask[]>> {
    const endpoint: string = createUrl("/tasks");
    return this.http.get(endpoint) as Observable<ApiHttpResponse<ITask[]>>;
  }

  // GET /tasks/:taskId
  public getTask(taskId: Id): Observable<ApiHttpResponse<ITask>> {
    const endpoint: string = createUrl(`/tasks/${taskId}`);
    return this.http.get(endpoint) as Observable<ApiHttpResponse<ITask>>;
  }

  // POST /tasks
  public createTask(model: Task): Observable<ApiHttpResponse<ITask>> {
    const endpoint: string = createUrl("/tasks");
    return this.http.post(endpoint, model) as Observable<
      ApiHttpResponse<ITask>
    >;
  }

  // PUT /tasks/:taskId
  public updateTask(model: Task): Observable<ApiHttpResponse<ITask>> {
    const endpoint: string = createUrl(`/tasks/${model.ClientId}`);
    return this.http.put(endpoint, model) as Observable<ApiHttpResponse<ITask>>;
  }

  // DELETE /tasks/:taskId
  public deleteTask(taskId: Id): Observable<EmptyResponse> {
    const endpoint: string = createUrl(`/tasks/${taskId}`);
    return this.http.delete(endpoint) as Observable<EmptyResponse>;
  }
}
