import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Task } from "src/app/models/task";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-tasks-table",
  templateUrl: "./tasks-table.component.html",
  styleUrl: "./tasks-table.component.less",
  imports: [NgClass, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksTableComponent {
  public constructor() {}

  public readonly models = input<Task[]>([]);

  public readonly changeState = output<Task>();
}
