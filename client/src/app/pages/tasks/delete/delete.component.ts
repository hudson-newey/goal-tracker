import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs";
import { Task } from "src/app/models/task";
import { TasksService } from "src/app/services/tasks/tasks.service";
import { Id } from "src/app/types/helpers";

@Component({
  selector: "app-delete-task-page",
  templateUrl: "delete.component.html",
  standalone: true,
})
export class DeleteTaskPageComponent implements OnInit {
  public constructor(
    private api: TasksService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  protected model?: Task;

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getTask(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = new Task(response.data);
      });
  }

  protected deleteModel(): void {
    if (!this.model) {
      throw new Error("Model is not defined");
    }

    this.api
      .deleteTask(this.model?.ClientId)
      .pipe(take(1))
      .subscribe(() => this.router.navigateByUrl("/tasks"));
  }
}
