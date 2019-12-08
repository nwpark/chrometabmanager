import {Component, OnInit} from '@angular/core';
import {MessagePassingService} from './services/message-passing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  pageTitle: string;

  constructor() { }

  ngOnInit() {
    this.pageTitle = document.title;
    MessagePassingService.addPreferencesListener(() => {
      window.location.reload();
    });
  }

  isNewTabPage(): boolean {
    return this.pageTitle !== 'Options';
  }

  isOptionsPage(): boolean {
    return this.pageTitle === 'Options';
  }

}
