import {Observable, Subject} from 'rxjs';
import {SessionListState} from '../../types/session/session-list-state';

export class MessageReceiver<T, R, S> {
  subject = new Subject<S>();
  mightSendResponse = false;

  next(messageData: T, sendResponse: MessageResponseCallback<R>) { }

  asObservable(): Observable<S> {
    return this.subject.asObservable();
  }
}

export class SimpleMessageReceiver<T> extends MessageReceiver<T, any, T> {
  next(messageData: T, sendResponse: MessageResponseCallback<any>) {
    this.subject.next(messageData);
  }
}

export class SessionListMessageReceiver extends SimpleMessageReceiver<SessionListState> {
  next(messageData: SessionListState, sendResponse: MessageResponseCallback<any>) {
    const sessionListState = SessionListState.fromSessionListState(messageData);
    this.subject.next(sessionListState);
  }
}

export class RespondableMessageReceiver<T, R> extends MessageReceiver<T, R, MessageRequest<T, R>> {
  mightSendResponse = true;

  next(messageData: T, sendResponse: MessageResponseCallback<R>) {
    this.subject.next({messageData, sendResponse});
  }

  asObservable(): Observable<MessageRequest<T, R>> {
    return this.subject.asObservable();
  }
}

interface MessageRequest<T, R> {
  messageData: T;
  sendResponse: MessageResponseCallback<R>;
}

type MessageResponseCallback<T> = (response: T) => void;
