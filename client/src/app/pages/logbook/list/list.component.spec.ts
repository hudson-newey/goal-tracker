import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LogbookListComponent } from "./list.component";

describe("LogbookListComponent", () => {
  let component: LogbookListComponent;
  let fixture: ComponentFixture<LogbookListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogbookListComponent],
    });
    fixture = TestBed.createComponent(LogbookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
