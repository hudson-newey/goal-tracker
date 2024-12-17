import { HttpRequest } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { AbstractService } from "../abstract-service.service";
import { ClientConfigService } from "../clientConfig/client-config.service";

@Injectable({ providedIn: "root" })
export class VirtualDatabaseService extends AbstractService {
  private config = inject(ClientConfigService);

  public knownVirtualTablesLocalStorageKey = "knownVirtualTables";
  public changeNotifier = new EventTarget();

  // TODO: move this to the sync queue service
  // It's currently here because of recursive interceptors
  public pushToSyncQueue(request: HttpRequest<unknown>): void {
    const syncQueue =
      JSON.parse(localStorage.getItem("syncQueue") as string) ?? [];

    syncQueue.push(request);

    localStorage.setItem("syncQueue", JSON.stringify(syncQueue));
  }

  public knownVirtualTables(): string[] {
    const foundTables = localStorage.getItem(
      this.knownVirtualTablesLocalStorageKey,
    );
    if (!foundTables) {
      return [];
    }

    const parsedTables = JSON.parse(foundTables);
    if (!Array.isArray(parsedTables)) {
      console.warn(
        "Expected known virtual tables to be a string array, found ",
        typeof parsedTables,
      );
      console.warn("Falling back to no known virtual tables");
      return [];
    }

    return parsedTables.filter((x: string) => !!x);
  }

  public dropTable(tableName: string): void {
    localStorage.removeItem(tableName);
  }

  // we delete the table and recreate it so that the local storage time to destruction is postponed
  // if we didn't do this, the local storage would be destroyed even if the user is using the app
  // TODO: I should probably find a better solution to this
  public updateTable(table: string, value: string): void {
    const currentValue = localStorage.getItem(table);

    if (value !== currentValue) {
      this.dropTable(table);
      localStorage.setItem(table, value);

      this.changeNotifier.dispatchEvent(new Event("change"));
    }
  }

  public subRoutes(): number {
    if (!this.config.isCustomServerUrlSet()) {
      return 0;
    }

    return this.config.getCustomServerUrl()!.split("/").length - 1;
  }

  public applyApiRequest(request: HttpRequest<unknown>): any {
    const virtualTableName = request.url.split("/")[this.subRoutes() + 1];
    const id = Number(request.url.split("/")[2]);
    const newContent = request.body;

    if (localStorage.getItem(virtualTableName) === null) {
      this.updateTable(virtualTableName, "[]");
    }

    this.addToKnownTables(virtualTableName);

    const virtualTable = this.tableValue(virtualTableName);

    // we can short-circut if we intercept an options request
    if (request.method === "OPTIONS") {
      return;
    }

    if (request.method === "GET") {
      // if the request has an "id" attribute in its route, we want to handle
      // it as a "show" request for a singular item in the database
      if (id) {
        // TODO: this is not correct server side (should be under the habits/task routes)
        // because there is a route /goals/:id/habits and /goals/:id/tasks to get the
        // habits and tasks associated with a goal
        // we need to make a special case in the virtual database to handle this
        if (virtualTableName === "goals" && request.url.split("/").length > 3) {
          const associatedTableName = request.url.split("/")[3];

          return this.tableValue(associatedTableName).filter(
            (model: any) => model.Goal == id,
          );
        }

        // TODO: Correctly convert these types instead of using ==
        return virtualTable.find((item: any) => item.ClientId == id);
      }

      // if there a GET request for a known table, but there is no id specified
      // it is a list request, and we should return all of the items
      return this.tableValue(virtualTableName);
    }

    if (request.method === "POST") {
      this.pushToSyncQueue(request);

      const newContentObject = JSON.parse(JSON.stringify(newContent));

      // because id's are auto incremented by mongo, we replicate that here
      newContentObject.ClientId = this.nextTableId(virtualTableName);
      virtualTable.push(newContentObject);

      this.updateTable(virtualTableName, JSON.stringify(virtualTable));
    }

    if (request.method === "DELETE") {
      this.pushToSyncQueue(request);

      const index = virtualTable.findIndex((item: any) => item.ClientId == id);

      virtualTable.splice(index, 1);

      this.updateTable(virtualTableName, JSON.stringify(virtualTable));
    }

    if (request.method === "PUT") {
      this.pushToSyncQueue(request);

      const index = virtualTable.findIndex((item: any) => item.ClientId == id);

      virtualTable[index] = newContent;

      this.updateTable(virtualTableName, JSON.stringify(virtualTable));
    }

    console.error("could not handle request", virtualTableName, request);
    return [];
  }

  private tableValue(tableName: string): unknown[] {
    return JSON.parse(localStorage.getItem(tableName) as string) ?? [];
  }

  private nextTableId(tableName: string): number {
    const table = this.tableValue(tableName);

    if (table.length === 0) {
      return 1;
    }

    return Math.max(...table.map((item: any) => item.ClientId)) + 1;
  }

  private addToKnownTables(tableName: string): void {
    const knownTables =
      JSON.parse(
        localStorage.getItem(this.knownVirtualTablesLocalStorageKey) as string,
      ) ?? [];

    if (knownTables.includes(tableName)) {
      return;
    }

    knownTables.push(tableName);
    localStorage.setItem(
      this.knownVirtualTablesLocalStorageKey,
      JSON.stringify(knownTables),
    );
  }
}
