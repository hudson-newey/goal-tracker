import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs";
import { Logbook } from "src/app/models/logbook";
import { LogbookService } from "src/app/services/logbook/logbook.service";
import { Id } from "src/app/types/helpers";

@Component({
  selector: "app-delete",
  templateUrl: "./delete.component.html",
  styleUrls: ["./delete.component.less"],
  standalone: true,
})
export class LogbookDeleteComponent implements OnInit {
  public constructor(
    private api: LogbookService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  protected model?: Logbook;

  public ngOnInit(): void {
    const modelId: Id = this.route.snapshot.paramMap.get("id") as Id;

    this.api
      .getLogbook(modelId)
      .pipe(take(1))
      .subscribe((response) => {
        this.model = new Logbook(response.data);
      });
  }

  protected deleteModel(): void {
    if (!this.model) {
      throw new Error("Model is not defined");
    }

    this.api
      .deleteLogbook(this.model?.ClientId)
      .pipe(take(1))
      .subscribe(() => this.router.navigateByUrl("/logbook"));
  }
}
