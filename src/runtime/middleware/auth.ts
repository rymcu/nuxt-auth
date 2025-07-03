import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuth } from '../composables/useAuth'
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const { status, token } = useAuth()

  // Return immediately if user is already authenticated
  if (status.value === 'authenticated' || token?.value) {
    // do nothing if already authenticated
    return
  }
  else {
    // Redirect to login if not authenticated
    if (from?.path && to?.path) {
      if (from.path !== to.path) {
        return navigateTo(`/login?redirect=${to.path}`)
      }
    }

    return navigateTo(`/login?redirect=${to.path}`)
  }
})
