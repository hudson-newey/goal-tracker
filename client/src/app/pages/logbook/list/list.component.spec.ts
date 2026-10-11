import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { LogbookListComponent } from "./list.component";

describe("LogbookListComponent", () => {
  let component: LogbookListComponent;
  let fixture: ComponentFixture<LogbookListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogbookListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(LogbookListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
