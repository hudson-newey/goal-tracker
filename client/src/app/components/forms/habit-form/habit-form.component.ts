import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { AbstractFormComponent } from "../abstract-form.component";
import { Habit, IHabit } from "src/app/models/habit";
import { Router } from "@angular/router";
import { HabitsService } from "src/app/services/habits/habits.service";
import { GoalsService } from "src/app/services/goals/goals.service";
import { Goal } from "src/app/models/goal";
import { BehaviorSubject, take } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-habit-form",
  templateUrl: "./habit-form.component.html",
  styleUrl: "./habit-form.component.less",
  imports: [FormsModule, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitFormComponent
  extends AbstractFormComponent<IHabit>
  implements OnInit
{
  private readonly router = inject(Router);
  private readonly api = inject(HabitsService);
  private readonly goalApi = inject(GoalsService);

  protected readonly goals$ = new BehaviorSubject<Goal[]>([]);

  public ngOnInit(): void {
    this.goalApi
      .listGoals()
      .pipe(take(1))
      .subscribe((response) =>
        this.goals$.next(response.data.map((goalModel) => new Goal(goalModel))),
      );
  }

  protected submitForm(): void {
    const habitModel = new Habit(this.model());

    if (this.creating()) {
      this.api
        .createHabit(habitModel)
        .pipe(take(1))
        .subscribe(() => this.router.navigate(["/"]));
    } else {
      this.api
        .updateHabit(habitModel)
        .pipe(take(1))
        .subscribe(() => this.router.navigate(habitModel.ViewUrl));
    }
  }
}
