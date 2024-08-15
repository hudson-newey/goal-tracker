import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Habit } from "src/app/models/habit";
import { RouterLink } from "@angular/router";
import { NoContextMenuDirective } from "../../directives/no-context-menu.directive";
import { NgFor, NgIf } from "@angular/common";

@Component({
  selector: "app-habits-table",
  templateUrl: "./habits-table.component.html",
  styleUrl: "./habits-table.component.less",
  standalone: true,
  imports: [NgFor, NoContextMenuDirective, RouterLink, NgIf],
})
export class HabitsTableComponent {
  @Input({ required: true })
  public models: Habit[] = [];

  @Output()
  public changeState = new EventEmitter<Habit>();

  @Output()
  public decrementState = new EventEmitter<Habit>();

  protected showAntiHabits = false;

  protected get positiveHabits(): Habit[] {
    return this.models.filter((habit) => !habit.AntiHabit);
  }

  protected get antiHabits(): Habit[] {
    return this.models.filter((habit) => habit.AntiHabit);
  }
}
