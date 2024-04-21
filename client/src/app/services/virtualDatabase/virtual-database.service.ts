import { HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractService } from "../abstract-service.service";

@Injectable({ providedIn: "root" })
export class VirtualDatabaseService extends AbstractService {
  public constructor() {
    super();
  }

  public knownVirtualTablesLocalStorageKey = "knownVirtualTables";

  // TODO: move this to the sync queue service
  // It's currently here because of recursive interceptors
  public pushToSyncQueue(request: HttpRequest<unknown>): void {
    const syncQueue =
      JSON.parse(localStorage.getItem("syncQueue") as string) ?? [];

    syncQueue.push(request);

    localStorage.setItem("syncQueue", JSON.stringify(syncQueue));
  }

  public knownVirtualTables(): string[] {
    const foundTables =
      JSON.parse(
        localStorage.getItem(this.knownVirtualTablesLocalStorageKey) as string,
      ) ?? [];

    return foundTables.filter((x: string) => !!x);
  }

  public dropTable(tableName: string): void {
    localStorage.removeItem(tableName);
  }

  // we delete the table and recreate it so that the local storage time to destruction is postponed
  // if we didn't do this, the local storage would be destroyed even if the user is using the app
  // TODO: I should probably find a better solution to this
  public updateTable(table: string, value: string): void {
    this.dropTable(table);
    localStorage.setItem(table, value);
  }

  public applyApiRequest(request: HttpRequest<unknown>): any {
    const virtualTableName = request.url.split("/")[1];
    const id = Number(request.url.split("/")[2]);
    const newContent = request.body;

    if (localStorage.getItem(virtualTableName) === null) {
      this.updateTable(virtualTableName, "[]");
    }

    this.addToKnownTables(virtualTableName);

    const virtualTable = this.tableValue(virtualTableName);

    if (request.method === "GET") {
      if (id) {
        // TODO: this is not correct server side (should be under the habits/task routes)
        // because there is a route /goals/:id/habits and /goals/:id/tasks to get the
        // habits and tasks associated with a goal
        // we need to make a special case in the virtual database to handle this
        if (virtualTableName === "goals" && request.url.split("/").length > 3) {
          const associatedTableName = request.url.split("/")[3];

          const value = this.tableValue(associatedTableName).filter(
            (model: any) => model.Goal === String(id),
          );

          return value;
        }

        // TODO: Correctly convert these types instead of using ==
        return virtualTable.find((item: any) => item.ClientId == id);
      }
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

      const index = virtualTable.findIndex((item: any) => item.ClientId === id);

      virtualTable.splice(index, 1);

      this.updateTable(virtualTableName, JSON.stringify(virtualTable));
    }

    if (request.method === "PUT") {
      this.pushToSyncQueue(request);

      const index = virtualTable.findIndex((item: any) => item.ClientId === id);

      virtualTable[index] = newContent;

      this.updateTable(virtualTableName, JSON.stringify(virtualTable));
    }

    const tableValue = this.tableValue(virtualTableName);
    return tableValue;
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
