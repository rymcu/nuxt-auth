import type { ModuleOptions } from '../../src/types'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    auth?: ModuleOptions
  }
}

declare module 'nuxt/schema' {
  interface NuxtConfig {
    auth?: ModuleOptions
  }
}

export {}
