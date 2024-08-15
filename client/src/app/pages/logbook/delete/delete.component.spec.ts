import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LogbookDeleteComponent } from "./delete.component";

describe("LogbookDeleteComponent", () => {
  let component: LogbookDeleteComponent;
  let fixture: ComponentFixture<LogbookDeleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogbookDeleteComponent],
    });
    fixture = TestBed.createComponent(LogbookDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
