import {Injectable} from '@angular/core';
import {SessionState} from '../../types/session-state';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {SessionListState} from '../../types/session-list-state';

@Injectable({
  providedIn: 'root'
})
export class MessagePassingService {

  static readonly ACTIVE_SESSION_MESSAGE = 'activeWindowsUpdated_71f38bbe';
  static readonly SAVED_SESSION_MESSAGE = 'savedWindowsUpdated_0656e252';
  static readonly CLOSED_SESSION_MESSAGE = 'closedSessionsUpdated_7d763bba';
  static readonly PREFERENCES_UPDATED = 'preferencesUpdated_8c6d0f54';
  static readonly INSERT_WINDOW_REQUEST = 'insertWindowRequest_de10f744';
  static readonly INSTANCE_ID_REQUEST = 'instanceIdRequest_7f5604d5';
  static readonly MESSAGE_DEBOUNCE_TIME = 400;

  private preferencesMessageHandler = new SimpleMessageHandler<void>(MessagePassingService.PREFERENCES_UPDATED);
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

  broadcastPreferencesUpdated() {
    this.preferencesMessageHandler.broadcast();
  }

  requestInsertChromeWindow(sessionState: SessionState, index: number) {
    const message: InsertWindowMessageData = { sessionState, index };
    chrome.runtime.sendMessage({
      [MessagePassingService.INSERT_WINDOW_REQUEST]: message
    });
  }

  requestInstanceId(): Promise<string> {
    return new Promise<string>(resolve => {
      chrome.runtime.sendMessage({
        messageId: MessagePassingService.INSTANCE_ID_REQUEST
      }, (response: string) => resolve(response));
    });
  }
}

class SimpleMessageHandler<T> {
  constructor(private messageId: string) {}

  broadcast(messageData: T) {
    const message: MessageData<T> = {messageId: this.messageId, data: messageData};
    chrome.runtime.sendMessage(message);
  }
}

class DebouncedMessageHandler {
  private subject = new Subject<SessionListState>();

  constructor(messageId: string) {
    this.subject.asObservable().pipe(
      debounceTime(MessagePassingService.MESSAGE_DEBOUNCE_TIME)
    ).subscribe(sessionListState => {
      const message: MessageData<SessionListState> = {messageId, data: sessionListState};
      chrome.runtime.sendMessage(message);
    });
  }

  broadcast(sessionListState: SessionListState) {
    this.subject.next(sessionListState);
  }
}

export interface MessageData<T> {
  messageId: string;
  data: T;
}

export interface InsertWindowMessageData {
  sessionState: SessionState;
  index: number;
}