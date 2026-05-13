import type { AxiosResponseHeaders, RawAxiosRequestHeaders } from 'axios';
import axios from 'axios';

const TIMEOUT_IN_MILLIS = 60000;

type Body = Record<string, unknown> | FormData | object | undefined;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: TIMEOUT_IN_MILLIS,
  headers: { Accept: 'application/json' },
});

export interface Response<T> {
  data: T;
  headers?: AxiosResponseHeaders;
  request: unknown;
}

type QueryParams = Record<string, string | number | boolean>;

interface RequestConfig<B = Body> {
  body?: B;
  params?: QueryParams;
  endpoint: string;
  token?: string;
  signal?: AbortSignal;
  headers?: RawAxiosRequestHeaders;
  timeout?: number;
}

interface DownloadConfig {
  endpoint: string;
}

interface DownloadBlob {
  blob: Blob;
  fileName: string;
}

class AxiosClient {
  get<TResponseData>({
    endpoint,
    ...config
  }: RequestConfig): Promise<Response<TResponseData>> {
    return api.get(endpoint, config);
  }

  post<TResponseData, TBody extends Body>({
    body,
    endpoint,
    ...config
  }: RequestConfig<TBody>): Promise<Response<TResponseData>> {
    return api.post(endpoint, body, config);
  }

  put<TResponseData, TBody extends Body>({
    body,
    endpoint,
    ...config
  }: RequestConfig<TBody>): Promise<TResponseData> {
    return api.put(endpoint, body, config);
  }

  async delete<TBody extends Body, TResponseData = void>({
    endpoint,
    body,
    ...config
  }: RequestConfig<TBody>): Promise<TResponseData> {
    return api.delete(endpoint, {
      data: body,
      ...config,
    });
  }

  patch<TResponseData, TBody extends Body>({
    body,
    endpoint,
    ...config
  }: RequestConfig<TBody>): Promise<TResponseData> {
    return api.patch(endpoint, body, config);
  }

  head<TResponseData>({
    endpoint,
    ...config
  }: RequestConfig): Promise<TResponseData> {
    return api.head(endpoint, config);
  }

  async download({ endpoint }: DownloadConfig): Promise<void> {
    const link = document.createElement('a');
    link.href = endpoint;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  }

  async downloadBlob({ blob, fileName }: DownloadBlob): Promise<void> {
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(url);

    document.body.removeChild(link);
  }
}

export const Client = new AxiosClient();
