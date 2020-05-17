import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AnimationState, closeTabAnimation, closeWindowAnimation} from '../../animations';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {getTimeStampString} from '../../utils/date-utils';
import {ChromeAPITabState} from '../../types/chrome-api/chrome-api-tab-state';
import {SessionState} from '../../types/session/session-state';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-detached-chrome-tab',
  templateUrl: './detached-chrome-tab.component.html',
  styleUrls: ['./detached-chrome-tab.component.scss'],
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
    this.faviconIconUrl = this.getFavIconUrl();
    this.lastModified = getTimeStampString(this.sessionState.session.lastModified);
  }

  private getFavIconUrl(): SafeUrl {
    const favIconUrl = environment.favIconUrl + this.chromeAPITab.url;
    return this.domSanitizer.bypassSecurityTrustUrl(favIconUrl);
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
