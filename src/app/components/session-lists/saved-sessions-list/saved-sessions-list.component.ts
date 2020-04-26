import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {SessionComponentProps} from '../../../types/chrome-window-component-data';
import {SessionListState} from '../../../types/session/session-list-state';
import {DragDropService} from '../../../services/drag-drop.service';
import {ListActionButton} from '../../../types/action-bar/list-action-button';
import {Preferences} from '../../../types/preferences';
import {PreferencesService} from '../../../services/preferences.service';
import {ActionBarService} from '../../../services/action-bar.service';
import {ListActionButtonFactory} from '../../../utils/action-bar/list-action-button-factory';
import {takeUntil} from 'rxjs/operators';
import {SessionListComponent} from '../session-list/session-list.component';

@Component({
  selector: 'app-saved-sessions-list',
  templateUrl: './saved-sessions-list.component.html',
  styleUrls: ['./saved-sessions-list.component.scss']
})
export class SavedSessionsListComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  @Input() props: SessionComponentProps;
  @Input() sessionListState: SessionListState;
  @ViewChild(SessionListComponent, {static: false}) sessionListComponent: SessionListComponent;

  actionButtons: ListActionButton[];
  preferences: Preferences;

  constructor(private dragDropService: DragDropService,
              private preferencesService: PreferencesService,
              private actionBarService: ActionBarService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.actionButtons = [
      ...this.actionBarService.createListActionButtons(this.props.sessionListId),
      ListActionButtonFactory.createMinimizeButton(() => this.sessionListComponent.toggleDisplay())
    ];
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
