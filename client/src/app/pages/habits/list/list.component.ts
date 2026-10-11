import { Component, OnInit, inject } from "@angular/core";
import { take } from "rxjs";
import { Habit, IHabit } from "../../../models/habit";
import { HabitsService } from "../../../services/habits/habits.service";
import { HabitsTableComponent } from "../../../components/habits-table/habits-table.component";
import { RouterLink } from "@angular/router";
import { VirtualDatabaseService } from "../../../services/virtualDatabase/virtual-database.service";
import { VibrationService } from "../../../services/vibration/vibration.service";

@Component({
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.less",
  imports: [RouterLink, HabitsTableComponent],
})
export class HabitListComponent implements OnInit {
  private readonly api = inject(HabitsService);
  private readonly virtualDb = inject(VirtualDatabaseService);
  private readonly vibration = inject(VibrationService);

  protected habits: Habit[] = [];

  protected get inCompleteHabits(): Habit[] {
    return this.habits.filter((habit: Habit) => !this.isCompletedToday(habit));
  }

  protected get completedHabits(): Habit[] {
    return this.habits.filter(
      (habit: Habit) => !habit.AntiHabit && this.isCompletedToday(habit),
    );
  }

  protected get failedAntiHabits(): Habit[] {
    return this.habits.filter(
      (habit: Habit) => habit.AntiHabit && this.isCompletedToday(habit),
    );
  }

  public ngOnInit(): void {
    this.updateHabits();

    this.virtualDb.changeNotifier.addEventListener("change", () =>
      this.updateHabits(),
    );
  }

  public updateHabits(): void {
    this.api
      .getHabits()
      .pipe(take(1))
      .subscribe((response) => {
        this.habits = response.data.map((model: IHabit) => new Habit(model));
      });
  }

  public completeHabit(model: Habit): void {
    model.completeToday();

    this.api
      .updateHabit(model)
      .pipe(take(1))
      .subscribe(() => {});

    this.vibration.completionVibration();
  }

  public uncompleteHabit(model: Habit): void {
    model.uncompleteToday();

    this.api
      .updateHabit(model)
      .pipe(take(1))
      .subscribe(() => {});
  }

  protected isCompletedToday(model: Habit): boolean {
    return model.IsCompletedToday;
  }
}
