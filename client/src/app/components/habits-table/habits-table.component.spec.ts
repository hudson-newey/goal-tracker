import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { HabitsTableComponent } from "./habits-table.component";

describe("HabitsTableComponent", () => {
  let component: HabitsTableComponent;
  let fixture: ComponentFixture<HabitsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HabitsTableComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(HabitsTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("models", []);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
