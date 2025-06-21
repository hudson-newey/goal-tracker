import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  templateUrl: "./schedule.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulePageComponent {
  public constructor() {}
}
