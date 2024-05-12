import { Injectable } from "@angular/core";
import { AbstractService } from "../abstract-service.service";

@Injectable({ providedIn: "root" })
export class VibrationService extends AbstractService {
  public constructor() {
    super();
  }

  public completionVibration(): void {
    navigator.vibrate(1001);
  }
}
