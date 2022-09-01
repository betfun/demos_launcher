import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgSetupComponent } from './org-setup.component';

describe('OrgSetupComponent', () => {
  let component: OrgSetupComponent;
  let fixture: ComponentFixture<OrgSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgSetupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
