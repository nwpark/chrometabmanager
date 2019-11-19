import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  static readonly BREAKPOINT_M = 1400;
  static readonly BREAKPOINT_S = 900;

  title = 'tabmanager';
  cols: number;

  ngOnInit(): void {
    this.cols = this.getCols(window.innerWidth);
  }

  onResize(event) {
    this.cols = this.getCols(event.target.innerWidth);
  }

  getCols(windowWidth: number) {
    if (window.innerWidth > AppComponent.BREAKPOINT_M) {
      return 3;
    }
    if (window.innerWidth > AppComponent.BREAKPOINT_S) {
      return 2;
    }
    return 1;
  }

}
