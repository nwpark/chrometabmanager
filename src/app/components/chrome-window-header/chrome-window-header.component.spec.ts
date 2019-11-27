import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChromeWindowHeaderComponent } from './chrome-window-header.component';

describe('ChromeWindowHeaderComponent', () => {
  let component: ChromeWindowHeaderComponent;
  let fixture: ComponentFixture<ChromeWindowHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChromeWindowHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChromeWindowHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
