import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-no-items-placeholder",
  templateUrl: "./no-items-placeholder.component.html",
  styleUrl: "./no-items-placeholder.component.less",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoItemsPlaceholderComponent {}
