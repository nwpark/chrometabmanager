import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ActionButton, ActionButtonFactory} from '../../types/action-bar';
import {ChromeAPIWindowState} from '../../types/chrome-api-types';
import {FormControl} from '@angular/forms';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';
import {PreferencesService} from '../../services/preferences.service';
import {ActionBarService} from '../../services/action-bar.service';
import {SessionLayoutState} from '../../types/session-list-state';

@Component({
  selector: 'app-chrome-window-header',
  templateUrl: './chrome-window-header.component.html',
  styleUrls: ['./chrome-window-header.component.css']
})
export class ChromeWindowHeaderComponent implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: SessionLayoutState;
  @Input() props: ChromeWindowComponentProps;
  @Output() chromeWindowClose = new EventEmitter();
  @Output() chromeWindowToggleDisplay = new EventEmitter();

  actionButtons: ActionButton[];

  @ViewChild('titleInput', {static: false}) titleInput: ElementRef;
  titleFormControl: FormControl;
  showEditForm = false;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private preferencesService: PreferencesService,
              private actionBarService: ActionBarService) { }

  ngOnInit() {
    this.actionButtons = [
      ...this.actionBarService.createWindowActionButtons(this.props.windowListId),
      ActionButtonFactory.createMinimizeButton(() => this.chromeWindowToggleDisplay.emit()),
      ActionButtonFactory.createCloseButton(() => this.chromeWindowClose.emit())
    ];
    this.titleFormControl = new FormControl(this.layoutState.title);
  }

  debug() {
    console.log(this);
  }

  debugModeEnabled(): boolean {
    return this.preferencesService.isDebugModeEnabled();
  }

  getTitle(): string {
    return this.layoutState.hidden
      ? `${this.layoutState.title} (${this.chromeAPIWindow.tabs.length} tabs)`
      : this.layoutState.title;
  }

  editTitle() {
    this.showEditForm = true;
    this.changeDetectorRef.detectChanges();
    this.titleInput.nativeElement.focus();
    this.titleInput.nativeElement.select();
  }

  submitTitleForm() {
    this.props.tabsService.setSessionTitle(this.chromeAPIWindow.id, this.titleFormControl.value);
    this.showEditForm = false;
  }

  cancelTitleFormEdit() {
    this.titleFormControl.setValue(this.layoutState.title);
    this.showEditForm = false;
  }

}
