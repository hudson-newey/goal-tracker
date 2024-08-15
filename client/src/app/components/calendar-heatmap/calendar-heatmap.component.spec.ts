import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CalendarHeatmapComponent } from "./calendar-heatmap.component";

describe("CalendarHeatmapComponent", () => {
  let component: CalendarHeatmapComponent;
  let fixture: ComponentFixture<CalendarHeatmapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarHeatmapComponent],
    });
    fixture = TestBed.createComponent(CalendarHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
