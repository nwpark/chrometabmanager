import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {TabGroupCategory, TabListComponentData} from '../../types/tab-list-component-data';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {ChromeAPIWindowState, WindowLayoutState} from '../../types/chrome-a-p-i-window-state';
import {FormControl} from '@angular/forms';
import {MouseOver} from '../mouse-over';

@Component({
  selector: 'app-active-window',
  templateUrl: './active-window.component.html',
  styleUrls: ['./active-window.component.css']
})
export class ActiveWindowComponent extends MouseOver implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: WindowLayoutState;

  @ViewChild('titleInput', {static: false}) titleInput: ElementRef;

  componentData: TabListComponentData;

  titleFormControl: FormControl;
  showEditForm = false;

  constructor(private chromeTabsService: ChromeTabsService,
              private changeDefectorRef: ChangeDetectorRef) {
    super(changeDefectorRef);
  }

  ngOnInit() {
    this.componentData = {
      windowId: this.chromeAPIWindow.id,
      tabs: this.chromeAPIWindow.tabs,
      category: TabGroupCategory.Saved,
      componentRef: this
    };
    this.titleFormControl = new FormControl(this.layoutState.title);
  }

  getTitle(): string {
    return this.layoutState.hidden ? `${this.layoutState.title} (${this.chromeAPIWindow.tabs.length} tabs)` : this.layoutState.title;
  }

  closeWindow() {
    this.chromeTabsService.removeWindow(this.chromeAPIWindow.id);
  }

  closeTab(tabId: any) {
    const index = this.chromeAPIWindow.tabs.findIndex(tab => tab.id === tabId);
    this.chromeTabsService.removeTab(this.chromeAPIWindow.id, index);
  }

  setTabActive(tabId: any) {
    this.chromeTabsService.setTabActive(this.chromeAPIWindow.id, tabId);
  }

  toggleDisplay() {
    this.chromeTabsService.toggleWindowDisplay(this.chromeAPIWindow.id);
  }

  editTitle() {
    this.showEditForm = true;
    this.changeDefectorRef.detectChanges();
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

  tabDropped(event: CdkDragDrop<TabListComponentData>) {
    const targetTabList: TabListComponentData = event.container.data;
    const previousTabList: TabListComponentData = event.previousContainer.data;

    if (event.previousContainer === event.container) {
      this.chromeTabsService.moveTabInWindow(targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else if (previousTabList.category === targetTabList.category) {
      this.chromeTabsService.transferTab(previousTabList.windowId,
        targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else {
      previousTabList.componentRef.closeTab(event.item.data.id);
      this.chromeTabsService.createTab(targetTabList.windowId, event.currentIndex, event.item.data);
    }
  }
}
