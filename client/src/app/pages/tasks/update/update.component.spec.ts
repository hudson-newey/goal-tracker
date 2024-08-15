import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TasksUpdateComponent } from "./update.component";

describe("TasksUpdateComponent", () => {
  let component: TasksUpdateComponent;
  let fixture: ComponentFixture<TasksUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TasksUpdateComponent],
    });
    fixture = TestBed.createComponent(TasksUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
