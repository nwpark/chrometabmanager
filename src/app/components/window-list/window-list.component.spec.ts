import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowListComponent } from './window-list.component';

describe('WindowListComponent', () => {
  let component: WindowListComponent;
  let fixture: ComponentFixture<WindowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
