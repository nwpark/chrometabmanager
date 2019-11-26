import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {WindowLayoutState} from '../../types/window-list-state';
import {ChromeWindowComponentData, WindowCategory} from '../../types/chrome-window-component-data';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {TabsService} from '../../interfaces/tabs-service';
import {FormControl} from '@angular/forms';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {ChromeAPITabState, ChromeAPIWindowState} from '../../types/chrome-api-types';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {DragDropService} from '../../services/drag-drop.service';
import {ActionButton} from '../../types/action-bar';

@Component({
  selector: 'app-chrome-window',
  templateUrl: './chrome-window.component.html',
  styleUrls: ['./chrome-window.component.css']
})
export class ChromeWindowComponent implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState;
  @Input() layoutState: WindowLayoutState;
  @Input() actionButtons: ActionButton[];
  @Input() isMutable: boolean;
  @Input() windowCategory: WindowCategory;
  @Input() tabsService: TabsService;

  @ViewChild('titleInput', {static: false}) titleInput: ElementRef;
  titleFormControl: FormControl;
  showEditForm = false;

  componentData: ChromeWindowComponentData;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService,
              private dragDropService: DragDropService) { }

  ngOnInit() {
    this.componentData = {
      windowId: this.chromeAPIWindow.id,
      category: this.windowCategory,
      tabsService: this.tabsService,
      windowIsMutable: this.isMutable
    };
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

  closeTab(tabId: any) {
    this.tabsService.removeTab(this.chromeAPIWindow.id, tabId);
  }

  toggleDisplay() {
    this.tabsService.toggleWindowDisplay(this.chromeAPIWindow.id);
  }

  dropTargetIsMutable(drag: CdkDrag, drop: CdkDropList<ChromeWindowComponentData>): boolean {
    return drop.data.windowIsMutable;
  }

  isDragEnabled(chromeTab: ChromeAPITabState) {
    return this.isMutable
      && !this.dragDropService.isDragging()
      && chromeTab.id !== undefined;
  }

  beginDrag() {
    this.dragDropService.beginDrag();
  }

  tabDropped(event: CdkDragDrop<ChromeWindowComponentData>) {
    try {
      const targetTabList: ChromeWindowComponentData = event.container.data;
      const previousTabList: ChromeWindowComponentData = event.previousContainer.data;

      if (event.previousContainer === event.container) {
        this.tabsService.moveTabInWindow(targetTabList.windowId,
          event.previousIndex,
          event.currentIndex);
      } else if (previousTabList.category === targetTabList.category) {
        this.tabsService.transferTab(previousTabList.windowId,
          targetTabList.windowId,
          event.previousIndex,
          event.currentIndex);
      } else {
        previousTabList.tabsService.removeTab(previousTabList.windowId, event.item.data.id);
        this.tabsService.createTab(targetTabList.windowId, event.currentIndex, event.item.data);
      }
    } finally {
      this.dragDropService.endDrag();
    }
  }

}
