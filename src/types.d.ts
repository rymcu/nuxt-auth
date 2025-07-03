export type HttpMethod = 'post' | 'get' | 'patch'
export type CookieSameSite = boolean | 'strict' | 'lax' | 'none' | undefined
export type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading'

export interface AuthEndpoint {
  path: string
  method: string | HttpMethod
}

export interface AuthEndpoints {
  [key: string]: AuthEndpoint
  signIn: AuthEndpoint
  signOut: AuthEndpoint
  signUp: AuthEndpoint
  getSession: AuthEndpoint
  refresh: AuthEndpoint
  google: AuthEndpoint
}

export interface AuthToken {
  tokenPointer: string
  refreshTokenPointer: string
  type: string
  cookieName: string
  headerName: string
  maxAgeInSeconds: number
  sameSiteAttribute: string
  cookieDomain: string
  secureCookieAttribute: boolean
  httpOnlyCookieAttribute: boolean | undefined
  refresh: {
    refreshOnlyToken: boolean
    cookieName: string
    maxAgeInSeconds: number
    requestTokenPointer: string
  }
}

export interface SocialProviderConfig {
  clientId?: string
  redirectUri?: string
  scopes?: string
}

export interface SocialConfig {
  google?: SocialProviderConfig
  [key: string]: SocialProviderConfig | undefined
}

export interface ModuleOptions {
  isEnabled: boolean
  baseUrl: string
  endpoints: AuthEndpoints
  token: AuthToken
  callback: string
  social?: SocialConfig
}

export interface SessionData {
  id?: string | number
  email?: string
  name?: string
  is_verified?: boolean
  roles?: Array<{ slug: string, name: string }>
  [key: string]: any
}

export interface AuthState {
  status: SessionStatus
  data: SessionData | null | undefined
  token: string | null
  refreshToken: string | null
  loading: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    auth?: ModuleOptions
  }

  interface RuntimeConfig {
    public: {
      auth: ModuleOptions
    }
  }
}

declare module 'nuxt/schema' {
  interface NuxtConfig {
    auth?: ModuleOptions
  }
}
