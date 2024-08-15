import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs";
import { Habit } from "src/app/models/habit";
import { HabitsService } from "src/app/services/habits/habits.service";
import { Id } from "src/app/types/helpers";

@Component({
  selector: "app-delete-habit-page",
  templateUrl: "delete.component.html",
  standalone: true,
})
export class DeleteHabitPageComponent implements OnInit {
  public constructor(
    private api: HabitsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  protected model?: Habit;

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getHabit(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = new Habit(response.data);
      });
  }

  protected deleteModel(): void {
    if (!this.model) {
      throw new Error("Model is not defined");
    }

    this.api
      .deleteHabit(this.model?.ClientId)
      .pipe(take(1))
      .subscribe(() => this.router.navigateByUrl("/"));
  }
}
