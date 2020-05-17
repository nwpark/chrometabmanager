const oAuth2ClientId = '187114739506-rv69kn16rk779jh75ul2pmv1c006d1bi.apps.googleusercontent.com';
const driveAPIScopes = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';

export const environment = {
  production: true,
  backgroundPhoto: {
    author: 'Simon Matzinger',
    url: 'https://www.flickr.com/photos/simonmatzinger/32139955053/in/gallery-152977080@N03-72157681650448265/'
  },

  errorReportEmailAddress: 'nick.wpa+ctm@gmail.com',
  httpRequestTimeoutMillis: 20000,

  /* Non-chrome (firefox) alternatives:
   * https://s2.googleusercontent.com/s2/favicons?domain_url=
   * https://www.google.com/s2/favicons?sz=16&domain_url= */
  favIconUrl: 'chrome://favicon/size/16/',

  driveApiGetAccountInfoUrl: 'https://www.googleapis.com/drive/v3/about?fields=user',
  driveApiGetFileListUrl: 'https://www.googleapis.com/drive/v3/files?fields=files&spaces=appDataFolder&q=name%20%3D%20\'fileName\'',
  driveApiGetFileContentUrl: 'https://www.googleapis.com/drive/v3/files/fileId?alt=media',
  driveApiPostFileContentUrl: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
  driveApiPatchFileContentUrl: 'https://www.googleapis.com/upload/drive/v3/files/fileId?uploadType=media',

  oAuth2TokenUrl: 'https://oauth2.googleapis.com/token',
  urlEncodedOAuth2ClientId: 'Y2xpZW50X2lkPTE4NzExNDczOTUwNi1ydjY5a24xNnJrNzc5amg3NXVsMnBtdjFjMDA2ZDFiaS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSZjbGllbnRfc2VjcmV0PS1XblRwMXhZaFk1cWhnQkcyY1Ywc19VVQ==',
  driveAPIScopes,
  oAuth2WebAuthFlowUrl: `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&access_type=offline&prompt=consent&include_granted_scopes=true&client_id=${oAuth2ClientId}&scope=${driveAPIScopes}`
};
