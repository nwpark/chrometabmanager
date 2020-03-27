import {Component, OnInit} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {PreferencesService} from './services/preferences.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  private readonly DARK_THEME = 'dark-theme';

  pageTitle: string;

  constructor(private overlayContainer: OverlayContainer,
              private preferencesService: PreferencesService) { }

  ngOnInit() {
    this.preferencesService.preferences$.subscribe(preferences => {
      const classList = this.overlayContainer.getContainerElement().parentElement.classList;
      if (preferences.enableDarkTheme) {
        classList.add(this.DARK_THEME);
      } else {
        classList.remove(this.DARK_THEME);
      }
    });
    this.pageTitle = document.title;
  }

  isNewTabPage(): boolean {
    return this.pageTitle !== 'Options';
  }

  isOptionsPage(): boolean {
    return this.pageTitle === 'Options';
  }

}
