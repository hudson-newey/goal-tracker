import { Component, EventEmitter, Output, input } from "@angular/core";
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

  @Output()
  public changeState = new EventEmitter<Habit>();

  @Output()
  public decrementState = new EventEmitter<Habit>();

  protected showAntiHabits = false;

  protected get positiveHabits(): Habit[] {
    return this.models().filter((habit) => !habit.AntiHabit);
  }

  protected get antiHabits(): Habit[] {
    return this.models().filter((habit) => habit.AntiHabit);
  }
}
