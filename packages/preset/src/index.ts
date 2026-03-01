/* v8 ignore */
import type { BaseFetch, BaseFetchOptions } from '@fetch-lite/base'
import { SimpleFetch } from '@fetch-lite/base'

export function createStandardFetch(config?: BaseFetch) {
  const f = new SimpleFetch(config)
  return {
    get: <T = Response>(url: RequestInfo | URL, opt?: BaseFetchOptions): Promise<T> => f.get(url, opt) as Promise<T>,
    post: <T = Response>(url: RequestInfo | URL, opt?: BaseFetchOptions): Promise<T> => f.post(url, opt) as Promise<T>,
    fetch: <T = Response>(url: RequestInfo | URL, opt?: BaseFetchOptions): Promise<T> => f.fetch(url, opt) as Promise<T>,
  }
}
