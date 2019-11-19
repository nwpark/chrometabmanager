import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChromeWindowComponent } from './chrome-window.component';

describe('ChromeWindowComponent', () => {
  let component: ChromeWindowComponent;
  let fixture: ComponentFixture<ChromeWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChromeWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChromeWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
