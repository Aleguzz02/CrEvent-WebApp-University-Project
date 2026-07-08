import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StaffSelectableCardComponent } from './staff-selectable-card.component';

describe('StaffSelectableCardComponent', () => {
  let component: StaffSelectableCardComponent;
  let fixture: ComponentFixture<StaffSelectableCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StaffSelectableCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffSelectableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
