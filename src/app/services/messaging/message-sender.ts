import {Subject} from 'rxjs';
import {SessionListState} from '../../types/session/session-list-state';
import {debounceTime} from 'rxjs/operators';

export class SimpleMessageSender<T> {
  constructor(private messageId: string) { }

  broadcast(messageData: T) {
    const message: MessageData<T> = {messageId: this.messageId, data: messageData};
    chrome.runtime.sendMessage(message);
  }
}

export class RespondableMessageSender<T, R> {
  constructor(private messageId: string) { }

  sendRequest(messageData: T): Promise<R> {
    const message: MessageData<T> = {messageId: this.messageId, data: messageData};
    return sendRespondableMessage(message);
  }
}

export class DebouncedMessageSender {
  private subject = new Subject<SessionListState>();

  constructor(messageId: string, minimumInterval: number) {
    this.subject.asObservable().pipe(
      debounceTime(minimumInterval)
    ).subscribe(sessionListState => {
      const message: MessageData<SessionListState> = {messageId, data: sessionListState};
      chrome.runtime.sendMessage(message);
    });
  }

  broadcast(sessionListState: SessionListState) {
    this.subject.next(sessionListState);
  }
}

function sendRespondableMessage(message: MessageData<any>): Promise<any> {
  return new Promise<any>(resolve => {
    chrome.runtime.sendMessage(message, response => {
      resolve(response);
    });
  });
}

export interface MessageData<T> {
  messageId: string;
  data: T;
}
