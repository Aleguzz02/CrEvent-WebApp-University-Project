import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pag1Page } from './pag1.page';

describe('Pag1Page', () => {
  let component: Pag1Page;
  let fixture: ComponentFixture<Pag1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Pag1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
