import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { SyncQueueService } from "./services/syncQueue/sync-queue.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.less",
  providers: [SyncQueueService],
  imports: [NavbarComponent, RouterOutlet],
})
export class AppComponent {
  private syncQueueService = inject(SyncQueueService);

  public constructor() {
    this.syncQueueService.attemptSync();
  }
}
