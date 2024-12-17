import { Component } from "@angular/core";
import { RouterLinkActive, RouterLink } from "@angular/router";

@Component({
  selector: "app-navbar",
  templateUrl: "navbar.component.html",
  styleUrl: "navbar.component.less",
  imports: [RouterLinkActive, RouterLink],
})
export class NavbarComponent {}
