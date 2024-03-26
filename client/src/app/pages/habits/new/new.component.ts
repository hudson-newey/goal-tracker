import { Component } from "@angular/core";
import { IHabit } from "src/app/models/habit";

@Component({
  selector: "app-new-page",
  template: `<app-habit-form [creating]="true" [model]="partialModel"></app-habit-form>`,
})
export class NewHabitPage {
  public constructor() {}

  // we don't do this in the habit form because it would update the "created at"
  // date when an update is made (not only on creation)
  protected partialModel: IHabit = {
    CreatedAt: new Date().toLocaleDateString(),
  };
}
