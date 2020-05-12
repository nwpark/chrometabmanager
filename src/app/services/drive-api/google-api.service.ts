import {Injectable} from '@angular/core';
import {HTTPMethod, HttpRequestBuilder} from '../../../background/types/http-request';
import {UrlBuilder} from '../../../background/types/url-builder';
import {causedByHttp401, mapToRuntimeError} from '../../types/errors/runtime-error';
import {ErrorCode} from '../../types/errors/error-code';
import {environment} from '../../../environments/environment';
import {OAuth2Service} from '../oauth2/o-auth-2.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {

  constructor(private oAuth2Service: OAuth2Service) { }

  @retryOnError()
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

  @retryOnError()
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

  @retryOnError()
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

  @retryOnError()
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
  @retryOnError()
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

function retryOnError(): MethodDecorator {
  return (target: () => void, key: string, descriptor: any) => {
    const originalMethod = descriptor.value;

    descriptor.value =  function(...args: any[]) {
      return Promise.resolve(originalMethod.apply(this, args)).catch(error => {
        if (causedByHttp401(error)) {
          console.warn('AUTHENTICATION ERROR OCCURRED. RETRYING.');
          return this.oAuth2Service.removeCachedAuthToken().then(() => {
            return originalMethod.apply(this, args);
          });
        }
        return Promise.reject(error);
      });
    };

    return descriptor;
  };
}
