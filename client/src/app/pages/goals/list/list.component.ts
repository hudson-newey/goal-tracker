import {
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { take } from "rxjs";
import { Goal, IGoal } from "../../../models/goal";
import { GoalsService } from "../../../services/goals/goals.service";
import { FormsModule } from "@angular/forms";

import { RouterLink } from "@angular/router";
import { VirtualDatabaseService } from "../../../services/virtualDatabase/virtual-database.service";
import { VibrationService } from "../../../services/vibration/vibration.service";

@Component({
  templateUrl: "./list.component.html",
  imports: [RouterLink, FormsModule],
})
export class GoalsPageComponent implements OnInit {
  private readonly api = inject(GoalsService);
  private readonly virtualDb = inject(VirtualDatabaseService);
  private readonly vibration = inject(VibrationService);

  protected goals: Goal[] = [];

  public ngOnInit(): void {
    this.updateGoals();

    this.virtualDb.changeNotifier.addEventListener("change", () =>
      this.updateGoals(),
    );
  }

  public updateGoals(): void {
    this.api
      .listGoals()
      .pipe(take(1))
      .subscribe((response) => {
        this.goals = response.data.map((model: IGoal) => new Goal(model));
      });
  }

  public completeGoal(model: Goal): void {
    this.updateGoal(model);
    this.vibration.completionVibration();
  }

  public updateGoal(model: Goal): void {
    this.api
      .updateGoal(model)
      .pipe(take(1))
      .subscribe((response) => {
        model = new Goal(response.data);
      });
  }
}
