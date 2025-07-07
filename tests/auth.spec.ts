import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../src/runtime/composables/useAuth'

const stateStore: Record<string, any> = {}
const cookieStore: Record<string, any> = {}

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    public: {
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
          cookieName: 'auth.token',
          headerName: 'Authorization',
          maxAgeInSeconds: 86400,
          sameSiteAttribute: 'lax',
          cookieDomain: '',
          secureCookieAttribute: false,
          httpOnlyCookieAttribute: true,
          refresh: {
            refreshOnlyToken: true,
            cookieName: 'auth.refresh',
            maxAgeInSeconds: 7776000,
            requestTokenPointer: '/refresh_token',
            sameSiteAttribute: 'lax',
            secureCookieAttribute: false,
            httpOnlyCookieAttribute: true,
          },
        },
        social: {
          google: {
            clientId: 'test-client-id',
            redirectUri: 'http://localhost:3000/auth/google/callback',
            scopes: ['openid', 'profile', 'email'],
          },
        },
      },
    },
  }),
  useState: vi.fn((key, init) => {
    if (!(key in stateStore)) {
      stateStore[key] = { value: init ? init() : undefined }
    }
    return stateStore[key]
  }),
  computed: (fn: any) => ({ get value() { return fn() } }),
  ref: (value: any) => ({ value }),
  watch: vi.fn(),
  useCookie: vi.fn((key) => {
    if (!(key in cookieStore)) {
      cookieStore[key] = { value: null }
    }
    return cookieStore[key]
  }),
  navigateTo: vi.fn(),
  useRequestFetch: vi.fn(() => globalThis.$fetch),
  useRequestEvent: vi.fn(() => null),
}))

vi.mock('h3', () => ({
  setCookie: vi.fn(),
  getCookie: vi.fn(() => null),
  useRequestEvent: vi.fn(() => null),
}))

globalThis.$fetch = Object.assign(
  async (request: string, opts?: any) => {
    const url = String(request)
    const method = opts?.method?.toLowerCase() || 'get'

    if (url.includes('/login') && method === 'post') {
      return {
        access_token: 'token',
        refresh_token: 'refresh',
        user: { name: 'Test User', email: 'test@example.com' },
      }
    }

    if (url.includes('/register') && method === 'post') {
      return {
        access_token: 'token',
        refresh_token: 'refresh',
        user: { name: 'New User', email: 'new@example.com' },
      }
    }

    if (url.includes('/session') && method === 'get') {
      return { name: 'Test User', email: 'test@example.com' }
    }

    if (url.includes('/logout') && method === 'post') {
      return { success: true }
    }

    if (url.includes('/api/auth/google') && method === 'post') {
      return {
        access_token: 'token',
        refresh_token: 'refresh',
        user: { name: 'Test User', email: 'test@example.com' },
      }
    }

    if (url.includes('/api/auth/token/set-token') && method === 'post') {
      return { success: true }
    }

    if (url.includes('/api/auth/token/clear-token') && method === 'post') {
      return { success: true }
    }

    if (url.includes('/api/auth/token/refresh') && method === 'post') {
      return {
        success: true,
        access_token: 'new-token',
        refresh_token: 'new-refresh',
      }
    }

    throw new Error(`Unhandled URL: ${url} with method: ${method}`)
  },
  {
    raw: async (request: string, opts: any) => {
      const result = await globalThis.$fetch(request, opts)
      return { ok: true, _data: result, status: 200 }
    },
    create: () => globalThis.$fetch,
  },
) as any

describe('useAuth composable', () => {
  let auth: ReturnType<typeof useAuth>

  beforeEach(() => {
    Object.keys(stateStore).forEach(key => delete stateStore[key])
    Object.keys(cookieStore).forEach(key => delete cookieStore[key])
    vi.clearAllMocks()
    
    auth = useAuth()
  })

  it('should have unauthenticated status by default', () => {
    expect(auth.status.value).toBe('unauthenticated')
  })

  it('should sign in a user', async () => {
    await auth.signIn({ email: 'test@example.com', password: 'password' })

    expect(auth.data.value).toMatchObject({ name: 'Test User', email: 'test@example.com' })
    expect(auth.token.value).toBe('token')
    expect(auth.status.value).toBe('authenticated')
  })

  it('should sign up a user', async () => {
    await auth.signUp({ name: 'New User', email: 'new@example.com', password: 'password' })

    expect(auth.data.value).toMatchObject({ name: 'New User', email: 'new@example.com' })
    expect(auth.token.value).toBe('token')
    expect(auth.status.value).toBe('authenticated')
  })

  it('should clear tokens on signOut', async () => {
    await auth.signIn({ email: 'test@example.com', password: 'password' })
    await auth.signOut()

    expect(auth.token.value).toBe(null)
    expect(auth.data.value).toBe(null)
    expect(auth.status.value).toBe('unauthenticated')
  })

  it('should handle social login', async () => {
    await auth.signInWithSocial('google', { code: 'test-code' })

    expect(auth.data.value).toMatchObject({ name: 'Test User', email: 'test@example.com' })
    expect(auth.token.value).toBe('token')
    expect(auth.status.value).toBe('authenticated')
  })
})
