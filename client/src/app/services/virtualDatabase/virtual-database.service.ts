import { HttpRequest } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { ClientConfigService } from "../clientConfig/client-config.service";
import { generateClientId } from "../helpers";

/**
 * The tables that are backed by the real API. Anything else (ping, AI
 * routes, search...) must never be turned into a local table, otherwise
 * garbage tables end up in localStorage and get "synced" with whatever the
 * server returns for them.
 */
export const VIRTUAL_TABLES = ["goals", "habits", "tasks", "logbooks"] as const;

export type VirtualTable = (typeof VIRTUAL_TABLES)[number];

export interface RequestInfo {
  /** The virtual table (goals/habits/tasks/logbooks) or null. */
  table: VirtualTable | null;
  /** The record id (ClientId) in the path, if any. */
  id: string | null;
  /** A sub resource such as "tasks" in /goals/:id/tasks. */
  subResource: string | null;
}

/** A queued mutation that will be replayed to the server when connected. */
export interface SyncOp {
  id: string;
  method: "POST" | "PUT" | "DELETE";
  table: string;
  clientId: string;
  body: unknown;
  /** ISO timestamp of when the op was made. Used for conflict resolution. */
  timestamp: string;
}

export function isVirtualTable(name: string): name is VirtualTable {
  return (VIRTUAL_TABLES as readonly string[]).includes(name);
}

@Injectable({ providedIn: "root" })
export class VirtualDatabaseService extends AbstractService {
  private readonly config = inject(ClientConfigService);

  public knownVirtualTablesLocalStorageKey = "knownVirtualTables";
  public changeNotifier = new EventTarget();

  /**
   * Parse a request URL into its virtual database parts.
   *
   * The id is extracted relative to the configured server URL (the previous
   * implementation used hardcoded string indexes that only worked without a
   * custom server, so every id was NaN offline and DELETE removed the last
   * row of a table).
   */
  public requestInfo(url: string): RequestInfo {
    const path = this.requestPath(url);

    if (!path) {
      return { table: null, id: null, subResource: null };
    }

    const segments = path.split("/").filter((segment) => segment !== "");
    const table = segments[0];

    if (!table || !isVirtualTable(table)) {
      return { table: null, id: null, subResource: null };
    }

    return {
      table,
      id: segments[1] ?? null,
      subResource: segments[2] ?? null,
    };
  }

  /** Strip the server prefix, query string and hash from a request URL. */
  public requestPath(url: string): string | null {
    let path = url.split("?")[0].split("#")[0];

    const endpoint = this.config.getCustomServerUrl();

    if (endpoint && path.startsWith(endpoint)) {
      path = path.slice(endpoint.length);
    } else if (/^https?:\/\//.test(path)) {
      try {
        path = new URL(path).pathname;
      } catch {
        return null;
      }
    }

    return path;
  }

  public knownVirtualTables(): VirtualTable[] {
    const foundTables = localStorage.getItem(
      this.knownVirtualTablesLocalStorageKey,
    );

    if (!foundTables) {
      return [];
    }

    try {
      const parsedTables = JSON.parse(foundTables);
      if (!Array.isArray(parsedTables)) {
        return [];
      }

      // only ever return tables that actually exist on the server
      return parsedTables.filter(isVirtualTable);
    } catch {
      return [];
    }
  }

  public dropTable(tableName: string): void {
    localStorage.removeItem(tableName);
  }

  public updateTable(table: string, value: string): void {
    // The previous implementation removed the table before re-creating it
    // (to work around a perceived storage expiry). If the write failed
    // (e.g. quota exceeded), the data was already gone. Just write directly.
    const currentValue = localStorage.getItem(table);

    if (value === currentValue) {
      return;
    }

    this.safeSetItem(table, value);

    this.changeNotifier.dispatchEvent(new Event("change"));
  }

