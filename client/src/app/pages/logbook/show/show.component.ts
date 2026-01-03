import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { take } from "rxjs";
import { Logbook } from "src/app/models/logbook";
import { LogbookService } from "src/app/services/logbook/logbook.service";
import { Id } from "src/app/types/helpers";

@Component({
  templateUrl: "./show.component.html",
  styleUrl: "./show.component.less",
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogbookShowComponent {
  private readonly api = inject(LogbookService);
  private readonly route = inject(ActivatedRoute);

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
}
