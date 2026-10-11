import { TestBed } from "@angular/core/testing";
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";
import { SyncQueueService } from "./sync-queue.service";
import { PingService } from "../ping/ping.service";
import {
  SyncOp,
  VirtualDatabaseService,
} from "../virtualDatabase/virtual-database.service";

describe("SyncQueueService", () => {
  let service: SyncQueueService;
  let virtualDb: VirtualDatabaseService;

  const op = (overrides: Partial<SyncOp>): SyncOp => ({
    id: Math.random().toString(36).slice(2),
    method: "PUT",
    table: "goals",
    clientId: "1",
    body: { ClientId: "1" },
    timestamp: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: {} },
        {
          provide: PingService,
          useValue: {
            pingRoute: "/ping",
            hasServerConnection: () => of(false),
          },
        },
      ],
    });

    service = TestBed.inject(SyncQueueService);
    virtualDb = TestBed.inject(VirtualDatabaseService);
  });

  describe("compactQueue", () => {
    it("keeps only the latest op per record", () => {
      virtualDb.setQueue([
        op({
          clientId: "1",
          method: "POST",
          timestamp: "2024-01-01T00:00:00Z",
          body: { ClientId: "1", Name: "v1" },
        }),
        op({
          clientId: "1",
          method: "PUT",
          timestamp: "2024-01-02T00:00:00Z",
          body: { ClientId: "1", Name: "v2" },
        }),
        op({
          clientId: "2",
          method: "POST",
          timestamp: "2024-01-03T00:00:00Z",
          body: { ClientId: "2", Name: "other" },
        }),
      ]);

      const compacted = service.compactQueue();

      expect(compacted.length).toBe(2);
      expect(compacted.map((entry) => entry.clientId).sort()).toEqual([
        "1",
        "2",
      ]);
      expect(compacted.find((entry) => entry.clientId === "1")?.body).toEqual({
        ClientId: "1",
        Name: "v2",
      });
    });

    it("drops records that were created and deleted entirely offline", () => {
      virtualDb.setQueue([
        op({
          clientId: "1",
          method: "POST",
          timestamp: "2024-01-01T00:00:00Z",
        }),
        op({
          clientId: "1",
          method: "DELETE",
          timestamp: "2024-01-02T00:00:00Z",
        }),
      ]);

      expect(service.compactQueue().length).toBe(0);
    });

    it("keeps a delete for a record the server already knows", () => {
      virtualDb.setQueue([
        op({
          clientId: "1",
          method: "DELETE",
          timestamp: "2024-01-02T00:00:00Z",
        }),
      ]);

      expect(service.compactQueue().length).toBe(1);
    });
  });

  describe("legacy queue migration", () => {
    beforeEach(() => {
      localStorage.clear();
      localStorage.setItem(
        "syncQueue",
        JSON.stringify([
          {
            method: "POST",
            url: "https://api.example.com/goals",
            body: { Name: "legacy", ClientId: "9" },
          },
          { method: "GET", url: "/goals" },
        ]),
      );

      // a fresh testing module so the service constructor runs the
      // migration against the queue we just seeded
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: HttpClient, useValue: {} },
          {
            provide: PingService,
            useValue: {
              pingRoute: "/ping",
              hasServerConnection: () => of(false),
            },
          },
        ],
      });
    });

    it("converts serialized HttpRequests into sync ops", () => {
      // injecting the sync queue service runs its constructor, which
      // performs the migration
      TestBed.inject(SyncQueueService);
      const migratedDb = TestBed.inject(VirtualDatabaseService);

      const queue = migratedDb.getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].table).toBe("goals");
      expect(queue[0].clientId).toBe("9");
      expect(queue[0].method).toBe("POST");
    });
  });
});
