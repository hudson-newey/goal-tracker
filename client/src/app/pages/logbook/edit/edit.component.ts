import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs";
import { ILogbook, Logbook } from "src/app/models/logbook";
import { LogbookService } from "src/app/services/logbook/logbook.service";
import { Id } from "src/app/types/helpers";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.less",
  imports: [FormsModule],
})
export class LogbookEditComponent {
  public constructor(
    private api: LogbookService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  protected model: ILogbook = {};

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getLogbook(modelId)
      .pipe(take(1))
      .subscribe((model) => {
        this.model = model.data;
      });
  }

  protected submitForm(): void {
    const logbookModel: Logbook = new Logbook(this.model);

    this.api
      .updateLogbook(logbookModel)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(logbookModel.ViewUrl);
      });
  }
}
