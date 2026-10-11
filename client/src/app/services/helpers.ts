import { environment } from "../../environment";
import { AbstractModel } from "../models/abstractModel";

export function createUrl(path: string): string {
  return environment.endpoint + path;
}

export function setLastUpdated<T extends AbstractModel<any>>(model: T): T {
  const lastUpdatedTime = new Date().toISOString();
  model.LastUpdated = lastUpdatedTime;
  return model;
}

/**
 * Generate a globally unique client id.
 *
 * ClientIds uniquely identify a record across all devices, so they can no
 * longer be locally auto-incremented numbers (two offline clients would both
 * allocate the same id and the server would merge two distinct records).
 */
export function generateClientId(): string {
  const randomSegment =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 10) +
        Math.random().toString(36).slice(2, 6);

  return `c${Date.now().toString(36)}${randomSegment}`;
}
