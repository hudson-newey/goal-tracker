import { ChangeDetectionStrategy, Component } from "@angular/core";
import { GoalFormComponent } from "../../../components/forms/goal-form/goal-form.component";

@Component({
  template: `<app-goal-form [creating]="true"></app-goal-form>`,
  imports: [GoalFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewGoalPageComponent {}
