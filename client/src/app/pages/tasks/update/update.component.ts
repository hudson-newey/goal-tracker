import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { take } from "rxjs";
import { ITask } from "src/app/models/task";
import { TasksService } from "src/app/services/tasks/tasks.service";
import { Id } from "src/app/types/helpers";
import { TaskFormComponent } from "../../../components/forms/task-form/task-form.component";

@Component({
  selector: "app-update-task",
  template: `<app-task-form
    [creating]="false"
    [model]="model"
  ></app-task-form>`,
  imports: [TaskFormComponent],
})
export class TasksUpdateComponent implements OnInit {
  public constructor(
    private api: TasksService,
    private route: ActivatedRoute,
  ) {}

  protected model: ITask = {};

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getTask(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = response.data;
      });
  }
}
