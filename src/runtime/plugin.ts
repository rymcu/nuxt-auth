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
    catch (e) {
      console.error('Failed to get session:', e)
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
