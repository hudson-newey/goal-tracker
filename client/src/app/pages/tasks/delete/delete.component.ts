import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs";
import { Task } from "src/app/models/task";
import { TasksService } from "src/app/services/tasks/tasks.service";
import { Id } from "src/app/types/helpers";

@Component({
  templateUrl: "./delete.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteTaskPageComponent implements OnInit {
  private readonly api = inject(TasksService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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
