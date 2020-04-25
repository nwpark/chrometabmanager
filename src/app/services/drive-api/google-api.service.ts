import {Injectable} from '@angular/core';
import {HTTPMethod, HttpRequestBuilder} from '../../../background/types/http-request';
import {UrlBuilder} from '../../../background/types/url-builder';
import {OAuth2Service} from './o-auth-2.service';
import {mapToRuntimeError} from '../../types/errors/runtime-error';
import {ErrorCode} from '../../types/errors/error-code';

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {

  private readonly DRIVE_API_ABOUT_GET = 'https://www.googleapis.com/drive/v3/about?fields=user';
  private readonly DRIVE_API_FILE_GET_MEDIA = 'https://www.googleapis.com/drive/v3/files/fileId?alt=media';
  private readonly DRIVE_API_FILE_LIST = 'https://www.googleapis.com/drive/v3/files?fields=files&spaces=appDataFolder&q=name%20%3D%20\'fileName\'';
  private readonly DRIVE_API_FILE_POST_MULTIPART = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id';
  private readonly DRIVE_API_FILE_PATCH_MEDIA = 'https://www.googleapis.com/upload/drive/v3/files/fileId?uploadType=meda';

  constructor(private oAuth2Service: OAuth2Service) { }

  requestUserAccountInformation(): Promise<any> {
    return this.oAuth2Service.getAuthToken().then(token => {
      const httpRequest = new HttpRequestBuilder(HTTPMethod.GET, this.DRIVE_API_ABOUT_GET)
        .authorizationHeader(`Bearer ${token}`)
        .responseTypeJSON()
        .build();

      return httpRequest.send()
        .catch(mapToRuntimeError(ErrorCode.RequestUserAccountInfoError));
    });
  }

  searchAppDataFiles(fileName: string): Promise<any> {
    return this.oAuth2Service.getAuthToken().then(token => {
      const url = this.DRIVE_API_FILE_LIST.replace('fileName', fileName);
      const httpRequest = new HttpRequestBuilder(HTTPMethod.GET, url)
        .authorizationHeader(`Bearer ${token}`)
        .responseTypeJSON()
        .build();

      return httpRequest.send().then(res => res.files[0])
        .catch(mapToRuntimeError(ErrorCode.SearchAppDataFilesError));
    });
  }

  requestJSONFileContent(fileId: string): Promise<any> {
    return this.oAuth2Service.getAuthToken().then(token => {
      const url = this.DRIVE_API_FILE_GET_MEDIA.replace('fileId', fileId);

      const httpRequest = new HttpRequestBuilder(HTTPMethod.GET, url)
        .authorizationHeader(`Bearer ${token}`)
        .responseTypeJSON()
        .build();

      return httpRequest.send()
        .catch(mapToRuntimeError(ErrorCode.RequestJSONFileContentError));
    });
  }

  patchJSONFileContent(fileId: string, fileContent: any): Promise<any> {
    return this.oAuth2Service.getAuthToken().then(token => {
      const url = new UrlBuilder(this.DRIVE_API_FILE_PATCH_MEDIA.replace('fileId', fileId))
        .queryParam('access_token', token)
        .build();

      const httpRequest = new HttpRequestBuilder(HTTPMethod.PATCH, url)
        .contentTypeJSON()
        .responseTypeJSON()
        .build();

      return httpRequest.send(JSON.stringify(fileContent))
        .catch(mapToRuntimeError(ErrorCode.PatchJSONFileContentError));
    });
  }

  // Returns metadata for newly created file
  postJSONAppDataFile(fileName: string, fileContent: any): Promise<any> {
    return this.oAuth2Service.getAuthToken().then(token => {
      const url = new UrlBuilder(this.DRIVE_API_FILE_POST_MULTIPART)
        .queryParam('access_token', token)
        .build();

      const httpRequest = new HttpRequestBuilder(HTTPMethod.POST, url)
        .responseTypeJSON()
        .build();

      const body = this.createAppDataRequestBody(fileName, fileContent);

      return httpRequest.send(body)
        .catch(mapToRuntimeError(ErrorCode.PostJSONFileContentError));
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
}
