import {HTTPMethod, HttpRequestBuilder} from '../types/http-request';
import {UrlBuilder} from '../types/url-builder';

export class DriveApiFileService {

  private readonly DRIVE_API_FILE_GET_MEDIA = 'https://www.googleapis.com/drive/v3/files/fileId?alt=media';
  private readonly DRIVE_API_FILE_POST_MULTIPART = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
  private readonly DRIVE_API_FILE_PATCH_MEDIA = 'https://www.googleapis.com/upload/drive/v3/files/fileId?uploadType=media';

  constructor() { }

  getJSONFileContent(fileId: string): Promise<object> {
    return this.getAuthToken().then(token => {
      const url = this.DRIVE_API_FILE_GET_MEDIA.replace('fileId', fileId);

      const httpRequest = new HttpRequestBuilder(HTTPMethod.GET, url)
        .authorizationHeader(`Bearer ${token}`)
        .responseTypeJSON()
        .build();

      return httpRequest.send();
    });
  }

  updateJSONFileContent(fileId: string, fileContent: object): Promise<object> {
    return this.getAuthToken().then(token => {
      const url = new UrlBuilder(this.DRIVE_API_FILE_PATCH_MEDIA.replace('fileId', fileId))
        .queryParam('access_token', token)
        .build();

      const httpRequest = new HttpRequestBuilder(HTTPMethod.PATCH, url)
        .contentTypeJSON()
        .responseTypeJSON()
        .build();

      return httpRequest.send(JSON.stringify(fileContent));
    });
  }

  createJSONAppDataFile(fileName: string, fileContent: object): Promise<string> {
    return this.getAuthToken().then(token => {
      const url = new UrlBuilder(this.DRIVE_API_FILE_POST_MULTIPART)
        .queryParam('access_token', token)
        .build();

      const httpRequest = new HttpRequestBuilder(HTTPMethod.POST, url)
        .responseTypeJSON()
        .build();

      const body = this.createAppDataRequestBody(fileName, fileContent);

      return httpRequest.send(body)
        .then(response => response.id);
    });
  }

  private createAppDataRequestBody(fileName: string, fileContent: object): FormData {
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: ['appDataFolder'],
    };
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    formData.append('media', new Blob([JSON.stringify(fileContent)], {type: 'application/json'}));
    return formData;
  }

  private getAuthToken(): Promise<string> {
    return new Promise<string>(resolve => {
      chrome.identity.getAuthToken({interactive: false}, resolve);
    });
  }
}
