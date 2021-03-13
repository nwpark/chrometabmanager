import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material-module';
import {DraggableChromeTabComponent} from './components/draggable-chrome-tab/draggable-chrome-tab.component';
import {EmptyChromeTabComponent} from './components/empty-chrome-tab/empty-chrome-tab.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChromeWindowComponent} from './components/chrome-window/chrome-window.component';
import {MouseOverDirective} from './directives/mouse-over.directive';
import {ChromeWindowHeaderComponent} from './components/chrome-window-header/chrome-window-header.component';
import {OptionsComponent} from './pages/options/options.component';
import {NewTabPageComponent} from './pages/new-tab-page/new-tab-page.component';
import {ChromeWindowContainerComponent} from './components/chrome-window-container/chrome-window-container.component';
import {DetachedChromeTabComponent} from './components/detached-chrome-tab/detached-chrome-tab.component';
import {ActionableErrorDialogComponent} from './components/dialogs/actionable-error-dialog/actionable-error-dialog.component';
import {RuntimeErrorDialogComponent} from './components/dialogs/runtime-error-dialog/runtime-error-dialog.component';
import {BasicDialogComponent} from './components/dialogs/basic-dialog/basic-dialog.component';
import {DriveLoginDialogComponent} from './components/dialogs/drive-login-dialog/drive-login-dialog.component';
import {RuntimeErrorHandler} from './runtime-error-handler';
import {SavedSessionsListComponent} from './components/session-lists/saved-sessions-list/saved-sessions-list.component';
import {SessionListComponent} from './components/session-lists/session-list/session-list.component';
import {ActiveSessionsListComponent} from './components/session-lists/active-sessions-list/active-sessions-list.component';
import {ClosedSessionsListComponent} from './components/session-lists/closed-sessions-list/closed-sessions-list.component';
import {SyncStatusComponent} from './components/sync-status/sync-status.component';
import {DisableSyncDialogComponent} from './components/dialogs/disable-sync-dialog/disable-sync-dialog.component';
import {ContextMenuComponent} from './components/context-menu/context-menu.component';
import { EditableTextComponent } from './components/editable-text/editable-text.component';
import { SessionListGroupComponent } from './components/session-lists/session-list-group/session-list-group.component';

@NgModule({
  declarations: [
    AppComponent,
    DraggableChromeTabComponent,
    EmptyChromeTabComponent,
    ChromeWindowComponent,
    MouseOverDirective,
    ChromeWindowHeaderComponent,
    OptionsComponent,
    NewTabPageComponent,
    ChromeWindowContainerComponent,
    DetachedChromeTabComponent,
    ActionableErrorDialogComponent,
    RuntimeErrorDialogComponent,
    BasicDialogComponent,
    DriveLoginDialogComponent,
    SavedSessionsListComponent,
    SessionListComponent,
    ActiveSessionsListComponent,
    ClosedSessionsListComponent,
    SyncStatusComponent,
    DisableSyncDialogComponent,
    ContextMenuComponent,
    EditableTextComponent,
    SessionListGroupComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    ActionableErrorDialogComponent,
    RuntimeErrorDialogComponent,
    BasicDialogComponent,
    DriveLoginDialogComponent,
    DisableSyncDialogComponent,
    ContextMenuComponent
  ],
  providers: [
    {provide: ErrorHandler, useClass: RuntimeErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
