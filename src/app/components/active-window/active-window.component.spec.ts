import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveWindowComponent } from './active-window.component';

describe('ActiveWindowComponent', () => {
  let component: ActiveWindowComponent;
  let fixture: ComponentFixture<ActiveWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
