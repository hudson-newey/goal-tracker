export type EmptyResponse = null | undefined | {};

export interface ApiHttpResponse<T> {
  data: T;
  message: string;
}

export interface HttpResponse {}
