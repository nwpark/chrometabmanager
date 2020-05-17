import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {AnimationState, closeTabAnimation} from '../../animations';
import {SessionComponentProps} from '../../types/chrome-window-component-data';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ChromeAPITabState, getUrl, hasTitle} from '../../types/chrome-api/chrome-api-tab-state';
import {WebpageTitleCacheService} from '../../services/webpage-title-cache.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-draggable-chrome-tab',
  templateUrl: './draggable-chrome-tab.component.html',
  styleUrls: ['./draggable-chrome-tab.component.scss'],
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

  constructor(private webpageTitleCacheService: WebpageTitleCacheService,
              private changeDetectorRef: ChangeDetectorRef,
              private domSanitizer: DomSanitizer) { }

  ngOnInit() {
    this.title = hasTitle(this.chromeTab)
      ? this.chromeTab.title
      : this.webpageTitleCacheService.getTitleForUrl(getUrl(this.chromeTab));
    this.faviconIconUrl = this.getFavIconUrl();
  }

  private getFavIconUrl(): SafeUrl {
    const favIconUrl = environment.favIconUrl + this.chromeTab.url;
    return this.domSanitizer.bypassSecurityTrustUrl(favIconUrl);
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
