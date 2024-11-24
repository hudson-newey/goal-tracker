import { Id } from "../types/helpers";
import { AbstractModel } from "./abstractModel";

export interface ITask {
  Id?: Id;
  ClientId?: Id;
  Name?: string;
  Description?: string;
  Completed?: boolean;
  Goal?: Id;
  Importance?: number;
  CompleteBy?: string;
  DependsOn?: Id[];
  LastUpdated?: string;
}

export class Task extends AbstractModel<ITask> implements ITask {
  public constructor(data: ITask) {
    super(data);
  }

  public Id!: Id;
  public ClientId!: Id;
  public Name!: string;
  public Description!: string;
  public Completed!: boolean;
  public Goal!: Id;
  public Importance: number = 1;
  public CompleteBy!: string;
  public DependsOn!: Id[];
  public LastUpdated!: string;

  public override get ViewUrl(): any[] {
    return ["/tasks", this.ClientId];
  }

  public override get EditUrl(): any[] {
    return ["/tasks", this.ClientId, "edit"];
  }

  public override get DeleteUrl(): any[] {
    return ["/tasks", this.ClientId, "delete"];
  }

  public get ImportanceHuman(): string {
    const map: Record<number, string> = {
      1: "Low",
      2: "Low-Medium",
      3: "Medium",
      4: "Medium-High",
      5: "High",
    } as const;

    if (!(this.Importance in map)) {
      return "Unknown Importance";
    }

    return map[this.Importance];
  }

  public get isOverdue(): boolean {
    const now = new Date();
    const due = new Date(this.CompleteBy);
    return now > due;
  }
}
