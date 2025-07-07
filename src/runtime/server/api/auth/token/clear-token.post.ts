import { defineEventHandler, setCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authConfig: ModuleOptions = config.public.auth as ModuleOptions

  // Clear token cookie
  setCookie(event, authConfig.token.cookieName, '', {
    // domain: authConfig.token.cookieDomain,
    maxAge: 0,
    sameSite: authConfig.token.sameSiteAttribute,
    secure: authConfig.token.secureCookieAttribute,
    httpOnly: authConfig.token.httpOnlyCookieAttribute,
    path: '/',
  })

  // Clear refresh token cookie
  setCookie(event, authConfig.token.refresh.cookieName, '', {
    // domain: authConfig.token.cookieDomain,
    maxAge: 0,
    sameSite: authConfig.token.refresh.sameSiteAttribute,
    secure: authConfig.token.refresh.secureCookieAttribute,
    httpOnly: authConfig.token.refresh.httpOnlyCookieAttribute,
    path: '/',
  })

  return { success: true, message: 'Tokens cleared' }
})
