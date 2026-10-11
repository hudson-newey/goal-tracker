import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { LogbookDeleteComponent } from "./delete.component";

describe("LogbookDeleteComponent", () => {
  let component: LogbookDeleteComponent;
  let fixture: ComponentFixture<LogbookDeleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogbookDeleteComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(LogbookDeleteComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
