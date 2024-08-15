import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[appNoContextMenu]",
  standalone: true,
})
export class NoContextMenuDirective {
  public constructor() {}

  @HostListener("contextmenu", ["$event"])
  public onRightClick(event: MouseEvent) {
    event.preventDefault();
  }
}
