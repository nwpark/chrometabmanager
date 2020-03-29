import {Component, OnInit} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {PreferencesService} from './services/preferences.service';
import {MatDialog} from '@angular/material';
import {BasicDialogComponent} from './components/dialogs/basic-dialog/basic-dialog.component';
import {BasicDialogData} from './types/errors/basic-dialog-data';
import {DialogDataFactory} from './utils/dialog-data-factory';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  private readonly DARK_THEME = 'dark-theme';

  pageTitle: string;

  constructor(private overlayContainer: OverlayContainer,
              private matDialogService: MatDialog,
              private preferencesService: PreferencesService) { }

  ngOnInit() {
    this.preferencesService.preferences$.subscribe(preferences => {
      this.initializeAppTheme(preferences.enableDarkTheme);
      if (preferences.showReleaseNotesOnStartup) {
        this.showVersionHistoryDialog();
      }
    });
    this.pageTitle = document.title;
  }

  private initializeAppTheme(enableDarkTheme: boolean) {
    const classList = this.overlayContainer.getContainerElement().parentElement.classList;
    if (enableDarkTheme) {
      classList.add(this.DARK_THEME);
    } else {
      classList.remove(this.DARK_THEME);
    }
  }

  private showVersionHistoryDialog() {
    const dialogData: BasicDialogData = DialogDataFactory.createVersionHistoryDialog(() => {
      this.preferencesService.setShowReleaseNotesOnStartup(false);
    });
    this.matDialogService.open(BasicDialogComponent, {data: dialogData});
  }

  isNewTabPage(): boolean {
    return this.pageTitle !== 'Options';
  }

  isOptionsPage(): boolean {
    return this.pageTitle === 'Options';
  }

}
