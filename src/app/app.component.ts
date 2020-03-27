import {Component, OnInit} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  private readonly LIGHT_THEME_CLASS = 'light-theme';
  private readonly DARK_THEME_CLASS = 'dark-theme';

  pageTitle: string;

  constructor(private overlayContainer: OverlayContainer) { }

  ngOnInit() {
    const classList = this.overlayContainer.getContainerElement().parentElement.classList;
    classList.add(this.LIGHT_THEME_CLASS);
    this.pageTitle = document.title;
  }

  isNewTabPage(): boolean {
    return this.pageTitle !== 'Options';
  }

  isOptionsPage(): boolean {
    return this.pageTitle === 'Options';
  }

}
