import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProfilesComponent } from './new-profiles.component';

describe('NewProfilesComponent', () => {
  let component: NewProfilesComponent;
  let fixture: ComponentFixture<NewProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewProfilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
