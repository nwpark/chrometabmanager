import {OAuth2Service} from '../../app/services/drive-api/o-auth-2.service';
import {getCurrentTimeStringWithMillis} from '../../app/utils/date-utils';

export class IdentityStateManager {

  constructor(private oAuth2Service: OAuth2Service) {
    chrome.identity.onSignInChanged.addListener(() => {
      console.log(getCurrentTimeStringWithMillis(), '- chrome sign in status changed');
      this.oAuth2Service.removeCachedAuthToken();
    });
  }
}
