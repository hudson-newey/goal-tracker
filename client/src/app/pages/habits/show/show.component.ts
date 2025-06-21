import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { take } from "rxjs";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Habit } from "src/app/models/habit";
import { Id } from "src/app/types/helpers";
import { HabitsService } from "src/app/services/habits/habits.service";
import { Goal } from "src/app/models/goal";
import { GoalsService } from "src/app/services/goals/goals.service";
import { CalendarHeatmapComponent } from "../../../components/calendar-heatmap/calendar-heatmap.component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
  templateUrl: "./show.component.html",
  imports: [RouterLink, FaIconComponent, CalendarHeatmapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitShowPageComponent implements OnInit {
  private api = inject(HabitsService);
  private route = inject(ActivatedRoute);
  private goalApi = inject(GoalsService);

  // font-awesome icons
  protected faCheck = faCheck;
  protected faXmark = faXmark;

  protected model?: Habit;
  protected goalModel?: Goal;
  protected recentCompletedDates: string[] = [];

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getHabit(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = new Habit(response.data);

        // to prevent there being a huge list of completed dates
        // we only show the last week of completed dates
        // I don't do this on the model because we still use the full list in other places
        // eg. The heat map and calendar view
        const completedDates = this.model?.CompletedDates ?? [];
        const uniqueCompletedDates = Array.from(new Set(completedDates));

        this.recentCompletedDates = uniqueCompletedDates.slice(-7) ?? [];

        if (!this.model?.Goal) {
          return;
        }

        this.goalApi
          .getGoal(this.model?.Goal as Id)
          .pipe(take(1))
          .subscribe((response) => {
            this.goalModel = new Goal(response.data);
          });
      });
  }
}
