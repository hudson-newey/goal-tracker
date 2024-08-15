import { Component } from "@angular/core";
import { ClientConfigService } from "src/app/services/clientConfig/client-config.service";
import { FormsModule } from "@angular/forms";
import { SyncQueueService } from "src/app/services/syncQueue/sync-queue.service";

@Component({
  selector: "app-configure",
  templateUrl: "./configure.component.html",
  styleUrls: ["./configure.component.less"],
  standalone: true,
  imports: [FormsModule],
})
export class ConfigurePageComponent {
  public constructor(
    private configService: ClientConfigService,
    private syncService: SyncQueueService,
  ) {}

  protected customServerUrl: string =
    this.configService.getCustomServerUrl() ?? "";
  protected formFeedback: string = "";

  protected get isSyncServerSet(): boolean {
    return this.configService.isCustomServerUrlSet();
  }

  protected saveCustomServerUrl(): void {
    if (this.customServerUrl.endsWith("/")) {
      this.customServerUrl = this.customServerUrl.slice(0, -1);
    }

    if (!this.customServerUrl.includes("://")) {
      this.customServerUrl = "http://" + this.customServerUrl;
    }

    if (this.customServerUrl) {
      this.configService.setCustomServerUrl(this.customServerUrl);
      this.formFeedback = "Custom server URL saved!";
    } else {
      this.formFeedback = "Please enter a valid server URL.";
    }
  }

  protected clearCustomServerUrl(): void {
    this.customServerUrl = "";

    this.configService.clearCustomServerUrl();

    this.formFeedback = "Custom server URL cleared!";
  }

  protected forceSync(): void {
    this.syncService.attemptSync();
  }
}
