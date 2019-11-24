import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {WindowLayoutState} from '../../types/window-list-state';
import {ChromeWindowComponentData, WindowCategory} from '../../types/chrome-window-component-data';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {TabsService} from '../../interfaces/tabs-service';
import {FormControl} from '@angular/forms';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {ChromeAPITabState, ChromeAPIWindowState} from '../../types/chrome-api-types';
import {SavedTabsService} from '../../services/saved-tabs.service';

@Component({
  selector: 'app-chrome-window',
  templateUrl: './chrome-window.component.html',
  styleUrls: ['./chrome-window.component.css']
})
export class ChromeWindowComponent<T> implements OnInit {

  @Input() chromeAPIWindow: ChromeAPIWindowState<T>;
  @Input() layoutState: WindowLayoutState;
  @Input() windowCategory: WindowCategory;
  @Input() tabsService: TabsService<T>;

  @ViewChild('titleInput', {static: false}) titleInput: ElementRef;
  titleFormControl: FormControl;
  showEditForm = false;

  componentData: ChromeWindowComponentData;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private chromeTabsService: ChromeTabsService,
              private savedTabsService: SavedTabsService) { }

  ngOnInit() {
    this.componentData = {
      windowId: this.chromeAPIWindow.id,
      category: this.windowCategory,
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

  setTabActive(chromeTab: ChromeAPITabState<T>) {
    this.tabsService.setTabActive(this.chromeAPIWindow.id, chromeTab);
  }

  closeWindow() {
    this.tabsService.removeWindow(this.chromeAPIWindow.id);
  }

  closeTab(tabId: T) {
    this.tabsService.removeTab(this.chromeAPIWindow.id, tabId);
  }

  shouldShowSaveWindowButton(): boolean {
    return this.windowCategory === WindowCategory.Active;
  }

  saveWindow() {
    this.savedTabsService.saveWindow(this.chromeAPIWindow);
  }

  shouldShowOpenWindowButton(): boolean {
    return this.windowCategory !== WindowCategory.Active;
  }

  openWindow() {
    this.chromeTabsService.createWindow(this.chromeAPIWindow);
  }

  toggleDisplay() {
    this.tabsService.toggleWindowDisplay(this.chromeAPIWindow.id);
  }

  get isMutable(): boolean {
    return this.windowCategory !== WindowCategory.RecentlyClosed;
  }

  dropTargetIsMutable(drag: CdkDrag, drop: CdkDropList<ChromeWindowComponentData>): boolean {
    return drop.data.category !== WindowCategory.RecentlyClosed;
  }

  tabDropped(event: CdkDragDrop<ChromeWindowComponentData>) {
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
  }

}
