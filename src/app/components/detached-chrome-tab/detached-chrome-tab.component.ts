import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {AnimationState, closeTabAnimation, closeWindowAnimation} from '../../animations';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {SessionState} from '../../types/session';

@Component({
  selector: 'app-detached-chrome-tab',
  templateUrl: './detached-chrome-tab.component.html',
  styleUrls: ['./detached-chrome-tab.component.css'],
  animations: [
    trigger('close-tab', [
      transition(`* => ${AnimationState.Collapsing}`, [
        useAnimation(closeTabAnimation, {})
      ]),
      transition(`* => ${AnimationState.Closing}`, [
        useAnimation(closeWindowAnimation, {})
      ])
    ])
  ]
})
export class DetachedChromeTabComponent implements OnInit {

  static readonly NEW_TAB_URL = 'chrome://newtab/';

  @Input() sessionState: SessionState;
  @Input() props: SessionComponentProps;
  @Input() isFirstChild: boolean;
  @Input() isLastChild: boolean;

  chromeAPITab: ChromeAPITabState;
  animationState = AnimationState.Complete;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.chromeAPITab = this.sessionState.session.tab;
  }

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
    this.changeDetectorRef.detectChanges();
  }

  get title() {
    return this.chromeAPITab.title.length > 0
      ? this.chromeAPITab.title
      : this.chromeAPITab.url;
  }

  getFaviconIconUrl(): string {
    if (!this.chromeAPITab.favIconUrl) {
      return 'assets/chrome-favicon.png';
    }
    return this.chromeAPITab.favIconUrl;
  }

  shouldShowFaviconIcon(): boolean {
    return !this.isLoading() && !this.isNewTab();
  }

  isNewTab(): boolean {
    return !this.isLoading() && this.chromeAPITab.url === DetachedChromeTabComponent.NEW_TAB_URL;
  }

  isLoading(): boolean {
    return this.chromeAPITab.status === 'loading';
  }

  get lastModifiedString(): string {
    return new Date(this.sessionState.session.lastModified).toTimeString().substring(0, 5);
  }

  setTabActive(event: MouseEvent) {
    this.props.tabsService.setTabActive(this.chromeAPITab, event.ctrlKey);
  }

  closeTab() {
    const animationState = this.isFirstChild && this.isLastChild
      ? AnimationState.Closing : AnimationState.Collapsing;
    this.setAnimationState(animationState);
  }

  completeCloseAnimation(event: AnimationEvent) {
    if (event.toState === AnimationState.Closing || event.toState === AnimationState.Collapsing) {
      this.setAnimationState(AnimationState.Complete);
      this.props.tabsService.removeSession(this.chromeAPITab.id);
    }
  }
}
