import { defineNuxtModule, addPlugin, addServerHandler, createResolver, addImports, useLogger } from '@nuxt/kit'
import { defu } from 'defu'
import type { ModuleOptions } from './types'

// Default configuration
const defaultOptions: ModuleOptions = {
  isEnabled: true,
  baseUrl: '/',
  callback: '/dashboard',
  endpoints: {
    signIn: { path: '/login', method: 'post' },
    signOut: { path: '/logout', method: 'post' },
    signUp: { path: '/register', method: 'post' },
    getSession: { path: '/session', method: 'get' },
    refresh: { path: '/refresh', method: 'post' },
    google: { path: '/google', method: 'post' },
  },
  token: {
    tokenPointer: '/access_token',
    refreshTokenPointer: '/refresh_token',
    type: 'Bearer',
    cookieName: 'nuxt-auth.token',
    headerName: 'Authorization',
    maxAgeInSeconds: 86400, // 1 day
    sameSiteAttribute: 'strict',
    cookieDomain: '',
    secureCookieAttribute: true,
    httpOnlyCookieAttribute: true,
    refresh: {
      refreshOnlyToken: true,
      cookieName: 'nuxt-auth.refresh',
      maxAgeInSeconds: 7776000, // 90 days
      requestTokenPointer: '/refresh_token',
      sameSiteAttribute: 'strict',
      secureCookieAttribute: true,
      httpOnlyCookieAttribute: true,
    },
  },
  social: {
    google: {
      clientId: '',
      redirectUri: '',
      scopes: 'openid profile email',
    },
  },
}

const MODULE_NAME = 'andychukse-nuxt-auth'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: 'auth',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: defaultOptions,
  setup(options: ModuleOptions, nuxt: any) {
    const resolver = createResolver(import.meta.url)

    const logger = useLogger(MODULE_NAME)

    // Skip if module is disabled
    if (!options.isEnabled) {
      return
    }

    // Use module options directly (no appConfig merging)
    const moduleOptions: ModuleOptions = { ...defu(options, defaultOptions) }

    // Add module options to runtime config
    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || { public: {} }
    nuxt.options.runtimeConfig.public.auth = moduleOptions
    // logger.info('Module options:', moduleOptions)

    // Add the auth plugin
    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      mode: 'all',
    })

    // Add the useAuth composable
    addImports({
      name: 'useAuth',
      as: 'useAuth',
      from: resolver.resolve('./runtime/composables/useAuth'),
    })

    // Add middleware
    nuxt.hook('app:resolve', (app: any) => {
      app.middleware.push({
        name: 'auth',
        path: resolver.resolve('./runtime/middleware/auth'),
        global: false,
      })

      app.middleware.push({
        name: 'guest',
        path: resolver.resolve('./runtime/middleware/guest'),
        global: false,
      })
    })

    // Add server handlers for social authentication
    addServerHandler({
      route: '/auth/google/callback',
      handler: resolver.resolve('./runtime/server/routes/auth/google/callback/index.get'),
    })

    // Add server handlers for refreshing tokens
    addServerHandler({
      route: '/api/auth/token/refresh',
      handler: resolver.resolve('./runtime/server/api/auth/token/refresh.post'),
    })

    // Add server handlers for setting refresh tokens
    addServerHandler({
      route: '/api/auth/token/set-token',
      handler: resolver.resolve('./runtime/server/api/auth/token/set-token.post'),
    })

    // Add server handlers for setting getting access token
    addServerHandler({
      route: '/api/auth/token/get-token',
      handler: resolver.resolve('./runtime/server/api/auth/token/get-token.post'),
    })

    // Add server handlers for setting clearing tokens
    addServerHandler({
      route: '/api/auth/token/clear-token',
      handler: resolver.resolve('./runtime/server/api/auth/token/clear-token.post'),
    })

    // Add utilities

    addImports({
      name: 'authResponseError',
      as: 'authResponseError',
      from: resolver.resolve('./runtime/utils/helper'),
    })

    logger.info(`${MODULE_NAME} initialized with baseUrl: ${moduleOptions.baseUrl}`)
  },
})
