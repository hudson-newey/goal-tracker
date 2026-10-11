import {
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { take } from "rxjs";
import { ILogbook, Logbook } from "../../../models/logbook";
import { LogbookService } from "../../../services/logbook/logbook.service";
import { RouterLink } from "@angular/router";
import { VirtualDatabaseService } from "../../../services/virtualDatabase/virtual-database.service";

@Component({
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.less",
  imports: [RouterLink],
})
export class LogbookListComponent implements OnInit {
  private readonly api = inject(LogbookService);
  private readonly virtualDb = inject(VirtualDatabaseService);

  protected logbooks: Logbook[] = [];

  public ngOnInit(): void {
    this.updateLogbooks();

    this.virtualDb.changeNotifier.addEventListener("change", () =>
      this.updateLogbooks(),
    );
  }

  public updateLogbooks(): void {
    this.api
      .getLogbooks()
      .pipe(take(1))
      .subscribe((response) => {
        this.logbooks = response.data
          .map((model: ILogbook) => new Logbook(model))
          .sort(this.logbookSorter);
      });
  }

  // sorts logbooks in descending order (so that the most recently created
  // logbook is at the top of the list)
  private logbookSorter(a: Logbook, b: Logbook): number {
    const aCreated = new Date(a.CreatedAt ?? 0).getTime();
    const bCreated = new Date(b.CreatedAt ?? 0).getTime();

    if (aCreated > bCreated) {
      return -1;
    } else if (aCreated < bCreated) {
      return 1;
    }

    return 0;
  }
}
