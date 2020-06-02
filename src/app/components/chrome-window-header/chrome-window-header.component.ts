import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {PreferencesService} from '../../services/preferences.service';
import {ActionBarService} from '../../services/action-bar.service';
import {getTimeStampString} from '../../utils/date-utils';
import {ChromeAPIWindowState} from '../../types/chrome-api/chrome-api-window-state';
import {SessionState} from '../../types/session/session-state';
import {SessionActionButton} from '../../types/action-bar/session-action-button';
import {SessionMenuItem} from '../../types/action-bar/session-menu-item';
import {ActionButtonFactory} from '../../utils/action-bar/action-button-factory';
import {Subject} from 'rxjs';
import {Preferences} from '../../types/preferences';
import {takeUntil} from 'rxjs/operators';
import {EditableTextComponent} from '../editable-text/editable-text.component';

@Component({
  selector: 'app-chrome-window-header',
  templateUrl: './chrome-window-header.component.html',
  styleUrls: ['./chrome-window-header.component.scss']
})
export class ChromeWindowHeaderComponent implements OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  @Input() sessionState: SessionState;
  @Input() props: SessionComponentProps;
  @Input() index: number;
  @Output() chromeWindowClose = new EventEmitter();
  @Output() chromeWindowToggleDisplay = new EventEmitter();

  @ViewChild(EditableTextComponent, {static: false}) titleTextComponent: EditableTextComponent;

  chromeAPIWindow: ChromeAPIWindowState;
  actionButtons: SessionActionButton[];
  actionMenuItems: SessionMenuItem[];
  preferences: Preferences;
  lastModified: string;
  menuOpen = false;
  title: string;
  isHidden: boolean;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private preferencesService: PreferencesService,
              private actionBarService: ActionBarService) { }

  ngOnInit() {
    this.chromeAPIWindow = this.sessionState.session.window;
    this.title = this.sessionState.layoutState.title;
    this.isHidden = this.sessionState.layoutState.hidden;
    this.actionMenuItems = this.actionBarService.createSessionMenuItems(this.props.sessionListId);
    this.actionButtons = [
      ActionButtonFactory.createMinimizeButton(() => {
        this.isHidden = !this.isHidden;
        this.chromeWindowToggleDisplay.emit();
      }),
      ActionButtonFactory.createCloseButton(() => this.chromeWindowClose.emit())
    ];
    if (this.sessionState.session.lastModified) {
      this.lastModified = getTimeStampString(this.sessionState.session.lastModified);
    }
    this.preferencesService.preferences$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(preferences => {
      this.preferences = preferences;
      this.changeDetectorRef.detectChanges();
    });
  }

  editTitle() {
    this.titleTextComponent.showEditForm();
  }

  setTitle(title: string) {
    this.props.tabsService.setSessionTitle(this.index, title);
  }

  setMenuOpen(menuOpen: boolean) {
    // todo: set busy on service to prevent updates
    this.menuOpen = menuOpen;
  }

  debug() {
    console.log(this);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
