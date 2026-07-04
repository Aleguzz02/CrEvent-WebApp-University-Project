import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditPhoneModalComponent } from './edit-phone-modal.component';

describe('EditPhoneModalComponent', () => {
  let component: EditPhoneModalComponent;
  let fixture: ComponentFixture<EditPhoneModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EditPhoneModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPhoneModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
