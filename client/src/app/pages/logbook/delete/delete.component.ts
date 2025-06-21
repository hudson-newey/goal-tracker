import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { take } from "rxjs";
import { Logbook } from "src/app/models/logbook";
import { LogbookService } from "src/app/services/logbook/logbook.service";
import { Id } from "src/app/types/helpers";

@Component({
  templateUrl: "./delete.component.html",
  styleUrl: "./delete.component.less",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogbookDeleteComponent implements OnInit {
  private api = inject(LogbookService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
