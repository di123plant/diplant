import * as Sentry from '@sentry/nextjs'
import { env } from '../config/env'
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics'
import { app } from '../config/firebase'

export async function initializeAnalytics() {
  try {
    if (await isSupported()) {
      return getAnalytics(app)
    }
    return null
  } catch (error) {
    console.warn('Analytics not supported in this environment')
    return null
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  try {
    // Only track events in production
    if (env.NODE_ENV === 'production') {
      void initializeAnalytics().then(analytics => {
        if (analytics) {
          logEvent(analytics, eventName, params)
        }
      })
    }
  } catch (error) {
    captureError(error)
  }
}

export function captureError(error: unknown, context?: Record<string, any>) {
  if (env.NODE_ENV === 'production' && env.NEXT_PUBLIC_SENTRY_DSN) {
    const errorInfo = error instanceof Error ? error : new Error(String(error))
    
    Sentry.withScope(scope => {
      if (context) {
        scope.setExtras(context)
      }
      Sentry.captureException(errorInfo)
    })
  } else {
    console.error('Error:', error, '\nContext:', context)
  }
}

export function trackAPIError(error: unknown, endpoint: string, params?: Record<string, any>) {
  captureError(error, {
    type: 'api_error',
    endpoint,
    params,
  })
}

export function trackPerformance(name: string, duration: number) {
  if (env.NODE_ENV === 'production') {
    trackEvent('performance_measure', {
      name,
      duration_ms: Math.round(duration),
    })
  }
}