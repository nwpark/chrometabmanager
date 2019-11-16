import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableChromeTabComponent } from './draggable-chrome-tab.component';

describe('DraggableChromeTabComponent', () => {
  let component: DraggableChromeTabComponent;
  let fixture: ComponentFixture<DraggableChromeTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DraggableChromeTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DraggableChromeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
