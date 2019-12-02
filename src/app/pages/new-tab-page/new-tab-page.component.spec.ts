import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTabPageComponent } from './new-tab-page.component';

describe('NewTabPageComponent', () => {
  let component: NewTabPageComponent;
  let fixture: ComponentFixture<NewTabPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTabPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTabPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
