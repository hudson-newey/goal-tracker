import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { take } from "rxjs";
import { Goal } from "src/app/models/goal";
import { Task } from "src/app/models/task";
import { GoalsService } from "src/app/services/goals/goals.service";
import { TasksService } from "src/app/services/tasks/tasks.service";
import { Id } from "src/app/types/helpers";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-task-page",
  templateUrl: "show.component.html",
  standalone: true,
  imports: [RouterLink, DatePipe],
})
export class TaskPageComponent implements OnInit {
  public constructor(
    private api: TasksService,
    private route: ActivatedRoute,
    private goalApi: GoalsService,
  ) {}

  protected model?: Task;
  protected goalModel?: Goal;

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getTask(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = new Task(response.data);

        this.goalApi
          .getGoal(this.model?.Goal as Id)
          .pipe(take(1))
          .subscribe((response) => {
            this.goalModel = new Goal(response.data);
          });
      });
  }
}
