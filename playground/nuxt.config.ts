import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2025-01-01',
  auth: {
    isEnabled: true,
    baseUrl: '/api/auth',
    callback: '/',
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
      cookieName: 'playground.auth.token',
      headerName: 'Authorization',
      maxAgeInSeconds: 86400, // 1 day
      sameSiteAttribute: 'lax',
      cookieDomain: '',
      secureCookieAttribute: false,
      httpOnlyCookieAttribute: false,
      refresh: {
        refreshOnlyToken: true,
        cookieName: 'playground.auth.refresh',
        maxAgeInSeconds: 7776000, // 90 days
        requestTokenPointer: '/refresh_token',
      },
    },
    social: {
      google: {
        clientId: 'your-google-client-id.googleusercontent.com',
        redirectUri: 'http://localhost:3000/auth/google/callback',
        scopes: 'openid profile email',
      },
    },
  },
})
