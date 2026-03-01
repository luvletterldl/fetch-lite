import type { BaseFetchOptions } from '@fetch-lite/base'
import { ContentType, SimpleFetch } from '@fetch-lite/base'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestServer, parseRequestBody } from '../helpers'

describe('simpleFetch', () => {
  let server: ReturnType<typeof createTestServer>

  afterEach(async () => {
    await server?.close()
  })

  it('config', () => {
    const sf = new SimpleFetch()
    expect(sf).toHaveProperty('config')
  })

  it('text', async () => {
    server = createTestServer((req, res) => res.end(`${req.url}`))
    await server.start()

    const sf = new SimpleFetch({ baseUrl: server.url })
    const res = await sf.get('/abc/')
    const result = await res.text()
    expect(result).toBe('/abc/')
  })

  it('json', async () => {
    server = createTestServer(async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      const { searchParams } = new URL(req.url!, server.url)
      const query = searchParams.toString()
      const result: Record<string, unknown> = { url: req.url, ok: true }

      if (query) {
        Object.assign(result, { query })
      }

      if (req.method === 'POST') {
        const reqBody = await parseRequestBody(req)
        Object.assign(result, { reqBody: JSON.parse(reqBody) })
        res.end(JSON.stringify(result))
      }
      else {
        res.end(JSON.stringify(result))
      }
    })
    await server.start()

    const sf = new SimpleFetch({
      beforeHook: async (_: URL | RequestInfo, options?: BaseFetchOptions) => {
        if (options?.method === 'GET') {
          options!.query = { ...options?.query as Record<string, unknown>, commonQuery: 1 }
        }
        if (options?.method === 'POST') {
          options!.body = { ...options?.body as Record<string, unknown>, commonBody: 1 }
        }
      },
    })

    const res = await sf.get(`${server.url}/abc/`)
    const result = await res.json()
    expect(result).toMatchInlineSnapshot(`
      {
        "ok": true,
        "query": "commonQuery=1",
        "url": "/abc/?commonQuery=1",
      }
    `)

    const postRes = await sf.post(`${server.url}/abc/?c=3`, { type: ContentType.JSON, query: { b: 2 }, body: { a: 1 } })
    const postResult = await postRes.json()
    expect(postResult).toMatchInlineSnapshot(`
      {
        "ok": true,
        "query": "c=3&b=2",
        "reqBody": {
          "a": 1,
          "commonBody": 1,
        },
        "url": "/abc/?c=3&b=2",
      }
    `)

    const baseFetch = await sf.fetch(`${server.url}/abc/`)
    const result1 = await baseFetch.json()
    expect(result1).toMatchInlineSnapshot(`
      {
        "ok": true,
        "url": "/abc/",
      }
    `)
  })

  it('formData', async () => {
    server = createTestServer(async (req, res) => {
      if (req.url === '/') {
        const reqBody = await parseRequestBody(req)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ reqBody: decodeURIComponent(reqBody) }))
      }
    })
    await server.start()

    const sf = new SimpleFetch()

    const fd = new FormData()
    fd.append('a', '1')
    fd.append('b', '中文🀄️')
    const res = await sf.post(server.url, { body: fd, type: ContentType.FORM_URLENCODED })
    const result = await res.json()
    expect(result).toMatchInlineSnapshot(`
      {
        "reqBody": "a=1&b=中文🀄️",
      }
    `)

    const res1 = await sf.post(server.url, { body: { c: 1, d: '中文⏰' }, type: ContentType.FORM_URLENCODED })
    const result1 = await res1.json()
    expect(result1).toMatchInlineSnapshot(`
      {
        "reqBody": "c=1&d=中文⏰",
      }
    `)

    const res2 = await sf.post('error-url', { body: fd, type: ContentType.FORM_URLENCODED })
    expect(res2.ok).toBe(false)
    expect(res2.status).toBe(599)
    expect(res2.statusText).toContain('network error')
  })

  it('empty body post', async () => {
    server = createTestServer(async (req, res) => {
      const reqBody = await parseRequestBody(req)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ method: req.method, bodyLength: reqBody.length }))
    })
    await server.start()

    const sf = new SimpleFetch()
    const res = await sf.post(server.url, {})
    const result = await res.json()
    expect(result.method).toBe('POST')
  })

  it('error status codes', async () => {
    server = createTestServer((req, res) => {
      const { pathname } = new URL(req.url!, server.url)
      if (pathname === '/404') {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
      }
      else if (pathname === '/500') {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
      }
    })
    await server.start()

    const sf = new SimpleFetch({ baseUrl: server.url })

    const res404 = await sf.get('/404')
    expect(res404.status).toBe(404)
    expect(res404.ok).toBe(false)

    const res500 = await sf.get('/500')
    expect(res500.status).toBe(500)
    expect(res500.ok).toBe(false)
  })
})
