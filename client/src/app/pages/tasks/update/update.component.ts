import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { take } from "rxjs";
import { ITask } from "../../../models/task";
import { TasksService } from "../../../services/tasks/tasks.service";
import { Id } from "../../../types/helpers";
import { TaskFormComponent } from "../../../components/forms/task-form/task-form.component";

@Component({
  templateUrl: "./update.component.html",
  imports: [TaskFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksUpdateComponent implements OnInit {
  private readonly api = inject(TasksService);
  private readonly route = inject(ActivatedRoute);

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
