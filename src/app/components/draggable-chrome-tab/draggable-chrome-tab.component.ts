import {ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {AnimationEvent, transition, trigger, useAnimation} from '@angular/animations';
import {AnimationState, closeTabAnimation} from '../../animations';
import {SessionComponentProps, SessionListId} from '../../types/chrome-window-component-data';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ChromeAPITabState, getUrl, hasTitle} from '../../types/chrome-api/chrome-api-tab-state';
import {WebpageTitleCacheService} from '../../services/webpage-title-cache.service';
import {environment} from '../../../environments/environment';
import {ContextMenuService} from '../../services/context-menu.service';
import {EditableTextComponent} from '../editable-text/editable-text.component';
import {ContextMenuItem} from '../../types/action-bar/context-menu-item';

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

  @ViewChild(EditableTextComponent, {static: false}) titleTextComponent: EditableTextComponent;

  title: string;
  faviconIconUrl: SafeUrl;
  animationState = AnimationState.Complete;

  constructor(private webpageTitleCacheService: WebpageTitleCacheService,
              private contextMenuService: ContextMenuService,
              private changeDetectorRef: ChangeDetectorRef,
              private domSanitizer: DomSanitizer,
              private viewContainerRef: ViewContainerRef) { }

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

  setTabActive(openInNewTab: boolean) {
    if (!this.titleTextComponent.isEditing) {
      this.props.tabsService.setTabActive(this.chromeTab, openInNewTab);
    }
  }

  closeTab() {
    this.setAnimationState(AnimationState.Closing);
  }

  completeCloseAnimation(event: AnimationEvent) {
    if (event.toState === AnimationState.Closing) {
      this.props.tabsService.removeTab(this.parentIndex, this.chromeTab.id);
    }
  }

  setTitle(title: string) {
    // todo
  }

  showEditTitleForm() {
    this.titleTextComponent.showEditForm();
  }

  openContextMenu(event: MouseEvent) {
    this.contextMenuService.openContextMenu(event, this.getContextMenuItems(), this.viewContainerRef);
  }

  private getContextMenuItems(): ContextMenuItem[] {
    switch (this.props.sessionListId) {
      case SessionListId.Saved: return [
        {title: 'Edit title', icon: 'edit', tooltip: 'Edit title', callback: () => this.showEditTitleForm()},
        {title: 'Open', icon: 'open_in_new', tooltip: 'Open tab', callback: () => this.setTabActive(false)},
        {title: 'Delete', icon: 'delete', tooltip: 'Delete saved tab', callback: () => this.closeTab()}
      ];
      case SessionListId.Active: return [
        {title: 'Open', icon: 'open_in_new', tooltip: 'Open tab', callback: () => this.setTabActive(false)},
        // todo: implement callback
        {title: 'Suspend', icon: 'pause_circle_filled', tooltip: 'Suspend tab to free up memory and CPU consumed by chrome', callback: () => {}},
        {title: 'Close', icon: 'close', tooltip: 'Close tab', callback: () => this.closeTab()}
      ];
    }
  }
}
