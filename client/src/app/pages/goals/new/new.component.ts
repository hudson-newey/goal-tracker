import { Component } from "@angular/core";
import { GoalFormComponent } from "../../../components/forms/goal-form/goal-form.component";

@Component({
  selector: "app-new-goal-page",
  template: `<app-goal-form [creating]="true"></app-goal-form>`,
  standalone: true,
  imports: [GoalFormComponent],
})
export class NewGoalPageComponent {}
