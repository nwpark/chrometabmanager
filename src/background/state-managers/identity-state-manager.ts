import {OAuth2Service} from '../../app/services/oauth2/o-auth-2.service';
import {getCurrentTimeStringWithMillis} from '../../app/utils/date-utils';
import {ChromePermissionsService} from '../../app/services/chrome-permissions.service';

export class IdentityStateManager {

  private signInListenerInitialized = false;

  constructor(private oAuth2Service: OAuth2Service,
              private chromePermissionsService: ChromePermissionsService) {
    this.chromePermissionsService.permissionsUpdated$.subscribe(() => {
      this.setupListeners();
    });
    this.setupListeners();
  }

  private setupListeners() {
    this.chromePermissionsService.hasIdentityPermissions().then(hasIdentityPermissions => {
      if (hasIdentityPermissions && !this.signInListenerInitialized) {
        this.addOnSignInChangedListener();
        this.signInListenerInitialized = true;
      }
    });
  }

  private addOnSignInChangedListener() {
    chrome.identity.onSignInChanged.addListener((account, signedIn) => {
      console.log(`${getCurrentTimeStringWithMillis()} - chrome sign in status changed, signedIn=${signedIn}`);
      if (signedIn) {
        this.oAuth2Service.removeCachedAuthToken();
      } else {
        this.oAuth2Service.refreshAuthStatus();
      }
    });
  }
}
