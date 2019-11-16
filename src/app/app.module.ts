import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActiveWindowListComponent } from './components/active-window-list/active-window-list.component';
import { ActiveWindowComponent } from './components/active-window/active-window.component';
import { SavedWindowListComponent } from './components/saved-window-list/saved-window-list.component';
import { SavedWindowComponent } from './components/saved-window/saved-window.component';
import {MaterialModule} from './material-module';
import { DraggableChromeTabComponent } from './components/draggable-chrome-tab/draggable-chrome-tab.component';

@NgModule({
  declarations: [
    AppComponent,
    ActiveWindowListComponent,
    ActiveWindowComponent,
    SavedWindowListComponent,
    SavedWindowComponent,
    DraggableChromeTabComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
