import {getCurrentTimeStringWithMillis} from '../../app/utils/date-utils';
import {ErrorCode} from '../../app/types/errors/error-code';
import {XHRError} from '../../app/types/errors/runtime-error';
import {environment} from '../../environments/environment';

export class HttpRequest {
  constructor(private xmlHttpRequest: XMLHttpRequest,
              private method: string,
              private url: string) {}

  send(body?): Promise<any> {
    console.log(`${getCurrentTimeStringWithMillis()} - Sending http request: ${this.method} ${this.url}`);
    return new Promise<any>((resolve, reject) => {
      this.xmlHttpRequest.onload = () => {
        console.log(`${getCurrentTimeStringWithMillis()} - Received http response: ${this.xmlHttpRequest.status} ${this.xmlHttpRequest.responseURL}`);
        if (this.xmlHttpRequest.status >= 400) {
          reject(new XHRError(ErrorCode.HttpRequestError, this.xmlHttpRequest));
        } else {
          resolve(this.xmlHttpRequest.response);
        }
      };
      this.xmlHttpRequest.onerror = () => {
        reject(new XHRError(ErrorCode.HttpRequestUnknownError, this.xmlHttpRequest));
      };
      this.xmlHttpRequest.ontimeout = () => {
        reject(new XHRError(ErrorCode.HttpRequestTimeout, this.xmlHttpRequest));
      };
      this.xmlHttpRequest.send(body);
    });
  }
}

export class HttpRequestBuilder {
  private _contentType: string;
  private _authorization: string;
  private _responseType: XMLHttpRequestResponseType;

  constructor(private method: HTTPMethod,
              private url: string) { }

  build(): HttpRequest {
    const xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.open(this.method, this.url);
    if (this._contentType) {
      xmlHttpRequest.setRequestHeader('Content-Type', this._contentType);
    }
    if (this._authorization) {
      xmlHttpRequest.setRequestHeader('Authorization', this._authorization);
    }
    if (this._responseType) {
      xmlHttpRequest.responseType = this._responseType;
    }
    xmlHttpRequest.timeout = environment.httpRequestTimeoutMillis;
    return new HttpRequest(xmlHttpRequest, this.method, this.url);
  }

  contentTypeJSON(): HttpRequestBuilder {
    this._contentType = 'application/json';
    return this;
  }

  responseTypeJSON(): HttpRequestBuilder {
    this._responseType = 'json';
    return this;
  }

  authorizationHeader(authorization: string): HttpRequestBuilder {
    this._authorization = authorization;
    return this;
  }
}

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH'
}
