import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {SessionComponentProps, SessionListId} from '../../../types/chrome-window-component-data';
import {SessionListState} from '../../../types/session/session-list-state';
import {SessionListComponent} from '../session-list/session-list.component';
import {ListActionButton} from '../../../types/action-bar/list-action-button';
import {Preferences} from '../../../types/preferences';
import {DragDropService} from '../../../services/drag-drop.service';
import {PreferencesService} from '../../../services/preferences.service';
import {ActionBarService} from '../../../services/action-bar.service';
import {ListActionButtonFactory} from '../../../utils/action-bar/list-action-button-factory';
import {takeUntil} from 'rxjs/operators';
import {RecentlyClosedTabsService} from '../../../services/tabs/recently-closed-tabs.service';

@Component({
  selector: 'app-closed-sessions-list',
  templateUrl: './closed-sessions-list.component.html',
  styleUrls: ['./closed-sessions-list.component.scss']
})
export class ClosedSessionsListComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  @ViewChild(SessionListComponent, {static: false}) sessionListComponent: SessionListComponent;

  sessionListState: SessionListState;
  props: SessionComponentProps;
  actionButtons: ListActionButton[];
  preferences: Preferences;

  constructor(private recentlyClosedTabsService: RecentlyClosedTabsService,
              private dragDropService: DragDropService,
              private preferencesService: PreferencesService,
              private actionBarService: ActionBarService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.props = {
      sessionListId: SessionListId.RecentlyClosed,
      tabsService: this.recentlyClosedTabsService,
      isMutable: false
    };
    this.actionButtons = [
      ...this.actionBarService.createListActionButtons(this.props.sessionListId),
      ListActionButtonFactory.createMinimizeButton(() => this.sessionListComponent.toggleDisplay())
    ];
    this.recentlyClosedTabsService.sessionStateUpdated$.pipe(
      this.dragDropService.ignoreWhenDragging(),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(sessionListState => {
      this.sessionListState = sessionListState;
      this.changeDetectorRef.detectChanges();
    });
    this.preferencesService.preferences$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(preferences => {
      this.preferences = preferences;
      this.changeDetectorRef.detectChanges();
    });
  }

  debug() {
    console.log(this);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
