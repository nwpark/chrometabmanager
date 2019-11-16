import { TestBed } from '@angular/core/testing';

import { SavedTabsService } from './saved-tabs.service';

describe('SavedTabsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SavedTabsService = TestBed.get(SavedTabsService);
    expect(service).toBeTruthy();
  });
});
