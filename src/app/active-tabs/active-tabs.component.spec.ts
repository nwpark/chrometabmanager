import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveTabsComponent } from './active-tabs.component';

describe('ActiveTabsComponent', () => {
  let component: ActiveTabsComponent;
  let fixture: ComponentFixture<ActiveTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
