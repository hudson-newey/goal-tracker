import { TestBed } from "@angular/core/testing";
import { HttpRequest } from "@angular/common/http";

import { SyncOp, VirtualDatabaseService } from "./virtual-database.service";

describe("VirtualDatabaseService", () => {
  let service: VirtualDatabaseService;

  const tableKey = (table: string) => table;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(VirtualDatabaseService);
  });

  const post = (url: string, body: unknown) =>
    new HttpRequest("POST", url, body);

  const put = (url: string, body: unknown) => new HttpRequest("PUT", url, body);

  const del = (url: string) => new HttpRequest("DELETE", url);

  describe("requestInfo", () => {
    it("parses urls with a custom server prefix", () => {
      const info = service.requestInfo("https://api.example.com/goals/42");

      expect(info.table).toBe("goals");
      expect(info.id).toBe("42");
    });

    it("parses bare paths", () => {
      const info = service.requestInfo("/habits/abc/tasks");

      expect(info.table).toBe("habits");
      expect(info.id).toBe("abc");
      expect(info.subResource).toBe("tasks");
    });

    it("rejects routes that are not backed by a table", () => {
      expect(
        service.requestInfo("https://api.example.com/ai/habits").table,
      ).toBeNull();
      expect(
        service.requestInfo("https://api.example.com/ping").table,
      ).toBeNull();
    });
  });

  describe("applyApiRequest", () => {
    it("creates records with a globally unique client id when offline", () => {
      const response = service.applyApiRequest(
        post("/goals", { Name: "Learn Go" }),
      ) as any;

      expect(response.ClientId).toMatch(/^c/);
      expect(service.tableValue("goals").length).toBe(1);
      expect(service.tableValue("goals")[0].Name).toBe("Learn Go");
    });

    it("updates the correct record even with a server prefix in the url", () => {
      service.applyApiRequest(post("/goals", { Name: "A", ClientId: "7" }));
      service.applyApiRequest(post("/goals", { Name: "B", ClientId: "8" }));

      service.applyApiRequest(
        put("https://api.example.com/goals/7", {
          Name: "A2",
          ClientId: "7",
        }),
      );

      const goals = service.tableValue("goals");
      expect(goals.length).toBe(2);
      expect(goals[0].Name).toBe("A2");
      expect(goals[1].Name).toBe("B");
    });

    it("only deletes the requested record (never falls back to the last row)", () => {
      service.applyApiRequest(post("/goals", { Name: "A", ClientId: "7" }));
      service.applyApiRequest(post("/goals", { Name: "B", ClientId: "8" }));

      service.applyApiRequest(del("https://api.example.com/goals/unknown"));

      const names = service.tableValue("goals").map((g: any) => g.Name);
      expect(names).toEqual(["A", "B"]);

      service.applyApiRequest(del("https://api.example.com/goals/7"));
      expect(service.tableValue("goals").map((g: any) => g.Name)).toEqual([
        "B",
      ]);
    });

    it("queues every mutation for the sync queue", () => {
      service.applyApiRequest(post("/goals", { Name: "A" }));
      service.applyApiRequest(del("/goals/1"));

      const queue = service.getQueue();
      expect(queue.length).toBe(2);
      expect(queue[0].method).toBe("POST");
      expect(queue[1].method).toBe("DELETE");
      expect(queue[0].table).toBe("goals");
    });

    it("filters sub resources by goal", () => {
      service.applyApiRequest(
        post("/habits", { Name: "H", Goal: "5", ClientId: "1" }),
      );
      service.applyApiRequest(
        post("/habits", { Name: "H2", Goal: "6", ClientId: "2" }),
      );

      const result = service.applyApiRequest(
        new HttpRequest("GET", "/goals/5/habits"),
      ) as any[];

      expect(result.length).toBe(1);
      expect(result[0].Name).toBe("H");
    });

    it("supports search offline", () => {
      service.applyApiRequest(
        post("/goals", { Name: "Run a marathon", ClientId: "1" }),
      );

      const result = service.applyApiRequest(
        new HttpRequest("GET", "/goals/search?name=marathon"),
      ) as any[];

      expect(result.length).toBe(1);
    });
  });

  describe("updateTable", () => {
    it("never leaves a table dropped when the write is identical", () => {
      service.updateTable("goals", JSON.stringify([{ ClientId: 1 }]));

      expect(localStorage.getItem(tableKey("goals"))).toBe(
        JSON.stringify([{ ClientId: 1 }]),
      );
    });

    it("ignores unknown tables when reading known tables", () => {
      localStorage.setItem(
        "knownVirtualTables",
        JSON.stringify(["goals", "ai", "ping"]),
      );
      expect(service.knownVirtualTables()).toEqual(["goals"]);
    });
  });

  describe("applyServerResult", () => {
    it("applies a server record without queueing it", () => {
      service.applyServerResult("PUT", "goals", "1", {
        ClientId: "1",
        Name: "from server",
      });

      expect(service.tableValue("goals")[0].Name).toBe("from server");
      expect(service.getQueue().length).toBe(0);
    });
  });
});
