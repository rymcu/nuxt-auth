import { useRuntimeConfig, useCookie, navigateTo, useRoute } from '#imports'

export interface OAuth2Provider {
  id: string
  name: string
  icon: string
  /** 是否为后端处理的 OAuth2 提供商 */
  isBackend?: boolean
}

/**
 * 支持的 OAuth2 提供商列表
 * 根据 mortise 后端 Spring Security OAuth2 配置
 */
export const oauth2Providers: OAuth2Provider[] = [
  { id: 'logto', name: 'Logto', icon: 'i-simple-icons-openid', isBackend: true },
  { id: 'github', name: 'GitHub', icon: 'i-simple-icons-github', isBackend: true },
  { id: 'google', name: 'Google', icon: 'i-simple-icons-google', isBackend: true },
  { id: 'wechat', name: '微信', icon: 'i-simple-icons-wechat', isBackend: true },
]

/**
 * OAuth2 扩展 Composable
 * 用于处理后端 OAuth2 授权流程（如 mortise 的 Spring Security OAuth2）
 */
export function useOAuth2() {
  const config = useRuntimeConfig()
  const route = useRoute()

  // 获取后端 OAuth2 基础 URL
  const getOAuth2BaseUrl = () => {
    // 优先使用 oauth2BaseURL，否则从 auth baseUrl 推断
    const baseURL = (config.public as any).oauth2BaseURL
      || (config.public as any).baseURL?.replace('/v1', '')
      || ''
    return baseURL
  }

  /**
   * 发起后端 OAuth2 登录
   * 跳转到后端 OAuth2 授权端点，由 Spring Security 处理
   *
   * @param providerId - OAuth2 提供商 ID (如 'logto', 'github', 'google')
   * @param options - 可选配置
   */
  const initiateOAuth2Login = (
    providerId: string,
    options?: {
      /** 登录成功后的重定向 URL */
      callbackUrl?: string
      /** 额外的 URL 参数 */
      extraParams?: Record<string, string>
    }
  ) => {
    const { callbackUrl = '/', extraParams = {} } = options || {}

    // 构建前端 OAuth2 回调 URL
    const frontendCallbackUrl = `${window.location.origin}/auth/callback`

    // 存储最终重定向 URL 到 cookie（登录成功后跳转）
    const redirectCookie = useCookie('oauth2.redirect', {
      maxAge: 60 * 10, // 10 分钟有效
      sameSite: 'lax',
    })
    redirectCookie.value = callbackUrl

    // 构建后端 OAuth2 授权 URL
    // mortise 后端格式: /api/oauth2/authorization/{provider}
    const params = new URLSearchParams({
      redirect_uri: frontendCallbackUrl,
      ...extraParams,
    })

    const oauth2BaseUrl = getOAuth2BaseUrl()
    const authUrl = `${oauth2BaseUrl}/oauth2/authorization/${providerId}?${params.toString()}`

    console.log('[OAuth2] Redirecting to:', authUrl)

    // 跳转到后端授权端点
    window.location.href = authUrl
  }

  /**
   * 处理 OAuth2 回调
   * 使用 state 从后端兑换 Token，并设置到 Cookie
   *
   * @returns 是否成功处理回调
   */
  const handleOAuth2Callback = async (): Promise<{
    success: boolean
    error?: string
  }> => {
    const state = route.query.state as string

    if (!state) {
      console.error('[OAuth2] Callback missing state parameter')
      return { success: false, error: 'OAuth2 回调参数缺失 (state)' }
    }

    try {
      // 调用后端 callback 接口兑换 Token
      // mortise 后端格式: GET /api/v1/auth/callback?state=xxx
      const baseURL = (config.public as any).baseURL || ''

      const response = await $fetch<{
        code: number
        data: {
          token: string
          refreshToken: string
          user?: any
        }
        message: string
      }>(`${baseURL}/auth/callback`, {
        params: { state },
      })

      if (response.code !== 200 || !response.data) {
        console.error('[OAuth2] Token exchange failed:', response.message)
        return { success: false, error: response.message || 'Token 兑换失败' }
      }

      const { token, refreshToken } = response.data

      if (!token) {
        return { success: false, error: '未获取到有效的 Token' }
      }

      // 调用 nuxt-auth 内置的 set-token 端点设置 httpOnly Cookie
      await $fetch('/api/auth/token/set-token', {
        method: 'POST',
        body: {
          accessToken: token,
          refreshToken: refreshToken,
        },
      })

      console.log('[OAuth2] Tokens set successfully')
      return { success: true }
    }
    catch (error: any) {
      console.error('[OAuth2] Callback error:', error)
      return {
        success: false,
        error: error?.data?.message || error?.message || 'OAuth2 认证过程中发生错误',
      }
    }
  }

  /**
   * 获取登录成功后的重定向 URL
   * 并清除 cookie
   */
  const getRedirectUrl = (): string => {
    const redirectCookie = useCookie('oauth2.redirect')
    const url = redirectCookie.value || '/'
    redirectCookie.value = null // 清除
    return url
  }

  /**
   * 清除 OAuth2 相关的临时数据
   */
  const clearOAuth2State = () => {
    const redirectCookie = useCookie('oauth2.redirect')
    redirectCookie.value = null
  }

  return {
    oauth2Providers,
    initiateOAuth2Login,
    handleOAuth2Callback,
    getRedirectUrl,
    clearOAuth2State,
  }
}
