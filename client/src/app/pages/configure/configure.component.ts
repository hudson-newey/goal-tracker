import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ClientConfigService } from "src/app/services/clientConfig/client-config.service";
import { FormsModule } from "@angular/forms";
import { SyncQueueService } from "src/app/services/syncQueue/sync-queue.service";

@Component({
  templateUrl: "./configure.component.html",
  styleUrl: "./configure.component.less",
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurePageComponent {
  private configService = inject(ClientConfigService);
  private syncService = inject(SyncQueueService);

  protected customServerUrl: string =
    this.configService.getCustomServerUrl() ?? "";
  protected formFeedback: string = "";
  protected serverSuggestions: string[] = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
  ];

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

      // we force sync as soon as we make a server connection so that the
      // client will have the most recent data
      this.forceSync();

      this.formFeedback = "Custom server URL saved!";
    } else {
      this.formFeedback = "Please enter a valid server URL.";
    }
  }

  protected clearCustomServerUrl(): void {
    this.customServerUrl = "";

    // TODO: setting the connection to false should be done in the config
    // service. However, this currently results in a circular DI
    // I have chosen to set the sync service status here because it's currently
    // only used here and I don't want to waste time debugging a circular DI
    //
    // I do a force sync before disconnecting to minimise the chances of
    // conflicting data when reconnecting and so that the server has the
    // most up-to-date representation of the client
    this.forceSync();
    this.syncService.connectionStatus = false;

    this.configService.clearCustomServerUrl();

    this.formFeedback = "Custom server URL cleared!";
  }

  protected forceSync(): void {
    this.syncService.attemptSync();
  }
}
