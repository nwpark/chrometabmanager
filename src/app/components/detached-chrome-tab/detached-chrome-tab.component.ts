import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ChromeAPITabState} from '../../types/chrome-api-types';
import {AnimationState, closeTabAnimation, closeWindowAnimation} from '../../animations';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {SessionState} from '../../types/session';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

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

  @Input() sessionState: SessionState;
  @Input() props: SessionComponentProps;
  @Input() index: number;
  @Input() isFirstChild: boolean;
  @Input() isLastChild: boolean;

  chromeAPITab: ChromeAPITabState;
  animationState = AnimationState.Complete;
  title: string;
  faviconIconUrl: SafeUrl;
  lastModified: string;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    this.chromeAPITab = this.sessionState.session.tab;
    this.title = this.chromeAPITab.title.length > 0
      ? this.chromeAPITab.title
      : this.chromeAPITab.url;
    this.faviconIconUrl = this.domSanitizer.bypassSecurityTrustUrl(this.getFaviconIconUrl());
    this.lastModified = this.getLastModifiedString();
  }

  private getFaviconIconUrl() {
    if (this.chromeAPITab.favIconUrl) {
      return this.chromeAPITab.favIconUrl;
    } else {
      return `chrome://favicon/size/16/${this.chromeAPITab.url}`;
    }
  }

  private getLastModifiedString(): string {
    const lastModifiedDate = new Date(this.sessionState.session.lastModified);
    const timeString = lastModifiedDate.toTimeString().substring(0, 5);
    const dateString = lastModifiedDate.toDateString().substring(0, 3) + ' - ' + timeString;
    return lastModifiedDate.toLocaleDateString() === new Date().toLocaleDateString()
      ? timeString : dateString;
  }

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
    this.changeDetectorRef.detectChanges();
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
      this.props.tabsService.removeSession(this.index);
    }
  }
}
