import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { HabitsUpdateComponent } from "./update.component";

describe("HabitsUpdateComponent", () => {
  let component: HabitsUpdateComponent;
  let fixture: ComponentFixture<HabitsUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HabitsUpdateComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(HabitsUpdateComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
