import { Id } from "../types/helpers";
import { AbstractModel } from "./abstractModel";

export interface ILogbook {
  Id?: Id;
  ClientId?: Id;
  Name?: string;
  CreatedAt?: string;
  Content?: string;
  LastUpdated?: string;
}

export class Logbook extends AbstractModel<ILogbook> {
  public constructor(data: ILogbook) {
    super(data);
  }

  public Id!: Id;
  public ClientId!: Id;
  public Name!: string;
  public CreatedAt!: string;
  public Content!: string;

  public override get ViewUrl(): any[] {
    return ["/logbook", this.ClientId];
  }

  public override get EditUrl(): any[] {
    return ["/logbook", this.ClientId, "edit"];
  }

  public override get DeleteUrl(): any[] {
    return ["/logbook", this.ClientId, "delete"];
  }
}
