import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventSummaryPage } from './event-summary.page';

describe('EventSummaryPage', () => {
  let component: EventSummaryPage;
  let fixture: ComponentFixture<EventSummaryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
