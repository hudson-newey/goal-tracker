import { Id } from "../types/helpers";
import { AbstractModel } from "./abstractModel";
import { normalizeStoredDate } from "../utils/dates";

export interface IGoal {
  Id?: Id;
  ClientId?: Id;
  Name?: string;
  Description?: string;
  Completed?: boolean;
  CompleteBy?: string;
  LastUpdated?: string;
}

export class Goal extends AbstractModel<IGoal> implements IGoal {
  public constructor(data: IGoal) {
    super(data);

    const normalizedCompleteBy = normalizeStoredDate(data?.CompleteBy);
    if (normalizedCompleteBy) {
      this.CompleteBy = normalizedCompleteBy;
    }
  }

  public Id!: Id;
  public ClientId!: Id;
  public Name!: string;
  public Description!: string;
  public Completed!: boolean;
  public CompleteBy!: string;
  public LastUpdated!: string;

  public override get ViewUrl(): any[] {
    return ["/goals", this.ClientId];
  }

  public override get EditUrl(): any[] {
    return ["/goals", this.ClientId, "edit"];
  }

  public override get DeleteUrl(): any[] {
    return ["/goals", this.ClientId, "delete"];
  }
}
