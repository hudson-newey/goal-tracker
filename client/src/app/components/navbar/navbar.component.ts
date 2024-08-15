import { Component } from "@angular/core";
import { RouterLinkActive, RouterLink } from "@angular/router";

@Component({
  selector: "app-navbar",
  templateUrl: "navbar.component.html",
  styleUrls: ["navbar.component.less"],
  standalone: true,
  imports: [RouterLinkActive, RouterLink],
})
export class NavbarComponent { }
