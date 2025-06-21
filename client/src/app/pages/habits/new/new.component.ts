import { ChangeDetectionStrategy, Component } from "@angular/core";
import { IHabit } from "src/app/models/habit";
import { HabitFormComponent } from "../../../components/forms/habit-form/habit-form.component";

@Component({
  templateUrl: "./new.component.html",
  imports: [HabitFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewHabitPage {
  public constructor() {}

  // we don't do this in the habit form because it would update the "created at"
  // date when an update is made (not only on creation)
  protected partialModel: IHabit = {
    CreatedAt: new Date().toLocaleDateString("en-GB"),
  };
}
