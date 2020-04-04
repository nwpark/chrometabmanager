export class HttpRequest {
  constructor(private xmlHttpRequest: XMLHttpRequest) {}

  send(body?): Promise<any> {
    return new Promise<any>(resolve => {
      this.xmlHttpRequest.onload = () => resolve(this.xmlHttpRequest.response);
      this.xmlHttpRequest.send(body);
    });
  }
}

export class HttpRequestBuilder {
  private readonly method: string;
  private readonly url: string;
  private _contentType: string;
  private _authorization: string;
  private _responseType: XMLHttpRequestResponseType;

  constructor(method: HTTPMethod, url: string) {
    this.method = method;
    this.url = url;
  }

  build(): HttpRequest {
    const xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.open(this.method, this.url);
    if (this._contentType) {
      xmlHttpRequest.setRequestHeader('Content-Type', this._contentType);
    }
    if (this._authorization) {
      xmlHttpRequest.setRequestHeader('Authorization', this._authorization);
    }
    xmlHttpRequest.responseType = this._responseType;
    return new HttpRequest(xmlHttpRequest);
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
