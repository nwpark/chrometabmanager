import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedWindowComponent } from './saved-window.component';

describe('SavedWindowComponent', () => {
  let component: SavedWindowComponent;
  let fixture: ComponentFixture<SavedWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavedWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
