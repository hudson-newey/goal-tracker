import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Task } from "src/app/models/task";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-tasks-table",
  templateUrl: "./tasks-table.component.html",
  styleUrl: "./tasks-table.component.less",
  imports: [NgClass, FormsModule, RouterLink],
})
export class TasksTableComponent {
  public constructor() {}

  @Input()
  public models: Task[] = [];

  @Output()
  public changeState = new EventEmitter<Task>();
}
