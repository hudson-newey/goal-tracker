import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { GoalFormComponent } from "./goal-form.component";

describe("GoalFormComponent", () => {
  let component: GoalFormComponent;
  let fixture: ComponentFixture<GoalFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GoalFormComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(GoalFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("creating", true);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
