export const environment = {
  production: true,
  backgroundPhoto: {
    author: 'Aditya Jagtiani',
    url: 'https://www.flickr.com/photos/164512945@N03/47351470081/in/photosof-152977080@N03/'
  },
  errorReportEmailAddress: 'nick.wpa+ctm@gmail.com',
  httpRequestTimeoutMillis: 20000,
  driveApiGetAccountInfoUrl: 'https://www.googleapis.com/drive/v3/about?fields=user',
  driveApiGetFileListUrl: 'https://www.googleapis.com/drive/v3/files?fields=files&spaces=appDataFolder&q=name%20%3D%20\'fileName\'',
  driveApiGetFileContentUrl: 'https://www.googleapis.com/drive/v3/files/fileId?alt=media',
  driveApiPostFileContentUrl: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
  driveApiPatchFileContentUrl: 'https://www.googleapis.com/upload/drive/v3/files/fileId?uploadType=media',
  chromeLoginUrl: 'https://accounts.google.com/',
  accountsApiRevokeTokenUrl: 'https://oauth2.googleapis.com/revoke?token=AUTH_TOKEN' // Alternative url: https://accounts.google.com/o/oauth2/revoke?token=AUTH_TOKEN
};
