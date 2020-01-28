import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {AnimationState, closeTabAnimation} from '../../animations';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ChromeAPITabState} from '../../types/chrome-api/chrome-api-tab-state';

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

  @Input() chromeTab: ChromeAPITabState;
  @Input() props: SessionComponentProps;
  @Input() parentIndex: number;

  animationState = AnimationState.Complete;
  title: string;
  faviconIconUrl: SafeUrl;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    // todo: create title cache (map url to title) in case it doesnt exist
    this.title = this.chromeTab.title.length > 0
      ? this.chromeTab.title
      : this.chromeTab.url;
    this.faviconIconUrl = this.domSanitizer.bypassSecurityTrustUrl(this.getFaviconIconUrl());
  }

  private getFaviconIconUrl() {
    if (this.chromeTab.favIconUrl) {
      return this.chromeTab.favIconUrl;
    } else {
      return `chrome://favicon/size/16/${this.chromeTab.url}`;
    }
  }

  private setAnimationState(animationState: AnimationState) {
    this.animationState = animationState;
    this.changeDetectorRef.detectChanges();
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
