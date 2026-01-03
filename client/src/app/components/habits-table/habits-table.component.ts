import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { Habit } from "src/app/models/habit";
import { RouterLink } from "@angular/router";
import { NoContextMenuDirective } from "../../directives/no-context-menu.directive";

@Component({
  selector: "app-habits-table",
  templateUrl: "./habits-table.component.html",
  styleUrl: "./habits-table.component.less",
  imports: [NoContextMenuDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitsTableComponent {
  public readonly models = input.required<Habit[]>();
  public readonly changeState = output<Habit>();
  public readonly decrementState = output<Habit>();

  protected readonly showAntiHabits = signal(false);

  protected readonly positiveHabits = computed(() =>
    this.models().filter((habit) => !habit.AntiHabit),
  );

  protected readonly antiHabits = computed(() =>
    this.models().filter((habit) => habit.AntiHabit),
  );

  protected toggleAntiHabits(): void {
    this.showAntiHabits.update((currentValue) => !currentValue);
  }
}
