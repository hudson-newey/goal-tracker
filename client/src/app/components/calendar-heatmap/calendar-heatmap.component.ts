import { AfterViewInit, Component, effect, input, inject } from "@angular/core";
import schema from "./calendar-heatmap.schema.json";
import embed from "vega-embed";
import { normalizeStoredDate, toIsoDate } from "../../utils/dates";

interface CalendarData {
  date: string;
  count: number;
}

@Component({
  selector: "app-calendar-heatmap",
  template: ` <div id="calendar-element"></div> `,
  styleUrl: "calendar-heatmap.component.less",
})
export class CalendarHeatmapComponent implements AfterViewInit {
  public readonly data = input<string[]>([]);

  private spec: any = schema;
  private chart: any;
  private lastRenderedKey = "";

  constructor() {
    // re-render whenever the input changes (e.g. after a sync pull)
    effect(() => {
      const data = this.data();

      if (this.chart) {
        this.render(data);
      }
    });
  }

  public async ngAfterViewInit(): Promise<void> {
    await this.render(this.data());
  }

  private async render(data: string[]): Promise<void> {
    // the element can disappear while a render is pending (e.g. the
    // component was destroyed or the view changed)
    if (!document.getElementById("calendar-element")) {
      return;
    }

    // the input is a getter on the parent model, so it is a new array on
    // every change detection cycle; only re-render when it really changed
    const key = [...data].sort().join(",");

    if (key === this.lastRenderedKey) {
      return;
    }

    this.lastRenderedKey = key;

    this.spec = {
      ...this.spec,
      data: { values: this.formatData(data) },
    };

    try {
      this.chart = await embed("#calendar-element", this.spec, {
        actions: false,
      });
    } catch {
      // ignore render failures (e.g. the element was removed mid-render)
    }
  }

  private formatData(data: string[]): CalendarData[] {
    // normalize every entry to "YYYY-MM-DD" and count occurrences
    const normalizedDates = data
      .map((date) => normalizeStoredDate(date))
      .filter((date): date is string => date !== null);

    const dateCounts: { [date: string]: number } = {};

    for (const date of normalizedDates) {
      dateCounts[date] = (dateCounts[date] ?? 0) + 1;
    }

    const allDates = Object.keys(dateCounts);

    if (allDates.length === 0) {
      return [];
    }

    // walk day by day from the first to the last completed date so that the
    // chart has one entry per day (the previous implementation iterated
    // day=1..31 for every month, which rolled over into invalid dates like
    // Feb 31 -> Mar 3)
    const sortedDates = allDates.sort();
    const minDate = new Date(`${sortedDates[0]}T00:00:00`);
    const maxDate = new Date(`${sortedDates[sortedDates.length - 1]}T00:00:00`);

    const result: CalendarData[] = [];

    for (
      let date = new Date(minDate);
      date <= maxDate;
      date.setDate(date.getDate() + 1)
    ) {
      const key = toIsoDate(date);
      result.push({ date: key, count: dateCounts[key] ?? 0 });
    }

    return result;
  }
}
