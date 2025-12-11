<script setup lang="ts">
/**
 * OAuth2 回调页面
 * 处理后端 OAuth2 授权成功后的回调
 *
 * 流程:
 * 1. 后端 OAuth2 授权成功后重定向到此页面: /auth/callback?state=xxx
 * 2. 使用 state 调用后端 /api/v1/auth/callback 兑换 Token
 * 3. 调用 /api/auth/token/set-token 设置 httpOnly Cookie
 * 4. 刷新用户会话
 * 5. 重定向到目标页面
 */

definePageMeta({
  layout: 'default',
  auth: false, // 回调页面不需要认证中间件
})

const { handleOAuth2Callback, getRedirectUrl, clearOAuth2State } = useOAuth2()
const { getSession } = useAuth()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // 处理 OAuth2 回调
    const result = await handleOAuth2Callback()

    if (result.success) {
      // 刷新用户会话
      await getSession()

      // 获取并跳转到目标页面
      const redirectUrl = getRedirectUrl()
      console.log('[OAuth2 Callback] Redirecting to:', redirectUrl)

      await navigateTo(redirectUrl)
    }
    else {
      error.value = result.error || 'OAuth2 认证失败，请重试'
    }
  }
  catch (e: any) {
    console.error('[OAuth2 Callback] Error:', e)
    error.value = e.message || 'OAuth2 认证过程中发生错误'
    clearOAuth2State()
  }
  finally {
    loading.value = false
  }
})

// 返回登录页
const handleRetry = () => {
  clearOAuth2State()
  navigateTo('/login')
}
</script>

<template>
  <div class="oauth-callback">
    <div class="callback-container">
      <!-- 加载中状态 -->
      <template v-if="loading">
        <div class="loading-spinner" />
        <p class="loading-text">
          正在处理 OAuth2 认证...
        </p>
      </template>

      <!-- 错误状态 -->
      <template v-else-if="error">
        <div class="error-icon">
          ⚠️
        </div>
        <p class="error-title">
          认证失败
        </p>
        <p class="error-message">
          {{ error }}
        </p>
        <button class="retry-button" @click="handleRetry">
          返回登录
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.oauth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.callback-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  min-width: 300px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 1rem;
  color: #666;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #666;
  margin-bottom: 1.5rem;
  max-width: 280px;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #2563eb;
}
</style>
