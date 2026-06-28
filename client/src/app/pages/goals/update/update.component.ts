import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { take } from "rxjs";
import { IGoal } from "../../../models/goal";
import { GoalsService } from "../../../services/goals/goals.service";
import { Id } from "../../../types/helpers";
import { GoalFormComponent } from "../../../components/forms/goal-form/goal-form.component";

@Component({
  templateUrl: "./update.component.html",
  imports: [GoalFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalsUpdateComponent implements OnInit {
  private readonly api = inject(GoalsService);
  private readonly route = inject(ActivatedRoute);

  protected model: IGoal = {};

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getGoal(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = response.data;
      });
  }
}
