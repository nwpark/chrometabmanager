import {Injectable} from '@angular/core';
import {SessionState} from '../types/session-state';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessagePassingService {

  private static readonly ACTIVE_SESSION_MESSAGE = 'activeWindowsUpdated_71f38bbe';
  private static readonly SAVED_SESSION_MESSAGE = 'savedWindowsUpdated_0656e252';
  private static readonly CLOSED_SESSION_MESSAGE = 'closedSessionsUpdated_7d763bba';
  private static readonly INSERT_WINDOW_REQUEST = 'insertWindowRequest_de10f744';
  private static readonly MESSAGE_DEBOUNCE_TIME = 400;

  private savedSessionMessageRequest = new Subject<void>();
  private activeSessionMessageRequest = new Subject<void>();
  private closedSessionMessageRequest = new Subject<void>();

  private savedSessionStateUpdated = new Subject<void>();
  private activeSessionStateUpdated = new Subject<void>();
  private closedSessionStateUpdated = new Subject<void>();

  savedSessionStateUpdated$ = this.savedSessionStateUpdated.asObservable();
  activeSessionStateUpdated$ = this.activeSessionStateUpdated.asObservable();
  closedSessionStateUpdated$ = this.closedSessionStateUpdated.asObservable();

  // todo: include sessionListState in messages
  constructor() {
    this.initMessageListener(this.activeSessionStateUpdated, MessagePassingService.ACTIVE_SESSION_MESSAGE);
    this.initMessageSender(this.activeSessionMessageRequest, MessagePassingService.ACTIVE_SESSION_MESSAGE);

    this.initMessageListener(this.savedSessionStateUpdated, MessagePassingService.SAVED_SESSION_MESSAGE);
    this.initMessageSender(this.closedSessionMessageRequest, MessagePassingService.CLOSED_SESSION_MESSAGE);

    this.initMessageListener(this.closedSessionStateUpdated, MessagePassingService.CLOSED_SESSION_MESSAGE);
    this.initMessageSender(this.savedSessionMessageRequest, MessagePassingService.SAVED_SESSION_MESSAGE);
  }

  private initMessageListener(messageSource: Subject<void>, messageId: string) {
    chrome.runtime.onMessage.addListener(message => {
      if (message === messageId) {
        messageSource.next();
      }
    });
  }

  private initMessageSender(messageSource: Subject<void>, messageId: string) {
    messageSource.asObservable()
      .pipe(debounceTime(MessagePassingService.MESSAGE_DEBOUNCE_TIME))
      .subscribe(() => {
        chrome.runtime.sendMessage(messageId);
      });
  }

  static onInsertChromeWindowRequest(callback: (request: InsertWindowMessageData) => void) {
    chrome.runtime.onMessage.addListener(message => {
      if (message[MessagePassingService.INSERT_WINDOW_REQUEST]) {
        callback(message[MessagePassingService.INSERT_WINDOW_REQUEST]);
      }
    });
  }

  static requestInsertChromeWindow(sessionState: SessionState, index: number) {
    const message: InsertWindowMessageData = { sessionState, index };
    chrome.runtime.sendMessage({
      [MessagePassingService.INSERT_WINDOW_REQUEST]: message
    });
  }

  notifySavedWindowStateListeners() {
    this.savedSessionMessageRequest.next();
  }

  notifyClosedSessionStateListeners() {
    this.closedSessionMessageRequest.next();
  }

  notifyActiveWindowStateListeners() {
    this.activeSessionMessageRequest.next();
  }
}

export interface InsertWindowMessageData {
  sessionState: SessionState;
  index: number;
}
