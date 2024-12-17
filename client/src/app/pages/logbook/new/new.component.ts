import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ILogbook, Logbook } from "src/app/models/logbook";
import { LogbookService } from "src/app/services/logbook/logbook.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-new",
  templateUrl: "./new.component.html",
  styleUrl: "./new.component.less",
  imports: [FormsModule],
})
export class LogbookNewComponent {
  public constructor(
    private router: Router,
    private api: LogbookService,
  ) {}

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
