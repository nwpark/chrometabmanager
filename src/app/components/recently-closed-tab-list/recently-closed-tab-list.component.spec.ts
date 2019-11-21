import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentlyClosedTabListComponent } from './recently-closed-tab-list.component';

describe('RecentlyClosedTabListComponent', () => {
  let component: RecentlyClosedTabListComponent;
  let fixture: ComponentFixture<RecentlyClosedTabListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentlyClosedTabListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentlyClosedTabListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
