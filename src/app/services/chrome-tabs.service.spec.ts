import { TestBed } from '@angular/core/testing';

import { ChromeTabsService } from './chrome-tabs.service';

describe('ChromeTabsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChromeTabsService = TestBed.get(ChromeTabsService);
    expect(service).toBeTruthy();
  });
});
