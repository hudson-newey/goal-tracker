import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { take } from "rxjs";
import { Goal } from "src/app/models/goal";
import { Habit } from "src/app/models/habit";
import { Task } from "src/app/models/task";
import { GoalsService } from "src/app/services/goals/goals.service";
import { Id } from "src/app/types/helpers";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-goal-page",
  templateUrl: "show.component.html",
  standalone: true,
  imports: [RouterLink, DatePipe],
})
export class GoalPageComponent implements OnInit {
  public constructor(
    private api: GoalsService,
    private route: ActivatedRoute,
  ) {}

  protected model?: Goal;
  protected associatedTasks?: Task[];
  protected associatedHabits?: Habit[];

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getGoal(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = new Goal(response.data);

        // associations
        this.api
          .getGoalHabits(modelId)
          .pipe(take(1))
          .subscribe((response) => {
            this.associatedHabits = response.data.map(
              (habit) => new Habit(habit),
            );
          });

        this.api
          .getGoalTasks(modelId)
          .pipe(take(1))
          .subscribe((response) => {
            this.associatedTasks = response.data.map((task) => new Task(task));
          });
      });
  }
}
