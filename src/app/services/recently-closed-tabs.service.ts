import {Injectable} from '@angular/core';
import {RecentlyClosedSession} from '../types/chrome-a-p-i-window-state';
import {Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {modifiesState} from '../decorators/modifies-state';
import {StorageService} from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class RecentlyClosedTabsService {

  private recentlyClosedSessions: RecentlyClosedSession[];

  private sessionClosedSource = new Subject<RecentlyClosedSession[]>();
  public sessionClosed$ = this.sessionClosedSource.asObservable();

  constructor(private storageService: StorageService) {
    this.recentlyClosedSessions = [];
    this.storageService.getRecentlyClosedSessions().then(recentlyClosedSessions => {
      this.setRecentlyClosedSessions(recentlyClosedSessions);
    });
    if (environment.production) {
      // todo: move to storage service
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (changes.recentlyClosedSessions) {
          this.setRecentlyClosedSessions(changes.recentlyClosedSessions.newValue);
        }
      });
    }
  }

  getRecentlyClosedSessions(): RecentlyClosedSession[] {
    return this.recentlyClosedSessions;
  }

  @modifiesState()
  private setRecentlyClosedSessions(recentlyClosedSessions: RecentlyClosedSession[]) {
    this.recentlyClosedSessions = recentlyClosedSessions;
  }

  onStateUpdated() {
    this.sessionClosedSource.next(this.recentlyClosedSessions);
    // this.storageService.setSavedWindowsState(this.recentlyClosedSessions);
  }
}
