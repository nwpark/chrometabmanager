import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ActiveWindowListComponent} from './components/active-window-list/active-window-list.component';
import {SavedWindowListComponent} from './components/saved-window-list/saved-window-list.component';
import {MaterialModule} from './material-module';
import {DraggableChromeTabComponent} from './components/draggable-chrome-tab/draggable-chrome-tab.component';
import {EmptyChromeTabComponent} from './components/empty-chrome-tab/empty-chrome-tab.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChromeWindowComponent} from './components/chrome-window/chrome-window.component';

@NgModule({
  declarations: [
    AppComponent,
    ActiveWindowListComponent,
    SavedWindowListComponent,
    DraggableChromeTabComponent,
    EmptyChromeTabComponent,
    ChromeWindowComponent
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
