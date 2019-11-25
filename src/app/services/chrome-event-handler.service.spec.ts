import { TestBed } from '@angular/core/testing';

import { ChromeEventHandlerService } from './chrome-event-handler.service';

describe('ChromeEventHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChromeEventHandlerService = TestBed.get(ChromeEventHandlerService);
    expect(service).toBeTruthy();
  });
});
