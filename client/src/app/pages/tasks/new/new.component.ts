import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TaskFormComponent } from "../../../components/forms/task-form/task-form.component";

@Component({
  template: `<app-task-form [creating]="true"></app-task-form>`,
  imports: [TaskFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTaskPageComponent {}
