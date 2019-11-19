import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {TabGroupCategory, TabListComponentData} from '../../types/tab-list-component-data';
import {SavedTabsService} from '../../services/saved-tabs.service';
import {ChromeAPITabState, ChromeAPIWindowState, WindowLayoutState} from '../../types/chrome-a-p-i-window-state';
import {ChromeTabsService} from '../../services/chrome-tabs.service';
import {ChromeWindowComponent} from '../chrome-window/chrome-window.component';

@Component({
  selector: 'app-saved-window',
  templateUrl: './saved-window.component.html',
  styleUrls: ['./saved-window.component.css']
})
export class SavedWindowComponent extends ChromeWindowComponent implements OnInit {

  componentData: TabListComponentData;

  constructor(private savedTabsService: SavedTabsService,
              private chromeTabsService: ChromeTabsService,
              changeDetectorRef: ChangeDetectorRef) {
    super(savedTabsService, changeDetectorRef);
  }

  ngOnInit() {
    this.componentData = {
      windowId: this.chromeAPIWindow.id,
      tabs: this.chromeAPIWindow.tabs,
      category: TabGroupCategory.Saved,
      componentRef: this
    };
  }

  replaceCurrentTab(chromeTab: ChromeAPITabState) {
    this.chromeTabsService.replaceCurrentTab(chromeTab);
  }
}
