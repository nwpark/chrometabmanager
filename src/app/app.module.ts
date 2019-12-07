import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

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
import { WindowListComponent } from './components/window-list/window-list.component';
import { ChromeWindowContainerComponent } from './components/chrome-window-container/chrome-window-container.component';
import { DetachedChromeTabComponent } from './components/detached-chrome-tab/detached-chrome-tab.component';

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
    WindowListComponent,
    ChromeWindowContainerComponent,
    DetachedChromeTabComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
