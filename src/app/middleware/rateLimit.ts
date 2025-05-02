import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

interface RateLimitConfig {
  limit: number
  windowMs: number
}

const ipRequestMap = new Map<
  string,
  { count: number; resetTime: number }
>()

export function rateLimit(config: RateLimitConfig = { limit: 60, windowMs: 60000 }) {
  return async function middleware(request: NextRequest) {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
    const now = Date.now()
    const requestData = ipRequestMap.get(ip)

    if (!requestData || requestData.resetTime < now) {
      ipRequestMap.set(ip, { count: 1, resetTime: now + config.windowMs })
    } else {
      requestData.count++
      if (requestData.count > config.limit) {
        return new NextResponse(JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((requestData.resetTime - now) / 1000).toString()
          }
        })
      }
    }

    return NextResponse.next()
  }
}