import { Id } from "../types/helpers";
import { Seconds } from "../types/units";
import { AbstractModel } from "./abstractModel";
import { normalizeStoredDate, todayIso, toIsoDate } from "../utils/dates";

export interface IHabit {
  Id?: Id;
  ClientId?: Id;
  Name?: string;
  Description?: string;
  CompletedDates?: string[];
  CreatedAt?: string;
  Goal?: Id;
  AntiHabit?: boolean;
  IsQuantifiable?: boolean;
  IsTimeBased?: boolean;
  TargetValue?: number;
  TargetTime?: Seconds;
  DependsOn?: Id[];
  LastUpdated?: string;
}

export class Habit extends AbstractModel<IHabit> implements IHabit {
  public constructor(data: IHabit) {
    super(data);

    // normalize dates that were stored in the old locale format
    // (e.g. "25/12/2024") to ISO "YYYY-MM-DD" so that comparisons,
    // the heatmap and the server all agree on one format
    this.CompletedDates = Array.from(
      new Set(
        (data?.CompletedDates ?? [])
          .map((date) => normalizeStoredDate(date))
          .filter((date): date is string => date !== null),
      ),
    ).sort();

    const normalizedCreatedAt = normalizeStoredDate(data?.CreatedAt);
    if (normalizedCreatedAt) {
      this.CreatedAt = normalizedCreatedAt;
    }
  }

  public Id!: Id;
  public ClientId!: Id;
  public Name!: string;
  public Description!: string;
  public AntiHabit!: boolean;
  public CompletedDates!: string[]; // as ISO 8601
  public CreatedAt!: string; // as ISO 8601
  public Goal!: Id;
  public IsQuantifiable!: boolean;
  public IsTimeBased!: boolean;
  public TargetValue!: number;
  public TargetTime!: Seconds;
  public DependsOn!: Id[];
  public LastUpdated!: string;

  public override get ViewUrl(): any[] {
    return [`/habits`, this.ClientId];
  }

  public override get EditUrl(): any[] {
    return [`/habits`, this.ClientId, "edit"];
  }

  public override get DeleteUrl(): any[] {
    return [`/habits`, this.ClientId, "delete"];
  }

  public get TimesCompletedToday(): number {
    const currentDate = todayIso();
    return (
      this.CompletedDates?.filter((date: string) => date === currentDate)
        .length ?? 0
    );
  }

  public get IsCompletedToday(): boolean {
    if (this.IsQuantifiable) {
      return this.TimesCompletedToday >= this.TargetValue;
    }

    return this.TimesCompletedToday > 0;
  }

  public completeToday(): void {
    if (!this.CompletedDates?.length) {
      this.CompletedDates = [];
    }

    this.CompletedDates.push(todayIso());
  }

  public uncompleteToday(): void {
    const currentDate = todayIso();

    const indexToRemove: number = (this.CompletedDates ?? []).findIndex(
      (item: string) => item === currentDate,
    );

    if (indexToRemove !== -1) {
      this.CompletedDates.splice(indexToRemove, 1);
    }
  }

  public get FormattedCompletedDates(): string[] {
    let formattedCompletedDates: string[] = [];

    if (this.AntiHabit) {
      const currentDate = new Date();
      const createdAtDate = new Date(this.CreatedAt);

      if (!Number.isNaN(createdAtDate.getTime())) {
        for (
          let date = new Date(createdAtDate);
          date <= currentDate;
          date.setDate(date.getDate() + 1)
        ) {
          const formattedDate = toIsoDate(date);
          if (
            !this.CompletedDates ||
            !this.CompletedDates.includes(formattedDate)
          ) {
            formattedCompletedDates.push(formattedDate);
          }
        }
      }
    } else {
      formattedCompletedDates = (this.CompletedDates ?? []).filter(
        (date) => date !== null,
      );
    }

    return formattedCompletedDates ?? [];
  }
}
