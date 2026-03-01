/** 扩展默认fetch参数 */
export type BaseFetchOptions = Omit<RequestInit, 'body'> & {
  timeout?: number
  baseUrl?: string
  query?: any
  type?: ContentTypeType
  body?: any
} | undefined

export interface BaseFetch {
  /** baseUrl */
  baseUrl?: string
  /** 请求过期时间 单位 ms */
  timeout?: number
  /** 请求前hook，可以做参数合法性校验、参数预处理等 */
  beforeHook?: (url: RequestInfo | URL, options?: BaseFetchOptions) => Promise<any>
  /** 响应后hook，可以对响应数据做兜底操作或预处理 */
  afterHook?: (url: RequestInfo | URL, response?: Response) => Promise<any>
}

/** 支持的content-type */
export const ContentType = {
  FORM_DATA: 0,
  FORM_URLENCODED: 1,
  JSON: 2,
} as const

export type ContentTypeType = (typeof ContentType)[keyof typeof ContentType]
