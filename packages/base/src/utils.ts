import type { ContentTypeType } from './types'
import { ContentType } from './types'

export const TypeContent: Readonly<Record<ContentTypeType, string>> = Object.freeze({
  [ContentType.FORM_DATA]: 'multipart/form-data',
  [ContentType.FORM_URLENCODED]: 'application/x-www-form-urlencoded',
  [ContentType.JSON]: 'application/json;charset=utf-8',
})

export function generateContentType(type?: ContentTypeType) {
  if (type && type !== ContentType.FORM_DATA as ContentTypeType && type in ContentType)
    return { 'content-type': TypeContent[type] }
}

/** 对象转换为FormData */
export function convertToFormData(obj: any, formData = new FormData(), namespace = ''): FormData {
  const fd = formData
  for (const property in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (!obj.hasOwnProperty(property))
      continue

    const formKey = namespace ? `${namespace}[${property}]` : property
    if (typeof obj[property] === 'object' && !(obj[property] instanceof File))
      convertToFormData(obj[property], fd, formKey)

    else
      fd.append(formKey, obj[property])
  }
  return fd
}

/** 对象转换QueryString */
export function convertToQueryString(obj: Record<string, any>) {
  const keys = Object.keys(obj)
  const query = keys
    .map(k => [k, obj[k]])
    .filter(([_, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)

  return query.join('&')
}

export function resolveQuery(url: RequestInfo | URL, query?: Record<string, any>) {
  if (query)
    return `${url}${url.toString().includes('?') ? '&' : '?'}${convertToQueryString(query)}`

  return url.toString()
}
