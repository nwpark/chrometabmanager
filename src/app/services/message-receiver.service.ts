import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {SessionListState} from '../types/session-list-state';
import {InsertWindowMessageData, MessagePassingService, SessionListStateMessageData} from './message-passing.service';

@Injectable({
  providedIn: 'root'
})
export class MessageReceiverService {

  private savedSessionStateUpdated = new Subject<SessionListState>();
  private activeSessionStateUpdated = new Subject<SessionListState>();
  private closedSessionStateUpdated = new Subject<SessionListState>();

  savedSessionStateUpdated$ = this.savedSessionStateUpdated.asObservable();
  activeSessionStateUpdated$ = this.activeSessionStateUpdated.asObservable();
  closedSessionStateUpdated$ = this.closedSessionStateUpdated.asObservable();

  constructor() {
    chrome.runtime.onMessage.addListener((message: SessionListStateMessageData) => {
      if (message.messageId && this.getMessageSubject(message.messageId)) {
        const sessionListState = SessionListState.fromSessionListState(message.sessionListState);
        this.getMessageSubject(message.messageId).next(sessionListState);
      }
    });
  }

  private getMessageSubject(messageId: string) {
    switch (messageId) {
      case MessagePassingService.ACTIVE_SESSION_MESSAGE:
        return this.activeSessionStateUpdated;
      case MessagePassingService.SAVED_SESSION_MESSAGE:
        return this.savedSessionStateUpdated;
      case MessagePassingService.CLOSED_SESSION_MESSAGE:
        return this.closedSessionStateUpdated;
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
