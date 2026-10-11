import { Component } from "@angular/core";
import { IHabit } from "../../../models/habit";
import { HabitFormComponent } from "../../../components/forms/habit-form/habit-form.component";
import { todayIso } from "../../../utils/dates";

@Component({
  templateUrl: "./new.component.html",
  imports: [HabitFormComponent],
})
export class NewHabitPage {
  public constructor() {}

  // we don't do this in the habit form because it would update the "created at"
  // date when an update is made (not only on creation)
  protected partialModel: IHabit = {
    CreatedAt: todayIso(),
  };
}
