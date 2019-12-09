import {Component, OnInit} from '@angular/core';
import {SyncStorageService} from './services/sync-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  pageTitle: string;

  constructor(private syncStorageService: SyncStorageService) { }

  ngOnInit() {
    this.pageTitle = document.title;
    this.syncStorageService.addPreferencesChangedListener(() => {
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
