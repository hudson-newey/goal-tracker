import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs";
import { Goal } from "src/app/models/goal";
import { GoalsService } from "src/app/services/goals/goals.service";
import { Id } from "src/app/types/helpers";

@Component({
  selector: "app-delete-page",
  templateUrl: "delete.component.html",
  standalone: true,
})
export class DeleteGoalPageComponent implements OnInit {
  public constructor(
    private api: GoalsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  protected model?: Goal;

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getGoal(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = new Goal(response.data);
      });
  }

  protected deleteModel(): void {
    if (!this.model) {
      throw new Error("Model is not defined");
    }

    this.api
      .deleteGoal(this.model?.ClientId)
      .pipe(take(1))
      .subscribe(() => this.router.navigateByUrl("/goals"));
  }
}
