import { ContentType } from '@fetch-lite/base'
import { createStandardFetch } from '@fetch-lite/preset'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestServer, parseRequestBody, urlEncodedToJSON } from '../helpers'

describe('standard preset json', () => {
  let server: ReturnType<typeof createTestServer>

  afterEach(async () => {
    await server?.close()
  })

  it('standard fetch json', async () => {
    server = createTestServer(async (req, res) => {
      const { pathname, searchParams } = new URL(req.url!, server.url)
      const query = searchParams.toString()
      const result: Record<string, unknown> = { a: 1 }

      if (query) {
        Object.assign(result, { query: decodeURIComponent(query), pathname })
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })

      if (req.method === 'POST') {
        const reqBody = await parseRequestBody(req)
        res.end(JSON.stringify({ ...JSON.parse(reqBody), ...result }))
      }
      else {
        res.end(JSON.stringify(result))
      }
    })
    await server.start()

    const sf = createStandardFetch()
    const res = await sf.get(server.url, { query: { c: 0, q: '中文' } })
    const jsonData = await res.json()
    expect(jsonData).toMatchInlineSnapshot(`
      {
        "a": 1,
        "pathname": "/",
        "query": "c=0&q=中文",
      }
    `)
  })

  it('standard fetch post json', async () => {
    server = createTestServer(async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      const reqBody = await parseRequestBody(req)
      res.end(JSON.stringify({ received: JSON.parse(reqBody) }))
    })
    await server.start()

    const sf = createStandardFetch()
    const res = await sf.post(server.url, { body: { name: 'test', value: 123 } })
    const jsonData = await res.json()
    expect(jsonData.received).toEqual({ name: 'test', value: 123 })
  })
})

describe('standard preset form-urlencoded', () => {
  let server: ReturnType<typeof createTestServer>

  afterEach(async () => {
    await server?.close()
  })

  it('createStandardFetch formData', async () => {
    server = createTestServer(async (req, res) => {
      const result = { a: 1 }

      if (req.method === 'POST') {
        const reqBody = await parseRequestBody(req)
        expect(reqBody).toBe('b=2')
        const parsed = urlEncodedToJSON(reqBody)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ...parsed, ...result }))
      }
      else {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
      }
    })
    await server.start()

    const sf = createStandardFetch()
    const res = await sf.post(server.url, { type: ContentType.FORM_URLENCODED, body: { b: 2 } })
    const jsonData = await res.json()
    expect(jsonData).toMatchInlineSnapshot(`
      {
        "a": 1,
        "b": "2",
      }
    `)
  })

  it('createStandardFetch with chinese characters', async () => {
    server = createTestServer(async (req, res) => {
      const reqBody = await parseRequestBody(req)
      const parsed = urlEncodedToJSON(reqBody)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(parsed))
    })
    await server.start()

    const sf = createStandardFetch()
    const res = await sf.post(server.url, { type: ContentType.FORM_URLENCODED, body: { msg: '你好世界' } })
    const jsonData = await res.json()
    expect(jsonData.msg).toBe('你好世界')
  })
})
