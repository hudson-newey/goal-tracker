import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LogbookShowComponent } from "./show.component";

describe("LogbookShowComponent", () => {
  let component: LogbookShowComponent;
  let fixture: ComponentFixture<LogbookShowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogbookShowComponent],
    });
    fixture = TestBed.createComponent(LogbookShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
