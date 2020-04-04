export class UrlBuilder {

  private readonly url: string;
  private queryParams: {[name: string]: string};

  constructor(url: string) {
    this.url = url;
    this.queryParams = {};
  }

  build(): string {
    const url = new URL(this.url);
    Object.entries(this.queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return url.href;
  }

  queryParam(name: string, value: string): UrlBuilder {
    this.queryParams[name] = value;
    return this;
  }
}
