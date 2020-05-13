// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  backgroundPhoto: {
    author: 'Simon Matzinger',
    url: 'https://www.flickr.com/photos/simonmatzinger/32139955053/in/gallery-152977080@N03-72157681650448265/'
  },
  errorReportEmailAddress: 'nick.wpa+ctm@gmail.com',
  httpRequestTimeoutMillis: 5000,
  driveApiGetAccountInfoUrl: 'https://www.googleapis.com/drive/v3/about?fields=user',
  driveApiGetFileListUrl: 'https://www.googleapis.com/drive/v3/files?fields=files&spaces=appDataFolder&q=name%20%3D%20\'fileName\'',
  driveApiGetFileContentUrl: 'https://www.googleapis.com/drive/v3/files/fileId?alt=media',
  driveApiPostFileContentUrl: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
  driveApiPatchFileContentUrl: 'https://www.googleapis.com/upload/drive/v3/files/fileId?uploadType=media',
  chromeLoginUrl: 'https://accounts.google.com/',
  accountsApiRevokeTokenUrl: 'https://oauth2.googleapis.com/revoke?token=AUTH_TOKEN',
  oAuth2TokenUrl: 'https://oauth2.googleapis.com/token',
  urlEncodedOAuth2ClientId: 'Y2xpZW50X2lkPTEwMDc3NTk5NzQ5MDAtZG5vMmxuOGdrZ3Vsdmg2azlvZjdnb2RqZjc3dWU5bG8uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20mY2xpZW50X3NlY3JldD14TG1wbDA1eDBOWjJpSTNZRGc2Yk53Zm8='
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
