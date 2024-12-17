import { Component, input, output } from "@angular/core";
import { Habit } from "src/app/models/habit";
import { RouterLink } from "@angular/router";
import { NoContextMenuDirective } from "../../directives/no-context-menu.directive";

@Component({
  selector: "app-habits-table",
  templateUrl: "./habits-table.component.html",
  styleUrl: "./habits-table.component.less",
  imports: [NoContextMenuDirective, RouterLink],
})
export class HabitsTableComponent {
  public readonly models = input.required<Habit[]>();

  public readonly changeState = output<Habit>();

  public readonly decrementState = output<Habit>();

  protected showAntiHabits = false;

  protected get positiveHabits(): Habit[] {
    return this.models().filter((habit) => !habit.AntiHabit);
  }

  protected get antiHabits(): Habit[] {
    return this.models().filter((habit) => habit.AntiHabit);
  }
}
