import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {WindowLayoutState} from '../../types/window-list-state';
import {ActionButton} from '../../types/action-bar';
import {ChromeAPIWindowState} from '../../types/chrome-api-types';
import {FormControl} from '@angular/forms';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';

@Component({
  selector: 'app-chrome-window-header',
  templateUrl: './chrome-window-header.component.html',
  styleUrls: ['./chrome-window-header.component.css']
})
export class ChromeWindowHeaderComponent implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: WindowLayoutState;
  @Input() actionButtons: ActionButton[];
  @Input() props: ChromeWindowComponentProps;

  @ViewChild('titleInput', {static: false}) titleInput: ElementRef;
  titleFormControl: FormControl;
  showEditForm = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.titleFormControl = new FormControl(this.layoutState.title);
  }

  debug() {
    console.log(this);
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
    this.props.tabsService.setWindowTitle(this.chromeAPIWindow.id, this.titleFormControl.value);
    this.showEditForm = false;
  }

  cancelTitleFormEdit() {
    this.titleFormControl.setValue(this.layoutState.title);
    this.showEditForm = false;
  }

}