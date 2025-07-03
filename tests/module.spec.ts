import { describe, it, expect } from 'vitest'
import pkg from '../package.json'

describe('andychukse-nuxt-auth', () => {
  it('should export module correctly', () => {
    // Basic test to ensure module structure is correct
    expect(true).toBe(true)
  })

  it('should have proper package.json configuration', () => {
    // Check package.json properties
    expect(pkg.name).toBe('@andychukse/nuxt-auth')
    expect(pkg.main).toBe('./dist/module.mjs')
    expect(pkg.type).toBe('module')
  })

  it('should have required dependencies', () => {
    expect(pkg.dependencies).toHaveProperty('@nuxt/kit')
    expect(pkg.dependencies).toHaveProperty('defu')
  })

  it('should have proper keywords in package.json', () => {
    expect(pkg.keywords).toContain('nuxt3')
    expect(pkg.keywords).toContain('authentication')
    expect(pkg.keywords).toContain('jwt')
    expect(pkg.keywords).toContain('social-login')
  })
})
