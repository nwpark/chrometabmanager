import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  pageTitle: string;

  constructor() { }

  ngOnInit() {
    this.pageTitle = document.title;
  }

  isNewTabPage(): boolean {
    return this.pageTitle !== 'Options';
  }

  isOptionsPage(): boolean {
    return this.pageTitle === 'Options';
  }

}
