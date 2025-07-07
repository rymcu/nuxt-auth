import { defineNuxtPlugin } from '#app'
import { useAuth } from './composables/useAuth'

export default defineNuxtPlugin(async () => {
  const { data, token, refreshToken, loading, getSession, refreshAuthToken } = useAuth()

  loading.value = true

  const shouldFetchSession = typeof data.value === 'undefined' && token?.value

  const shouldRefreshSession = typeof data.value === 'undefined' && refreshToken?.value

  if (shouldFetchSession) {
    try {
      await getSession()
    }
    catch (error: any) {
      console.warn('Session fetch failed:', error?.statusMessage || error?.message)

      if (error?.status === 401 || error?.statusCode === 401) {
        console.log('Access token expired, attempting refresh')
        try {
          await refreshAuthToken()
        }
        catch (refreshError: any) {
          console.log(refreshError)
          console.warn('Token refresh failed:', refreshError?.statusMessage || refreshError?.message)
        }
      }
    }
  }
  else {
    if (shouldRefreshSession) {
      try {
        await refreshAuthToken()
      }
      catch (e) {
        console.error('Failed to refresh session:', e)
      }
    }
  }

  loading.value = false
}) as any
