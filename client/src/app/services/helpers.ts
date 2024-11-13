import { environment } from "src/environment";
import { AbstractModel } from "../models/abstractModel";

export function createUrl(path: string): string {
  return environment.endpoint + path;
}

export function setLastUpdated<T extends AbstractModel<any>>(model: T): T {
  const lastUpdatedTime = new Date().toISOString();
  model.LastUpdated = lastUpdatedTime;
  return model;
}
