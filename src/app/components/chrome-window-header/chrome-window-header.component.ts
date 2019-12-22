import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormControl} from '@angular/forms';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {PreferencesService} from '../../services/preferences.service';
import {ActionBarService} from '../../services/action-bar.service';
import {getTimeString} from '../../utils/date-utils';
import {ChromeAPIWindowState} from '../../types/chrome-api-window-state';
import {SessionState} from '../../types/session-state';
import {SessionLayoutState} from '../../types/session-layout-state';
import {SessionActionButton} from '../../types/action-bar/session-action-button';
import {SessionMenuItem} from '../../types/action-bar/session-menu-item';
import {ActionButtonFactory} from '../../utils/action-bar/action-button-factory';

@Component({
  selector: 'app-chrome-window-header',
  templateUrl: './chrome-window-header.component.html',
  styleUrls: ['./chrome-window-header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChromeWindowHeaderComponent implements OnInit {

  @Input() sessionState: SessionState;
  @Input() props: SessionComponentProps;
  @Input() index: number;
  @Output() chromeWindowClose = new EventEmitter();
  @Output() chromeWindowToggleDisplay = new EventEmitter();

  chromeAPIWindow: ChromeAPIWindowState;
  layoutState: SessionLayoutState;
  actionButtons: SessionActionButton[];
  actionMenuItems: SessionMenuItem[];
  debugModeEnabled$: Promise<boolean>;
  lastModified: string;
  menuOpen = false;

  @ViewChild('titleInput', {static: false}) titleInput: ElementRef;
  titleFormControl: FormControl;
  showEditForm = false;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private preferencesService: PreferencesService,
              private actionBarService: ActionBarService) { }

  ngOnInit() {
    this.chromeAPIWindow = this.sessionState.session.window;
    this.layoutState = this.sessionState.layoutState;
    this.actionMenuItems = this.actionBarService.createSessionMenuItems(this.props.sessionListId);
    this.actionButtons = [
      ActionButtonFactory.createMinimizeButton(() => this.chromeWindowToggleDisplay.emit()),
      ActionButtonFactory.createCloseButton(() => this.chromeWindowClose.emit())
    ];
    this.titleFormControl = new FormControl(this.layoutState.title);
    if (this.sessionState.session.lastModified) {
      this.lastModified = getTimeString(this.sessionState.session.lastModified);
    }
    this.debugModeEnabled$ = this.preferencesService.isDebugModeEnabled();
  }

  // todo: dragdrop service
  editTitle() {
    this.showEditForm = true;
    this.changeDetectorRef.detectChanges();
    this.titleInput.nativeElement.focus();
    this.titleInput.nativeElement.select();
  }

  submitTitleForm() {
    this.props.tabsService.setSessionTitle(this.index, this.titleFormControl.value);
    this.showEditForm = false;
  }

  cancelTitleFormEdit() {
    this.titleFormControl.setValue(this.layoutState.title);
    this.showEditForm = false;
  }

  setMenuOpen(menuOpen: boolean) {
    this.menuOpen = menuOpen;
  }

  debug() { console.log(this); }
}
