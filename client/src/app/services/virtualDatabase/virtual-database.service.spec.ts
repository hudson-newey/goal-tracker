import { TestBed } from "@angular/core/testing";

import { VirtualDatabaseService } from "./virtual-database.service";

describe("VirtualDatabaseService", () => {
  let service: VirtualDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VirtualDatabaseService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
