import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  constructor() { }

  closeWindowsWhenSaving(): boolean {
    return false;
  }

}
