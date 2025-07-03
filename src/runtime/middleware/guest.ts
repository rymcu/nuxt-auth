import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig } from '#imports'
import { useAuth } from '../composables/useAuth'
import type { RouteLocationNormalized } from 'vue-router'
import type { ModuleOptions } from '../../types'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const { status, token } = useAuth()
  const runConfig = useRuntimeConfig()
  const config: ModuleOptions = runConfig.public.auth as ModuleOptions
  const redirectUrl = config?.callback || '/dashboard'

  // Return immediately if user is already authenticated
  if (status.value === 'authenticated' || token?.value) {
    if (from?.path && to?.path) {
      if (from.path !== to.path) {
        return navigateTo(from.path)
      }
    }
    return navigateTo(redirectUrl)
  }
  return
}) as any
