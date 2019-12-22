import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {SessionListState} from '../types/session-list-state';
import {InsertWindowMessageData, MessageData, MessagePassingService} from './message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class MessageReceiverService {

  private savedSessionStateUpdated = new SessionListMessageReceiver();
  private activeSessionStateUpdated = new SessionListMessageReceiver();
  private closedSessionStateUpdated = new SessionListMessageReceiver();
  private preferencesUpdated = new MessageReceiver<void>();

  savedSessionStateUpdated$ = this.savedSessionStateUpdated.asObservable();
  activeSessionStateUpdated$ = this.activeSessionStateUpdated.asObservable();
  closedSessionStateUpdated$ = this.closedSessionStateUpdated.asObservable();
  preferencesUpdated$ = this.preferencesUpdated.asObservable();

  constructor() {
    chrome.runtime.onMessage.addListener((message: MessageData<any>) => {
      if (message.messageId && this.getMessageReceiver(message.messageId)) {
        this.getMessageReceiver(message.messageId).next(message.data);
      }
    });
  }

  private getMessageReceiver(messageId: string): MessageReceiver<any> {
    switch (messageId) {
      case MessagePassingService.ACTIVE_SESSION_MESSAGE:
        return this.activeSessionStateUpdated;
      case MessagePassingService.SAVED_SESSION_MESSAGE:
        return this.savedSessionStateUpdated;
      case MessagePassingService.CLOSED_SESSION_MESSAGE:
        return this.closedSessionStateUpdated;
      case MessagePassingService.PREFERENCES_UPDATED:
        return this.preferencesUpdated;
    }
  }

  static onInsertChromeWindowRequest(callback: (request: InsertWindowMessageData) => void) {
    chrome.runtime.onMessage.addListener(message => {
      if (message[MessagePassingService.INSERT_WINDOW_REQUEST]) {
        callback(message[MessagePassingService.INSERT_WINDOW_REQUEST]);
      }
    });
  }

  static onInstanceIdRequest(instanceId: string) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.messageId === MessagePassingService.INSTANCE_ID_REQUEST) {
        sendResponse(instanceId);
      }
    });
  }
}

class MessageReceiver<T> {
  subject = new Subject<T>();

  next(messageData: T) {
    this.subject.next(messageData);
  }

  asObservable(): Observable<T> {
    return this.subject.asObservable();
  }
}

class SessionListMessageReceiver extends MessageReceiver<SessionListState> {
  next(messageData: SessionListState) {
    const sessionListState = SessionListState.fromSessionListState(messageData);
    this.subject.next(sessionListState);
  }
}
