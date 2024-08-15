import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NoItemsPlaceholderComponent } from "./no-items-placeholder.component";

describe("NoItemsPlaceholderComponent", () => {
  let component: NoItemsPlaceholderComponent;
  let fixture: ComponentFixture<NoItemsPlaceholderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoItemsPlaceholderComponent],
    });
    fixture = TestBed.createComponent(NoItemsPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
