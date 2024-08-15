import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GoalsUpdateComponent } from "./update.component";

describe("UpdateComponent", () => {
  let component: GoalsUpdateComponent;
  let fixture: ComponentFixture<GoalsUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GoalsUpdateComponent],
    });
    fixture = TestBed.createComponent(GoalsUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
