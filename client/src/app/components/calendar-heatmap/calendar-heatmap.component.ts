// @ts-nocheck
import { AfterViewInit, Component, input } from "@angular/core";
import schema from "./calendar-heatmap.schema.json";
import embed from "vega-embed";

interface CalendarData {
  date: string;
  count: number;
}

@Component({
  selector: "app-calendar-heatmap",
  template: ` <div id="calendar-element"></div> `,
  styleUrl: "calendar-heatmap.component.less",
  standalone: true,
})
export class CalendarHeatmapComponent implements AfterViewInit {
  public constructor() {}

  public readonly data = input<string[]>([]);

  private spec: any = schema;
  private chart: any;

  public async ngAfterViewInit() {
    this.spec = this.addDataToSpec(this.data(), this.spec);

    this.chart = await embed("#calendar-element", this.spec);
  }

  private addDataToSpec(data: string[], spec: any): any {
    const newSpec = spec;
    newSpec.data.values = this.formatData(data);
    return newSpec;
  }

  private formatData(data: string[]): CalendarData[] {
    // Extract all unique dates from the original array
    const uniqueDates = Array.from(new Set(data));

    // Extract years from unique dates
    const years = uniqueDates.map((date) => new Date(date).getFullYear());

    // Get the minimum and maximum years
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    // Create an object to store counts for each date in the range
    const dateCounts: { [date: string]: number } = {};

    // Initialize counts to zero for all dates in the range
    for (let year = minYear; year <= maxYear; year++) {
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 31; day++) {
          const date = new Date(year, month - 1, day)
            .toLocaleDateString("en-GB")
            .split("T")[0];
          dateCounts[date] = 0;
        }
      }
    }

    // Increment counts for dates present in the original array
    for (let date of uniqueDates) {
      const formattedDate = new Date(date)
        .toLocaleDateString("en-GB")
        .split("T")[0];
      dateCounts[formattedDate] += 1;
    }

    // Convert the dateCounts object to an array of CalendarData
    const result: CalendarData[] = Object.entries(dateCounts).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    return result;
  }
}
