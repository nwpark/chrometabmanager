import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ChromeAPISession, ChromeAPITabState} from '../../types/chrome-api-types';
import {AnimationState, closeTabAnimation, closeWindowAnimation} from '../../animations';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {ChromeWindowComponentProps} from '../../types/chrome-window-component-data';

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

  @Input() session: ChromeAPISession;
  @Input() props: ChromeWindowComponentProps;
  @Input() isFirstChild: boolean;
  @Input() isLastChild: boolean;

  animationState = AnimationState.Complete;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() { }

  get title() {
    return this.session.tab.title.length > 0
      ? this.session.tab.title
      : this.session.tab.url;
  }

  getFaviconIconUrl(): string {
    if (!this.session.tab.favIconUrl) {
      return 'assets/chrome-favicon.png';
    }
    return this.session.tab.favIconUrl;
  }

  shouldShowFaviconIcon(): boolean {
    return !this.isLoading() && !this.isNewTab();
  }

  isNewTab(): boolean {
    return !this.isLoading() && this.session.tab.url === DetachedChromeTabComponent.NEW_TAB_URL;
  }

  isLoading(): boolean {
    return this.session.tab.status === 'loading';
  }

  get lastModifiedString(): string {
    return new Date(this.session.lastModified).toTimeString().substring(0, 5);
  }

  setTabActive(event: MouseEvent) {
    this.props.tabsService.setTabActive(this.session.tab, event.ctrlKey);
  }

  closeTab() {
    this.animationState = this.isFirstChild && this.isLastChild
      ? AnimationState.Closing : AnimationState.Collapsing;
    // todo: setAnimationState method
    this.changeDetectorRef.detectChanges();
  }

  completeCloseAnimation(event: AnimationEvent) {
    if (event.toState === AnimationState.Closing || event.toState === AnimationState.Collapsing) {
      this.props.tabsService.removeSession(this.session.tab.id);
    }
  }
}
