import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { GoalsUpdateComponent } from "./update.component";

describe("GoalsUpdateComponent", () => {
  let component: GoalsUpdateComponent;
  let fixture: ComponentFixture<GoalsUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GoalsUpdateComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(GoalsUpdateComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
