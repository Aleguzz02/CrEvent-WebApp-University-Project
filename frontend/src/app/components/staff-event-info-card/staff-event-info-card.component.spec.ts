import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StaffEventInfoCardComponent } from './staff-event-info-card.component';

describe('StaffEventInfoCardComponent', () => {
  let component: StaffEventInfoCardComponent;
  let fixture: ComponentFixture<StaffEventInfoCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StaffEventInfoCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffEventInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
