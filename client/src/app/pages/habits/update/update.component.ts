import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { take } from "rxjs";
import { IHabit } from "../../../models/habit";
import { HabitsService } from "../../../services/habits/habits.service";
import { Id } from "../../../types/helpers";
import { HabitFormComponent } from "../../../components/forms/habit-form/habit-form.component";

@Component({
  templateUrl: "./update.component.html",
  imports: [HabitFormComponent],
})
export class HabitsUpdateComponent {
  private readonly api = inject(HabitsService);
  private readonly route = inject(ActivatedRoute);

  protected model: IHabit = {};

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getHabit(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = response.data;
      });
  }
}
