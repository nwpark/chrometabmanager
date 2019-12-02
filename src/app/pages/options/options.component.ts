import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {PreferencesService} from '../../services/preferences.service';
import {Preferences} from '../../types/preferences';
import {MatSlideToggleChange} from '@angular/material';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css'],
  animations: [
    trigger('simpleFadeAnimation', [
      state('fadeIn', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0}),
        animate(200)
      ])
    ])
  ]
})
export class OptionsComponent implements OnInit {

  preferences: Preferences;

  constructor(private preferencesService: PreferencesService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.preferences = this.preferencesService.getPreferences();
    this.preferencesService.preferencesUpdated$.subscribe(preferences => {
      this.preferences = preferences;
      this.changeDetectorRef.detectChanges();
    });
  }

  setCloseWindowOnSave(event: MatSlideToggleChange) {
    this.preferencesService.setCloseWindowOnSave(event.checked);
  }

  setEnableDebugging(event: MatSlideToggleChange) {
    this.preferencesService.setEnableDebugging(event.checked);
  }

}
