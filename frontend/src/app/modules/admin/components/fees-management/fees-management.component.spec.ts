import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesManagementComponent } from './fees-management.component';

describe('FeesManagementComponent', () => {
  let component: FeesManagementComponent;
  let fixture: ComponentFixture<FeesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeesManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
