import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {AnimationState, closeTabAnimation} from '../../animations';
import {SessionComponentProps} from '../../types/chrome-window-component-data';

@Component({
  selector: 'app-draggable-chrome-tab',
  templateUrl: './draggable-chrome-tab.component.html',
  styleUrls: ['./draggable-chrome-tab.component.css'],
  animations: [
    trigger('close-tab', [
      transition(`* => ${AnimationState.Closing}`, [
        useAnimation(closeTabAnimation, {})
      ])
    ])
  ]
})
export class DraggableChromeTabComponent implements OnInit {

  static readonly NEW_TAB_URL = 'chrome://newtab/';

  @Input() chromeTab: ChromeAPITabState;
  @Input() props: SessionComponentProps;
  @Input() parentIndex: number;

  animationState = AnimationState.Complete;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() { }

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
    this.changeDetectorRef.detectChanges();
  }

  get title() {
    return this.chromeTab.title.length > 0
      ? this.chromeTab.title
      : this.chromeTab.url;
  }

  getFaviconIconUrl(): string {
    if (!this.chromeTab.favIconUrl) {
      return 'assets/chrome-favicon.png';
    }
    return this.chromeTab.favIconUrl;
  }

  shouldShowFaviconIcon(): boolean {
    return !this.isLoading() && !this.isNewTab();
  }

  isNewTab(): boolean {
    return !this.isLoading() && this.chromeTab.url === DraggableChromeTabComponent.NEW_TAB_URL;
  }

  isLoading(): boolean {
    return this.chromeTab.status === 'loading';
  }

  setTabActive(event: MouseEvent) {
    this.props.tabsService.setTabActive(this.chromeTab, event.ctrlKey);
  }

  closeTab() {
    this.setAnimationState(AnimationState.Closing);
  }

  completeCloseAnimation(event: AnimationEvent) {
    if (event.toState === AnimationState.Closing) {
      this.props.tabsService.removeTab(this.parentIndex, this.chromeTab.id);
    }
  }
}
