import { Component, OnInit } from "@angular/core";
import { AbstractFormComponent } from "../abstract-form.component";
import { ITask, Task } from "src/app/models/task";
import { BehaviorSubject, take } from "rxjs";
import { Router } from "@angular/router";
import { TasksService } from "src/app/services/tasks/tasks.service";
import { GoalsService } from "src/app/services/goals/goals.service";
import { Goal } from "src/app/models/goal";
import { AsyncPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-task-form",
  templateUrl: "./task-form.component.html",
  styleUrl: "./task-form.component.less",
  standalone: true,
  imports: [FormsModule, AsyncPipe],
})
export class TaskFormComponent
  extends AbstractFormComponent<ITask>
  implements OnInit
{
  public constructor(
    private api: TasksService,
    private goalApi: GoalsService,
    private router: Router,
  ) {
    super();
  }

  protected goals$ = new BehaviorSubject<Goal[]>([]);

  public ngOnInit(): void {
    this.goalApi
      .listGoals()
      .pipe(take(1))
      .subscribe((response) =>
        this.goals$.next(response.data.map((goalModel) => new Goal(goalModel))),
      );
  }

  protected submitForm(): void {
    const taskModel: Task = new Task(this.model);

    if (this.creating) {
      this.api
        .createTask(taskModel)
        .pipe(take(1))
        .subscribe(() => this.router.navigate(["/tasks"]));
    } else {
      this.api
        .updateTask(taskModel)
        .pipe(take(1))
        .subscribe(() => this.router.navigate(taskModel.ViewUrl));
    }
  }

  protected updateImportance(event: any): void {
    const value: string = event.target.value;
    this.model.Importance = parseInt(value, 10);
  }

  protected updateCompleteBy(event: any): void {
    const value: Date = new Date(event.target.value);
    this.model.CompleteBy = value.toLocaleDateString("en-GB");
  }
}
