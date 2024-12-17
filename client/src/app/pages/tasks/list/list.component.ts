import { Component, OnInit } from "@angular/core";
import { take } from "rxjs";
import { Task, ITask } from "src/app/models/task";
import { TasksService } from "src/app/services/tasks/tasks.service";

import { TasksTableComponent } from "../../../components/tasks-table/tasks-table.component";
import { RouterLink } from "@angular/router";
import { VirtualDatabaseService } from "src/app/services/virtualDatabase/virtual-database.service";
import { VibrationService } from "src/app/services/vibration/vibration.service";

@Component({
  selector: "app-tasks-page",
  templateUrl: "list.component.html",
  styleUrl: "list.component.less",
  imports: [RouterLink, TasksTableComponent],
})
export class TasksPageComponent implements OnInit {
  public constructor(
    private api: TasksService,
    private virtualDb: VirtualDatabaseService,
    private vibrate: VibrationService,
  ) {}

  protected tasks: Task[] = [];

  protected get completedTasks(): Task[] {
    return this.tasks.filter((task) => task.Completed);
  }

  protected get incompleteTasks(): Task[] {
    return this.tasks.filter((task) => !task.Completed);
  }

  protected get hasCompletedTasks(): boolean {
    return this.completedTasks.length > 0;
  }

  protected get hasIncompleteTasks(): boolean {
    return this.incompleteTasks.length > 0;
  }

  public ngOnInit(): void {
    this.updateTasks();

    this.virtualDb.changeNotifier.addEventListener("change", () =>
      this.updateTasks(),
    );
  }

  public updateTasks(): void {
    this.api
      .getTasks()
      .pipe(take(1))
      .subscribe((response) => {
        this.tasks = response.data.map((model: ITask) => new Task(model));
      });
  }

  public completeTask(model: Task): void {
    this.updateTask(model);
    this.vibrate.completionVibration();
  }

  public updateTask(model: Task): void {
    this.api
      .updateTask(model)
      .pipe(take(1))
      .subscribe((response) => {
        model = new Task(response.data);
      });
  }
}
