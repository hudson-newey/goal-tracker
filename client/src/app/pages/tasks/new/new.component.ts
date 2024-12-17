import { Component } from "@angular/core";
import { TaskFormComponent } from "../../../components/forms/task-form/task-form.component";

@Component({
  selector: "app-new-task-page",
  template: `<app-task-form [creating]="true"></app-task-form>`,
  imports: [TaskFormComponent],
})
export class NewTaskPageComponent {}
