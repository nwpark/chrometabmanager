import { TestBed } from '@angular/core/testing';

import { MessagePassingService } from './message-passing.service';

describe('ChromeEventHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessagePassingService = TestBed.get(MessagePassingService);
    expect(service).toBeTruthy();
  });
});
