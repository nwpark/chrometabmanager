import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TabGroupCategory, TabListComponentData} from '../../types/tab-list-component-data';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {FormControl} from '@angular/forms';
import {ChromeWindowComponent} from '../chrome-window/chrome-window.component';

@Component({
  selector: 'app-active-window',
  templateUrl: './active-window.component.html',
  styleUrls: ['./active-window.component.css']
})
export class ActiveWindowComponent extends ChromeWindowComponent implements OnInit {

  @ViewChild('titleInput', {static: false}) titleInput: ElementRef;

  componentData: TabListComponentData;

  titleFormControl: FormControl;
  showEditForm = false;

  constructor(private chromeTabsService: ChromeTabsService,
              changeDefectorRef: ChangeDetectorRef) {
    super(chromeTabsService, changeDefectorRef);
  }

  ngOnInit() {
    this.componentData = {
      windowId: this.chromeAPIWindow.id,
      tabs: this.chromeAPIWindow.tabs,
      category: TabGroupCategory.Active,
      componentRef: this
    };
    this.titleFormControl = new FormControl(this.layoutState.title);
  }

  setTabActive(tabId: any) {
    this.chromeTabsService.setTabActive(this.chromeAPIWindow.id, tabId);
  }

  editTitle() {
    this.showEditForm = true;
    this.changeDetectorRef.detectChanges();
    this.titleInput.nativeElement.focus();
    this.titleInput.nativeElement.select();
  }

  submitTitleForm() {
    this.chromeTabsService.setWindowTitle(this.chromeAPIWindow.id, this.titleFormControl.value);
    this.showEditForm = false;
  }

  cancelTitleForm() {
    this.titleFormControl.setValue(this.layoutState.title);
    this.showEditForm = false;
  }
}
