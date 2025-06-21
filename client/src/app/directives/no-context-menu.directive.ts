import { Directive, HostListener } from "@angular/core";

@Directive({ selector: "[appNoContextMenu]" })
export class NoContextMenuDirective {
  @HostListener("contextmenu", ["$event"])
  public onRightClick(event: MouseEvent) {
    event.preventDefault();
  }
}
