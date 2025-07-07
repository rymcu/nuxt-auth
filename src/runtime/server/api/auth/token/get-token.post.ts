import { defineEventHandler, getCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authConfig: ModuleOptions = config.public.auth as ModuleOptions

  try {
    // Get current access token
    const accessToken = getCookie(event, authConfig.token.cookieName)
    const refreshToken = getCookie(event, authConfig.token.refresh.cookieName)

    // Get and return access token if exists
    if (accessToken || refreshToken) {
      return { accessToken, refreshToken }
    }

    return null
  }
  catch (error: any) {
    console.error('Server-side signout error:', error)
    return null
  }
})
