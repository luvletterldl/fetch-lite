import type { BaseFetch, BaseFetchOptions } from './types'
import { ContentType } from './types'
import { convertToFormData, generateContentType, resolveQuery, TypeContent } from './utils'

export class SimpleFetch {
  private config: BaseFetch

  constructor(config?: BaseFetch | undefined) {
    this.config = Object.assign({ baseUrl: '', timeout: 30000 }, config)
  }

  private async resolveOptions(url: RequestInfo | URL, method: 'GET' | 'POST', options?: BaseFetchOptions) {
    const resolvedOptions = {
      method,
      mode: 'cors',
      ...options,
      headers: {
        ...generateContentType(options?.type),
        ...options?.headers,
      },
    } as BaseFetchOptions
    if (typeof this.config?.beforeHook === 'function')
      await this.config.beforeHook(url, resolvedOptions)

    return resolvedOptions
  }

  /** get请求 */
  public async get(url: RequestInfo | URL, options?: BaseFetchOptions) {
    return this.baseFetch(url, await this.resolveOptions(url, 'GET', options))
  }

  /** post请求 */
  public async post(url: RequestInfo | URL, options?: BaseFetchOptions) {
    options = await this.resolveOptions(url, 'POST', options)
    this.postBodyHandler(options)
    return this.baseFetch(url, options)
  }

  /** 通用方法 */
  public async fetch(url: RequestInfo | URL, options?: BaseFetchOptions) {
    if (typeof this.config?.beforeHook === 'function')
      await this.config.beforeHook(url, options)

    return this.baseFetch(url, options)
  }

  /** 处理post的body */
  private postBodyHandler(options?: BaseFetchOptions) {
    if (options?.body) {
      if (!options?.headers) {
        options.headers = {}
      }
      if ((!options?.type || options.type === ContentType.JSON) && typeof options!.body !== 'string') {
        options!.body = JSON.stringify(options!.body)
        Object.assign(options.headers, { 'content-type': TypeContent[ContentType.JSON] })
      }
      if (options?.type === ContentType.FORM_URLENCODED) {
        Object.assign(options.headers, { 'content-type': TypeContent[ContentType.FORM_URLENCODED] })
        if (options.body instanceof FormData) {
          options!.body = new URLSearchParams(options.body as any).toString()
        }
        else if (typeof options.body !== 'string') {
          options!.body = new URLSearchParams(convertToFormData(options.body) as any).toString()
        }
      }
    }
  }

  private async baseFetch(url: RequestInfo | URL, options?: BaseFetchOptions) {
    const { timer, signal } = this.getAbortSignal(options)
    const baseUrl = options?.baseUrl || this.config.baseUrl
    let res: Response
    try {
      res = await fetch(`${baseUrl}${resolveQuery(url, options?.query)}`, { ...options, signal })
    }
    catch (error) {
      const errorText = 'network error'
      res = new Response(errorText, { status: 599, statusText: `${errorText}${error}` })
    }
    if (typeof this.config?.afterHook === 'function')
      res = await this.config.afterHook(url, res)

    if (timer)
      clearTimeout(timer)

    return res
  }

  /** 请求中断signal */
  private getAbortSignal(options: BaseFetchOptions) {
    let signal = options?.signal
    let timer: null | ReturnType<typeof setTimeout> = null
    if (!signal) {
      const ac = new AbortController()
      signal = ac.signal
      timer = setTimeout(() => ac.abort(), options?.timeout || this.config.timeout)
    }
    return { timer, signal }
  }
}
