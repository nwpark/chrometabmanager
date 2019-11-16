import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveWindowListComponent } from './active-window-list.component';

describe('ActiveWindowListComponent', () => {
  let component: ActiveWindowListComponent;
  let fixture: ComponentFixture<ActiveWindowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveWindowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveWindowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
