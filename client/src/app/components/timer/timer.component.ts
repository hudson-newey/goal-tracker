import { Component, EventEmitter, Input, Output } from "@angular/core";
import { interval, Observable, of } from "rxjs";
import { Seconds } from "src/app/types/units";

@Component({
  selector: "app-timer",
  standalone: true,
  imports: [],
  templateUrl: "./timer.component.html",
  styleUrl: "./timer.component.less",
})
export class TimerComponent {
  /**
   * An inline timer can be used in list views, while a full sized counter
   * provides more fine-tuned adjustments
   */
  @Input()
  public inline = false;

  @Input()
  public targetTime = 0;

  @Input()
  public value: Seconds = 0;

  @Output()
  public valueChange = new EventEmitter<Seconds>();

  private timer?: Observable<number>;

  protected start(): void {
    this.timer = interval(1_000);

    this.timer.subscribe(() => {
    });
  }

  protected pause(): void {
    this.timer = of();
  }

  protected stop(): void {
    this.timer = of();
    this.value = 0;
  }
}