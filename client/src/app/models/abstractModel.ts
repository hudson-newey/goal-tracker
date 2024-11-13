import { Id } from "../types/helpers";

export interface IAbstractModel {
  Id: Id;
  ClientId: Id;
  toString: () => string;
}

export abstract class AbstractModel<T> implements IAbstractModel {
  public constructor(data: T) {
    Object.assign(this, data);
  }

  // Id is the database ID (which might be null if the changes arn't reflected in the DB)
  // the ClientID should be used to get tasks, habits, etc... and is used to uniquely identify the model
  public abstract Id: Required<Id>;
  public abstract ClientId: Required<Id>;
  public abstract LastUpdated: Required<string>;

  public toString(): string {
    return JSON.stringify(this);
  }

  public get ViewUrl(): any[] {
    throw new Error("ViewUrl not implemented");
  }

  public get EditUrl(): any[] {
    throw new Error("EditUrl not implemented");
  }

  public get DeleteUrl(): any[] {
    throw new Error("DeleteUrl not implemented");
  }
}
