import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ChromeAPITabState, ChromeAPIWindowState, WindowLayoutState} from '../../types/chrome-a-p-i-window-state';
import {TabListComponentData} from '../../types/tab-list-component-data';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {TabsService} from '../../interfaces/tabs-service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-chrome-window',
  templateUrl: './chrome-window.component.html',
  styleUrls: ['./chrome-window.component.css']
})
export class ChromeWindowComponent implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: WindowLayoutState;
  @Input() tabsService: TabsService;

  @ViewChild('titleInput', {static: false}) titleInput: ElementRef;
  titleFormControl: FormControl;
  showEditForm = false;

  componentData: TabListComponentData;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.componentData = {
      windowId: this.chromeAPIWindow.id,
      tabsService: this.tabsService
    };
    this.titleFormControl = new FormControl(this.layoutState.title);
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
    this.tabsService.setWindowTitle(this.chromeAPIWindow.id, this.titleFormControl.value);
    this.showEditForm = false;
  }

  cancelTitleFormEdit() {
    this.titleFormControl.setValue(this.layoutState.title);
    this.showEditForm = false;
  }

  setTabActive(chromeTab: ChromeAPITabState) {
    this.tabsService.setTabActive(this.chromeAPIWindow.id, chromeTab);
  }

  closeWindow() {
    this.tabsService.removeWindow(this.chromeAPIWindow.id);
  }

  closeTab(tabId: any) {
    this.tabsService.removeTab(this.chromeAPIWindow.id, tabId);
  }

  toggleDisplay() {
    this.tabsService.toggleWindowDisplay(this.chromeAPIWindow.id);
  }

  tabDropped(event: CdkDragDrop<TabListComponentData>) {
    const targetTabList: TabListComponentData = event.container.data;
    const previousTabList: TabListComponentData = event.previousContainer.data;

    if (event.previousContainer === event.container) {
      this.tabsService.moveTabInWindow(targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else if (previousTabList.tabsService === targetTabList.tabsService) {
      this.tabsService.transferTab(previousTabList.windowId,
        targetTabList.windowId,
        event.previousIndex,
        event.currentIndex);
    } else {
      previousTabList.tabsService.removeTab(previousTabList.windowId, event.item.data.id);
      this.tabsService.createTab(targetTabList.windowId, event.currentIndex, event.item.data);
    }
  }

}
