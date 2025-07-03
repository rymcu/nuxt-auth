import type { CookieSameSite, ModuleOptions, SessionData, SessionStatus } from '../../types'
import { authResponseError, extractByPointer } from '../utils/helper'
import { useRuntimeConfig, useState, computed, watch, useCookie, navigateTo } from '#imports'
import type { CookieRef } from '#app'

export function useAuth() {
  const runConfig = useRuntimeConfig()
  const config: ModuleOptions = runConfig.public.auth as ModuleOptions
  const data = useState<SessionData | undefined | null>('auth:data', () => undefined)

  const cookieName = config?.token?.cookieName ?? 'nuxt.auth'
  const secureCookie = config?.token?.secureCookieAttribute ?? true
  const httpOnly = config?.token?.httpOnlyCookieAttribute ?? true
  const expireTokenInSeconds = config?.token?.maxAgeInSeconds ?? 1800
  const sameSite = config?.token?.sameSiteAttribute ?? 'strict'
  const expireRefreshTokenInSeconds = config?.token?.refresh?.maxAgeInSeconds ?? 7200
  const refreshCookieName = config?.token?.refresh?.cookieName ?? 'nuxt.refresh-auth'

  const apiBase = config?.baseUrl

  const loading = useState<boolean>('auth:loading', () => false)

  const status = computed<SessionStatus>(() => {
    if (loading.value) {
      return 'loading'
    }
    if (data.value) {
      return 'authenticated'
    }
    return 'unauthenticated'
  })

  const defaultCallback = config?.callback ?? '/'

  const tokenCookie = useCookie(cookieName, {
    expires: new Date(Date.now() + (expireTokenInSeconds * 1000)),
    sameSite: sameSite as CookieSameSite,
    httpOnly: httpOnly,
    secure: secureCookie,
  })

  const refreshTokenCookie: CookieRef<string | null | undefined> = useCookie(refreshCookieName, {
    expires: new Date(Date.now() + (expireRefreshTokenInSeconds * 1000)),
    sameSite: sameSite as CookieSameSite,
    httpOnly: httpOnly,
    secure: secureCookie,
  })

  const rawToken = useState('auth:raw-token', () => (tokenCookie as any).value || null)
  const rawRefreshToken = useState('auth:raw-refresh-token', () => (refreshTokenCookie as any).value || null)

  watch(rawToken, () => {
    tokenCookie.value = rawToken.value
  })

  watch(rawRefreshToken, () => {
    refreshTokenCookie.value = rawRefreshToken.value
  })

  const token = computed(() => rawToken.value)
  const refreshToken = computed(() => rawRefreshToken.value)

  const setTokens = (tokens: unknown) => {
    rawToken.value = extractByPointer(tokens, config?.token?.tokenPointer)
    rawRefreshToken.value = extractByPointer(tokens, config?.token?.refreshTokenPointer)
  }

  const clearTokens = () => {
    rawToken.value = null
    rawRefreshToken.value = null
    tokenCookie.value = null
    refreshTokenCookie.value = null
  }

  const fetchApi = async (
    url: string | (() => string),
    options: {
      method: string | any
      headers: object
      body?: any
    },
  ) => {
    try {
      return await $fetch.raw(apiBase + url, {
        ...options,
        headers: {
          ...options?.headers,
        },
      })
    }
    catch (error: any) {
      console.error('API Error:', {
        error: error,
      })
      return error
    }
  }

  const fetchUser = async () => {
    if (!token?.value) {
      loading.value = false
      return
    }

    try {
      const url = config.endpoints?.getSession?.path

      const response = await fetchApi(
        url,
        {
          method: config.endpoints?.getSession?.method,
          headers: {
            Authorization: `Bearer ${token?.value}`,
          },
        },
      )

      if (response?.ok && response?._data) {
        data.value = response._data
      }
      else {
        if (response.status === 401) {
          await refreshAuthToken()
          return await fetchUser()
        }

        data.value = null
      }
    }
    catch (error: any) {
      const errorMessage = authResponseError(error)
      data.value = null
      throw new Error(errorMessage)
    }
    finally {
      loading.value = false
    }
  }

  const getSession = async () => {
    loading.value = true
    await fetchUser()
  }

  const signUp = async (userData: any, { callbackUrl }: { callbackUrl?: string } = {}) => {
    const url = config.endpoints?.signUp?.path

    const response: any = await fetchApi(
      url,
      {
        method: config.endpoints?.signUp?.method,
        headers: {},
        body: userData,
      },
    )

    if (response?.ok && response?._data) {
      setTokens(response._data)

      if (response._data?.user) {
        data.value = response._data?.user
      }
      else {
        await fetchUser()
      }

      // Navigate to callback URL if provided, otherwise to default callback
      if (callbackUrl) {
        return await navigateTo(callbackUrl)
      }
      else {
        return await navigateTo(defaultCallback)
      }
    }
    else {
      const error = authResponseError(response)
      throw new Error(error)
    }
  }

  const signIn = async (loginData: any, { callbackUrl }: { callbackUrl?: string } = {}) => {
    const url = config.endpoints?.signIn?.path

    const response: any = await fetchApi(
      url,
      {
        method: config.endpoints?.signIn?.method,
        headers: {},
        body: loginData,
      },
    )

    if (response?.ok && response?._data) {
      setTokens(response._data)

      await fetchUser()

      if (callbackUrl) {
        return await navigateTo(callbackUrl)
      }
      else {
        return await navigateTo(defaultCallback)
      }
    }
    else {
      const error = authResponseError(response)
      throw new Error(error)
    }
  }

  const signInWithSocial = async (provider: string, params: any, { callbackUrl }: { callbackUrl?: string } = {}) => {
    const url = config.endpoints?.[provider]?.path

    const response: any = await fetchApi(
      url,
      {
        method: config.endpoints?.[provider]?.method,
        headers: {},
        body: params,
      },
    )

    if (response?.ok && response?._data) {
      setTokens(response._data)
      if (response._data?.user) {
        data.value = response._data?.user
      }
      else {
        await fetchUser()
      }

      if (callbackUrl) {
        await navigateTo(callbackUrl)
      }
      else {
        await navigateTo(defaultCallback)
      }
    }
    else {
      const error = authResponseError(response)
      throw new Error(error)
    }
  }

  // Enhanced social login with built-in OAuth flow handling
  const initiateSocialLogin = async (provider: string, options: {
    callbackUrl?: string
    clientId?: string
    redirectUri?: string
    scopes?: string
    state?: string
    callbackPage?: string // New option to specify which page handles the OAuth callback
  } = {}) => {
    if (provider !== 'google') {
      throw new Error(`Provider ${provider} is not supported`)
    }

    // Generate state for CSRF protection if not provided
    const state = options.state || generateRandomState()

    // Store state and callback info for later use
    if (import.meta.client) {
      localStorage.setItem('oauth_state', state)
      if (options.callbackUrl) {
        localStorage.setItem('oauth_callback', options.callbackUrl)
      }

      // Set socialRedirect cookie for server-side callback handling
      if (options.callbackPage) {
        // Remove leading slash if present to match the server route expectation
        const callbackPage = options.callbackPage.replace(/^\//, '')
        const socialRedirectCookie = useCookie('socialRedirect')
        socialRedirectCookie.value = callbackPage
      }
    }

    // Build OAuth URL based on provider
    const authUrl = buildOAuthUrl(provider, {
      clientId: options.clientId || config.social?.google?.clientId,
      redirectUri: options.redirectUri || config.social?.google?.redirectUri,
      scopes: options.scopes || 'openid profile email',
      state,
    })

    // Redirect to OAuth provider
    if (import.meta.client) {
      window.location.href = authUrl
    }
    else {
      await navigateTo(authUrl, { external: true })
    }
  }

  // Handle OAuth callback
  const handleSocialCallback = async (provider: string, code: string, state?: string) => {
    if (import.meta.client) {
      // Verify state for CSRF protection
      const storedState = localStorage.getItem('oauth_state')
      if (state && storedState && state !== storedState) {
        throw new Error('Invalid state parameter. Possible CSRF attack.')
      }

      // Get stored callback URL
      const callbackUrl = localStorage.getItem('oauth_callback')

      // Clean up localStorage
      localStorage.removeItem('oauth_state')
      localStorage.removeItem('oauth_callback')

      // Exchange code for tokens via your backend
      await signInWithSocial(provider, { code }, { callbackUrl: callbackUrl || undefined })
    }
  }

  // Helper function to generate random state
  const generateRandomState = () => {
    return Math.random().toString(36).substring(2, 15)
      + Math.random().toString(36).substring(2, 15)
  }

  // Helper function to build OAuth URLs
  const buildOAuthUrl = (provider: string, options: {
    clientId?: string
    redirectUri?: string
    scopes?: string
    state: string
  }) => {
    if (provider === 'google') {
      const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
      const params = new URLSearchParams({
        client_id: options.clientId || '',
        redirect_uri: options.redirectUri || '',
        response_type: 'code',
        scope: options.scopes || 'openid profile email',
        state: options.state,
        access_type: 'offline',
        prompt: 'consent',
      })
      return `${baseUrl}?${params.toString()}`
    }

    throw new Error(`OAuth URL building not implemented for provider: ${provider}`)
  }

  const refreshAuthToken = async () => {
    if (!refreshToken?.value) {
      await signOut()
      return
    }
    const url = config.endpoints?.refresh?.path
    const refresh_token = refreshToken.value

    const params = JSON.stringify({ refresh_token })

    const response: any = await fetchApi(
      url,
      {
        method: config.endpoints?.refresh?.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: params,
      },
    )

    if (response?.ok && response?._data) {
      setTokens(response._data)
    }
    else {
      clearTokens()
      data.value = null
    }
  }

  const signOut = async () => {
    if (token?.value) {
      const url = config.endpoints?.signOut?.path

      await fetchApi(
        url,
        {
          method: config.endpoints?.signOut?.method,
          headers: {
            'Authorization': `Bearer ${token?.value}`,
            'Content-Type': 'application/json',
          },
        },
      )
    }
    clearTokens()
    data.value = null
  }

  return {
    status,
    data,
    token,
    rawToken,
    refreshToken,
    rawRefreshToken,
    loading,
    signUp,
    signIn,
    signOut,
    getSession,
    signInWithSocial,
    initiateSocialLogin,
    handleSocialCallback,
    refreshAuthToken,
    clearTokens,
  }
}
