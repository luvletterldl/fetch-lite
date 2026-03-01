import type { Buffer } from 'node:buffer'
import http from 'node:http'

export function createTestServer(handler: http.RequestListener) {
  const port = 10000 + Math.floor(Math.random() * 50000)
  const server = http.createServer(handler)

  return {
    port,
    url: `http://localhost:${port}`,
    start: () => new Promise<void>(resolve => server.listen(port, resolve)),
    close: () => new Promise<void>(resolve => server.close(() => resolve())),
  }
}

export function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function parseRequestBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk: Buffer) => body += chunk.toString('utf-8'))
    req.on('end', () => resolve(body))
  })
}

export function urlEncodedToJSON(urlEncodedData: string) {
  const decodedData = decodeURIComponent(urlEncodedData)
  const keyValuePairs = decodedData.split('&')
  const json: Record<string, string> = {}
  keyValuePairs.forEach((keyValuePair) => {
    const [key, value] = keyValuePair.split('=')
    json[key] = value
  })
  return json
}
