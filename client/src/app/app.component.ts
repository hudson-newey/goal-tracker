import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { SyncQueueService } from "./services/syncQueue/sync-queue.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
  standalone: true,
  providers: [SyncQueueService],
  imports: [NavbarComponent, RouterOutlet],
})
export class AppComponent {
  public constructor(private syncQueueService: SyncQueueService) {
    this.syncQueueService.attemptSync();
  }
}
