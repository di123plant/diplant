import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Enable tunneling for secure communication
  tunnel: '/api/tunnel',
  // Set environment
  environment: process.env.NODE_ENV,
  // Adjust this value in production
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})