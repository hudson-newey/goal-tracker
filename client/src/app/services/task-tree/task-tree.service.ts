import { Injectable, inject } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { Task } from "src/app/models/task";
import { TasksService } from "../tasks/tasks.service";
import { Id } from "src/app/types/helpers";

@Injectable({ providedIn: "root" })
export class TaskTreeService extends AbstractService {
  private taskService = inject(TasksService);

  // TODO: At the moment, we only support one dependency for each task
  // I have made it so that the models support having multiple dependencies
  public createTree(model: Task): Task[] {
    const directDependencies: Id[] = model.DependsOn;

    return [model];
  }
}
