import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedWindowListComponent } from './saved-window-list.component';

describe('SavedWindowListComponent', () => {
  let component: SavedWindowListComponent;
  let fixture: ComponentFixture<SavedWindowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavedWindowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedWindowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
