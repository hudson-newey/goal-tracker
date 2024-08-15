import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LogbookNewComponent } from "./new.component";

describe("LogbookNewComponent", () => {
  let component: LogbookNewComponent;
  let fixture: ComponentFixture<LogbookNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogbookNewComponent],
    });
    fixture = TestBed.createComponent(LogbookNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
