export class HttpRequest {
  constructor(private xmlHttpRequest: XMLHttpRequest,
              private method: string,
              private url: string) {}

  send(body?): Promise<any> {
    console.log(`${new Date().toTimeString().substring(0, 8)} - Sending http request: ${this.method} ${this.url}`);
    return new Promise<any>(resolve => {
      this.xmlHttpRequest.onload = () => {
        console.log(`${new Date().toTimeString().substring(0, 8)} - Received http response: ${this.xmlHttpRequest.status} ${this.xmlHttpRequest.responseURL}`);
        resolve(this.xmlHttpRequest.response);
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
