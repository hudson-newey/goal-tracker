import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { TasksUpdateComponent } from "./update.component";

describe("TasksUpdateComponent", () => {
  let component: TasksUpdateComponent;
  let fixture: ComponentFixture<TasksUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TasksUpdateComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(TasksUpdateComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
