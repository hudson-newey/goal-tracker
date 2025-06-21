import { ChangeDetectionStrategy, Component, Input, input, output } from "@angular/core";
import { interval, Observable, of } from "rxjs";
import { Seconds } from "src/app/types/units";

@Component({
  selector: "app-timer",
  templateUrl: "./timer.component.html",
  styleUrl: "./timer.component.less",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent {
  /**
   * An inline timer can be used in list views, while a full sized counter
   * provides more fine-tuned adjustments
   */
  public readonly inline = input(false);

  public readonly targetTime = input(0);

  public value = input<Seconds>(0);

  public readonly valueChange = output<Seconds>();

  private timer?: Observable<number>;

  protected start(): void {
    this.timer = interval(1_000);

    this.timer.subscribe(() => {});
  }

  protected pause(): void {
    this.timer = of();
  }

  protected stop(): void {
    this.timer = of();
    this.value = 0;
  }
}
