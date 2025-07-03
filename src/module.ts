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
    sameSiteAttribute: 'lax',
    cookieDomain: '',
    secureCookieAttribute: false,
    httpOnlyCookieAttribute: false,
    refresh: {
      refreshOnlyToken: true,
      cookieName: 'nuxt-auth.refresh',
      maxAgeInSeconds: 7776000, // 90 days
      requestTokenPointer: '/refresh_token',
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

    // Add utilities

    addImports({
      name: 'authResponseError',
      as: 'authResponseError',
      from: resolver.resolve('./runtime/utils/helper'),
    })

    logger.info(`${MODULE_NAME} initialized with baseUrl: ${moduleOptions.baseUrl}`)
  },
})
