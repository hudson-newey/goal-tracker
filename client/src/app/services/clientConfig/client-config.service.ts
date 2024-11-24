import { Injectable } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { environment } from "src/environment";
import { SyncQueueService } from "../syncQueue/sync-queue.service";

export const customServerStorageKey = "customServerUrl" as const;

@Injectable({ providedIn: "root" })
export class ClientConfigService extends AbstractService {
  public constructor() {
    super();
  }

  public getCustomServerUrl(): string | null {
    return localStorage.getItem(customServerStorageKey);
  }

  public setCustomServerUrl(url: string): void {
    environment.endpoint = url;
    return localStorage.setItem(customServerStorageKey, url);
  }

  public clearCustomServerUrl(): void {
    localStorage.removeItem(customServerStorageKey);
    environment.endpoint = "";
  }

  public isCustomServerUrlSet(): boolean {
    return this.getCustomServerUrl() !== null;
  }
}
