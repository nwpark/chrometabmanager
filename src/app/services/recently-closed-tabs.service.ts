import {Injectable} from '@angular/core';
import {WindowListState} from '../types/chrome-a-p-i-window-state';
import {Subject} from 'rxjs';
import {environment} from '../../environments/environment';

declare var chrome;

@Injectable({
  providedIn: 'root'
})
export class RecentlyClosedTabsService {

  private windowListState: WindowListState;

  private windowStateUpdatedSource = new Subject<WindowListState>();
  public windowStateUpdated$ = this.windowStateUpdatedSource.asObservable();

  constructor() {
    if (environment.production) {
      chrome.storage.onChanged.addListener(((changes, areaName) => {
        if (changes.recentlyClosedWindows) {
          // changes.recentlyClosedWindows.newValue;
        }
      }));
    }
  }
}
