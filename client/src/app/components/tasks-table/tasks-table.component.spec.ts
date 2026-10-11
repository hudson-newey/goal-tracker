import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";

import { TasksTableComponent } from "./tasks-table.component";

describe("TasksTableComponent", () => {
  let component: TasksTableComponent;
  let fixture: ComponentFixture<TasksTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TasksTableComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    fixture = TestBed.createComponent(TasksTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("models", []);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
