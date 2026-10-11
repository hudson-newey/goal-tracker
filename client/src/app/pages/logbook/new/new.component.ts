import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ILogbook, Logbook } from "../../../models/logbook";
import { LogbookService } from "../../../services/logbook/logbook.service";
import { FormsModule } from "@angular/forms";
import { todayIso } from "../../../utils/dates";

@Component({
  templateUrl: "./new.component.html",
  styleUrl: "./new.component.less",
  imports: [FormsModule],
})
export class LogbookNewComponent {
  private readonly router = inject(Router);
  private readonly api = inject(LogbookService);

  protected model: ILogbook = {
    CreatedAt: todayIso(),
  };

  protected submitForm(): void {
    const logbookModel: Logbook = new Logbook(this.model);

    this.api
      .createLogbook(logbookModel)
      .subscribe(() => this.router.navigateByUrl("/logbook"));
  }
}
