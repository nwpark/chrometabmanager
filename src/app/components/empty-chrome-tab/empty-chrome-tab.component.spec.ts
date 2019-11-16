import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyChromeTabComponent } from './empty-chrome-tab.component';

describe('EmptyChromeTabComponent', () => {
  let component: EmptyChromeTabComponent;
  let fixture: ComponentFixture<EmptyChromeTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmptyChromeTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyChromeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
