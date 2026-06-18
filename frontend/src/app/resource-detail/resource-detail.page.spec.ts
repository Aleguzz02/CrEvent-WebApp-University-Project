import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceDetailPage } from './resource-detail.page';

describe('ResourceDetailPage', () => {
  let component: ResourceDetailPage;
  let fixture: ComponentFixture<ResourceDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
