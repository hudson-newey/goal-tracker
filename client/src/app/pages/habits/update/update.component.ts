import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { take } from "rxjs";
import { IHabit } from "src/app/models/habit";
import { HabitsService } from "src/app/services/habits/habits.service";
import { Id } from "src/app/types/helpers";
import { HabitFormComponent } from "../../../components/forms/habit-form/habit-form.component";

@Component({
  selector: "app-update-habit",
  template: `<app-habit-form
    [creating]="false"
    [model]="model"
  ></app-habit-form>`,
  standalone: true,
  imports: [HabitFormComponent],
})
export class HabitsUpdateComponent {
  public constructor(
    private api: HabitsService,
    private route: ActivatedRoute,
  ) {}

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