  /**
   * Apply an intercepted API request to the local (virtual) database and
   * queue the mutation for the next sync.
   */
  public applyApiRequest(request: HttpRequest<unknown>): unknown {
    const info = this.requestInfo(request.url);

    if (!info.table) {
      return null;
    }

    const virtualTableName = info.table;

    if (localStorage.getItem(virtualTableName) === null) {
      this.updateTable(virtualTableName, "[]");
    }

    this.addToKnownTables(virtualTableName);

    // we can short-circuit if we intercept an options request
    if (request.method === "OPTIONS") {
      return undefined;
    }

    if (request.method === "GET") {
      return this.handleGet(request, info);
    }

    const table = this.tableValue(virtualTableName);

    if (request.method === "POST") {
      const newContentObject = JSON.parse(JSON.stringify(request.body ?? {}));

      // every client generates globally unique ids so that concurrent
      // offline creations on different devices can never collide
      if (!newContentObject.ClientId) {
        newContentObject.ClientId = generateClientId();
      }

      table.push(newContentObject);
      this.persistTable(virtualTableName, table);

      this.queueMutation(
        "POST",
        virtualTableName,
        newContentObject.ClientId,
        newContentObject,
      );

      return newContentObject;
    }

    if (request.method === "PUT") {
      const clientId = String(info.id ?? "");
      const newContentObject = JSON.parse(JSON.stringify(request.body ?? {}));

      if (!newContentObject.ClientId) {
        newContentObject.ClientId = clientId || generateClientId();
      }

      // upsert: if the record is not present locally (e.g. it was created on
      // another device), treat the update as a create
      const index = table.findIndex(
        (item: any) => String(item.ClientId) === newContentObject.ClientId,
      );

      if (index === -1) {
        table.push(newContentObject);
      } else {
        table[index] = newContentObject;
      }

      this.persistTable(virtualTableName, table);

      this.queueMutation(
        "PUT",
        virtualTableName,
        newContentObject.ClientId,
        newContentObject,
      );

      return newContentObject;
    }

    if (request.method === "DELETE") {
      const clientId = String(info.id ?? "");
      const index = table.findIndex(
        (item: any) => String(item.ClientId) === clientId,
      );

      // the previous implementation spliced at index -1 when the record was
      // not found, silently deleting the last row of the table
      if (index !== -1) {
        table.splice(index, 1);
        this.persistTable(virtualTableName, table);
      }

      this.queueMutation("DELETE", virtualTableName, clientId, undefined);

      return undefined;
    }

    console.error("could not handle request", virtualTableName, request);
    return null;
  }

  /**
   * Merge the server's response for a mutation into the local table so the
   * UI stays up to date while online. This does NOT queue anything.
   */
  public applyServerResult(
    method: string,
    table: string,
    clientId: string | null,
    record: any,
  ): void {
    if (!isVirtualTable(table)) {
      return;
    }

    const localTable = this.tableValue(table);
    const recordClientId = String(record?.ClientId ?? clientId ?? "");

    const index = localTable.findIndex(
      (item: any) => String(item.ClientId) === recordClientId,
    );

    if (method === "DELETE") {
      if (index !== -1) {
        localTable.splice(index, 1);
      }
    } else if (record && recordClientId) {
      if (index === -1) {
        localTable.push(record);
      } else {
        localTable[index] = record;
      }
    } else {
      return;
    }

    this.updateTable(table, JSON.stringify(localTable));
  }

  public getQueue(): SyncOp[] {
    const raw = localStorage.getItem("syncQueue");

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public setQueue(ops: SyncOp[]): void {
    this.safeSetItem("syncQueue", JSON.stringify(ops));
  }

  /** Queue a mutation so it is replayed to the server on the next sync. */
  public queueMutation(
    method: SyncOp["method"],
    table: string,
    clientId: string,
    body: unknown,
    timestamp: string = new Date().toISOString(),
  ): void {
    const queue = this.getQueue();

    queue.push({
      id: generateClientId(),
      method,
      table,
      clientId,
      body: body === undefined ? null : body,
      timestamp,
    });

    this.setQueue(queue);
  }

  /** Read the raw local table value, tolerating corrupt entries. */
  public tableValue(tableName: string): any[] {
    const raw = localStorage.getItem(tableName);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      console.warn(`Could not parse local table "${tableName}", resetting it`);
      return [];
    }
  }

  private handleGet(request: HttpRequest<unknown>, info: RequestInfo): unknown {
    const { table, id, subResource } = info;
    const path = this.requestPath(request.url) ?? "";

    if (id && subResource) {
      // e.g. GET /goals/:id/tasks or GET /goals/:id/habits
      if (!isVirtualTable(subResource)) {
        return [];
      }

      return this.tableValue(subResource).filter(
        (model: any) => String(model.Goal) === String(id),
      );
    }

    // search support (GET /goals/search?name=...) so search works offline
    if (path.startsWith(`/${table}/search`)) {
      const searchTerm = (request.url.split("name=")[1] ?? "").toLowerCase();

      return this.tableValue(table!).filter((model: any) =>
        (model.Name ?? "").toLowerCase().includes(searchTerm),
      );
    }

    if (id) {
      return (
        this.tableValue(table!).find(
          (item: any) => String(item.ClientId) === String(id),
        ) ?? null
      );
    }

    return this.tableValue(table!);
  }

  private persistTable(tableName: string, table: any[]): void {
    this.updateTable(tableName, JSON.stringify(table));
  }

  /** localStorage.setItem that never throws (quota, private mode, ...). */
  private safeSetItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Could not persist "${key}" to local storage`, error);
      return false;
    }
  }

  private addToKnownTables(tableName: string): void {
    const knownTables = this.knownVirtualTables();

    if (knownTables.includes(tableName as VirtualTable)) {
      return;
    }

    knownTables.push(tableName as VirtualTable);
    this.safeSetItem(
      this.knownVirtualTablesLocalStorageKey,
      JSON.stringify(knownTables),
    );
  }
}
