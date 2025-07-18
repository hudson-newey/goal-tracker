import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AbstractFormComponent } from "../abstract-form.component";
import { GoalsService } from "src/app/services/goals/goals.service";
import { Goal, IGoal } from "src/app/models/goal";
import { take } from "rxjs";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ITask, Task } from "src/app/models/task";
import { Habit, IHabit } from "src/app/models/habit";
import { GptService } from "src/app/services/gpt/gpt.service";

import { HabitsService } from "src/app/services/habits/habits.service";
import { TasksService } from "src/app/services/tasks/tasks.service";

@Component({
  selector: "app-goal-form",
  templateUrl: "./goal-form.component.html",
  styleUrl: "./goal-form.component.less",
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalFormComponent extends AbstractFormComponent<IGoal> {
  private api = inject(GoalsService);
  private gptApi = inject(GptService);
  private habitsApi = inject(HabitsService);
  private tasksApi = inject(TasksService);
  private router = inject(Router);

  protected aiHabits: Habit[] = [];
  protected aiTasks: Task[] = [];

  public submitForm(): void {
    const goalModel = new Goal(this.model());

    if (this.creating()) {
      this.api
        .createGoal(goalModel)
        .pipe(take(1))
        .subscribe(() => {
          this.router.navigate(["/goals"]);
        });
    } else {
      this.api
        .updateGoal(goalModel)
        .pipe(take(1))
        .subscribe(() => {
          this.router.navigate(goalModel.ViewUrl);
        });
    }
  }

  protected updateCompleteBy(event: any): void {
    const value = new Date(event.target.value);
    this.model().CompleteBy = value.toLocaleDateString("en-GB");
  }

  protected getAiTasksAndHabits(): void {
    if (!this.model().Name) {
      console.error("Goal name is required to generate AI tasks and habits.");
      return;
    }

    this.gptApi
      .getHabitsForGoal(this.model())
      .pipe(take(1))
      .subscribe((response) => {
        this.aiHabits = response.data.map((model: IHabit) => new Habit(model));
      });

    this.gptApi
      .getTasksForGoal(this.model())
      .pipe(take(1))
      .subscribe((response) => {
        this.aiTasks = response.data.map((model: ITask) => new Task(model));
      });
  }

  // used when the user adds a suggested habits from the ai suggested habits
  protected addSuggestedHabit(habitModel: Habit): void {
    if (this.model()?.ClientId || this.model()?.ClientId === "0") {
      habitModel.Goal = this.model().ClientId as any;
    }

    this.habitsApi
      .createHabit(habitModel)
      .pipe(take(1))
      .subscribe(() => {
        this.aiHabits = this.aiHabits.filter(
          (habit) => habit.Name !== habitModel.Name,
        );
      });
  }

  // used when the user adds a suggested tasks from the ai suggested tasks
  protected addSuggestedTask(taskModel: Task): void {
    if (this.model()?.ClientId || this.model()?.ClientId === "0") {
      taskModel.Goal = this.model().ClientId as any;
    }

    this.tasksApi
      .createTask(taskModel)
      .pipe(take(1))
      .subscribe(() => {
        this.aiTasks = this.aiTasks.filter(
          (task) => task.Name !== taskModel.Name,
        );
      });
  }
}
