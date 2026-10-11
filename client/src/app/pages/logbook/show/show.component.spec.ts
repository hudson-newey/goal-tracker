import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { LogbookShowComponent } from "./show.component";

describe("LogbookShowComponent", () => {
  let component: LogbookShowComponent;
  let fixture: ComponentFixture<LogbookShowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogbookShowComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(LogbookShowComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
