import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { take } from "rxjs";
import { IGoal } from "src/app/models/goal";
import { GoalsService } from "src/app/services/goals/goals.service";
import { Id } from "src/app/types/helpers";
import { GoalFormComponent } from "../../../components/forms/goal-form/goal-form.component";

@Component({
  selector: "app-update-goal",
  template: `
    <app-goal-form [creating]="false" [model]="model"></app-goal-form>
  `,
  standalone: true,
  imports: [GoalFormComponent],
})
export class GoalsUpdateComponent implements OnInit {
  public constructor(
    private api: GoalsService,
    private route: ActivatedRoute,
  ) {}

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
