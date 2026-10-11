import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { LogbookEditComponent } from "./edit.component";

describe("LogbookEditComponent", () => {
  let component: LogbookEditComponent;
  let fixture: ComponentFixture<LogbookEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogbookEditComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(LogbookEditComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
