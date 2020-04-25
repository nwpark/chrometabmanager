import {Injectable} from '@angular/core';
import {HTTPMethod, HttpRequestBuilder} from '../../../background/types/http-request';
import {UrlBuilder} from '../../../background/types/url-builder';
import {OAuth2Service} from './o-auth-2.service';
import {mapToRuntimeError} from '../../types/errors/runtime-error';
import {ErrorCode} from '../../types/errors/error-code';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {

  constructor(private oAuth2Service: OAuth2Service) { }

  requestUserAccountInformation(): Promise<any> {
    return this.oAuth2Service.getAuthToken().then(token => {
      const httpRequest = new HttpRequestBuilder(HTTPMethod.GET, environment.driveApiGetAccountInfoUrl)
        .authorizationHeader(`Bearer ${token}`)
        .responseTypeJSON()
        .build();

      return httpRequest.send()
        .catch(mapToRuntimeError(ErrorCode.RequestUserAccountInfoError));
    });
  }

  searchAppDataFiles(fileName: string): Promise<any> {
    return this.oAuth2Service.getAuthToken().then(token => {
      const url = environment.driveApiGetFileListUrl.replace('fileName', fileName);
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
      const url = environment.driveApiGetFileContentUrl.replace('fileId', fileId);

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
      const url = new UrlBuilder(environment.driveApiPatchFileContentUrl.replace('fileId', fileId))
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
      const url = new UrlBuilder(environment.driveApiPostFileContentUrl)
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
