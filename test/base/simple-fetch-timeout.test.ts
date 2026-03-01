import { SimpleFetch } from '@fetch-lite/base'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestServer, sleep } from '../helpers'

describe('simpleFetch timeout', () => {
  let server: ReturnType<typeof createTestServer>

  afterEach(async () => {
    await server?.close()
  })

  it('request timeout', async () => {
    server = createTestServer(async (_, res) => {
      await sleep(200)
      res.end('ok')
    })
    await server.start()

    const sf = new SimpleFetch({ baseUrl: server.url, timeout: 100 })
    const start = Date.now()
    const res = await sf.get('')
    const result = await res.text()
    const duration = Date.now() - start

    expect(duration).toBeGreaterThanOrEqual(100)
    expect(duration).toBeLessThan(200)
    expect(result).toBe('network error')
  })

  it('request success within timeout', async () => {
    server = createTestServer(async (_, res) => {
      await sleep(50)
      res.end('ok')
    })
    await server.start()

    const sf = new SimpleFetch({ baseUrl: server.url, timeout: 200 })
    const res = await sf.get('')
    const result = await res.text()

    expect(result).toBe('ok')
  })

  it('custom timeout per request', async () => {
    server = createTestServer(async (_, res) => {
      await sleep(150)
      res.end('ok')
    })
    await server.start()

    const sf = new SimpleFetch({ baseUrl: server.url, timeout: 300 })

    // 使用请求级别的 timeout 覆盖全局配置
    const res = await sf.get('', { timeout: 50 })
    expect(await res.text()).toBe('network error')

    // 全局 timeout 足够长
    const res2 = await sf.get('')
    expect(await res2.text()).toBe('ok')
  })
})
