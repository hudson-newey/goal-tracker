import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ILogbook, Logbook } from "src/app/models/logbook";
import { LogbookService } from "src/app/services/logbook/logbook.service";
import { FormsModule } from "@angular/forms";

@Component({
  templateUrl: "./new.component.html",
  styleUrl: "./new.component.less",
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogbookNewComponent {
  private router = inject(Router);
  private api = inject(LogbookService);

  protected model: ILogbook = {
    CreatedAt: new Date().toLocaleDateString("en-GB"),
  };

  protected submitForm(): void {
    const logbookModel: Logbook = new Logbook(this.model);

    this.api
      .createLogbook(logbookModel)
      .subscribe(() => this.router.navigateByUrl("/logbook"));
  }
}
