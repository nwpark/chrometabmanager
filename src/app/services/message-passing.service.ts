import {Injectable} from '@angular/core';
import {SessionState} from '../types/session-state';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {SessionListState} from '../types/session-list-state';

@Injectable({
  providedIn: 'root'
})
export class MessagePassingService {

  static readonly ACTIVE_SESSION_MESSAGE = 'activeWindowsUpdated_71f38bbe';
  static readonly SAVED_SESSION_MESSAGE = 'savedWindowsUpdated_0656e252';
  static readonly CLOSED_SESSION_MESSAGE = 'closedSessionsUpdated_7d763bba';
  static readonly INSERT_WINDOW_REQUEST = 'insertWindowRequest_de10f744';
  static readonly MESSAGE_DEBOUNCE_TIME = 400;

  private activeSessionMessageHandler = new DebouncedMessageHandler(MessagePassingService.ACTIVE_SESSION_MESSAGE);
  private savedSessionMessageHandler = new DebouncedMessageHandler(MessagePassingService.SAVED_SESSION_MESSAGE);
  private closedSessionMessageHandler = new DebouncedMessageHandler(MessagePassingService.CLOSED_SESSION_MESSAGE);

  constructor() {}

  broadcastActiveSessions(sessionListState: SessionListState) {
    this.activeSessionMessageHandler.broadcast(sessionListState);
  }

  broadcastSavedSessions(sessionListState: SessionListState) {
    this.savedSessionMessageHandler.broadcast(sessionListState);
  }

  broadcastClosedSessions(sessionListState: SessionListState) {
    this.closedSessionMessageHandler.broadcast(sessionListState);
  }

  requestInsertChromeWindow(sessionState: SessionState, index: number) {
    const message: InsertWindowMessageData = { sessionState, index };
    chrome.runtime.sendMessage({
      [MessagePassingService.INSERT_WINDOW_REQUEST]: message
    });
  }
}

class DebouncedMessageHandler {
  private subject = new Subject<SessionListState>();

  constructor(messageId: string) {
    this.subject.asObservable().pipe(
      debounceTime(MessagePassingService.MESSAGE_DEBOUNCE_TIME)
    ).subscribe(sessionListState => {
      const message: SessionListStateMessageData = {messageId, sessionListState};
      chrome.runtime.sendMessage(message);
    });
  }

  broadcast(sessionListState: SessionListState) {
    this.subject.next(sessionListState);
  }
}

export interface SessionListStateMessageData {
  messageId: string;
  sessionListState: SessionListState;
}

export interface InsertWindowMessageData {
  sessionState: SessionState;
  index: number;
}
