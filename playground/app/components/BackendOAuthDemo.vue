<template>
  <div class="backend-oauth-demo">
    <h2>🔐 Backend OAuth2 Flow Demo</h2>

    <div class="demo-explanation">
      <p>
        This demo shows how to use <code>useOAuth2()</code> composable to integrate with a
        backend OAuth2 flow (e.g., Spring Security OAuth2 in mortise).
      </p>
      <p class="note">
        <strong>Note:</strong> This requires a properly configured backend with OAuth2 providers.
      </p>
    </div>

    <!-- OAuth2 Flow Diagram -->
    <div class="flow-diagram">
      <h3>OAuth2 Flow</h3>
      <div class="flow-steps">
        <div class="flow-step">
          <span class="flow-icon">1️⃣</span>
          <span>Frontend → Backend OAuth2 endpoint</span>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-step">
          <span class="flow-icon">2️⃣</span>
          <span>Backend → Provider (Google, Logto, etc.)</span>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-step">
          <span class="flow-icon">3️⃣</span>
          <span>Provider → Backend callback</span>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-step">
          <span class="flow-icon">4️⃣</span>
          <span>Backend → Frontend callback with state</span>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-step">
          <span class="flow-icon">5️⃣</span>
          <span>Frontend exchanges state for tokens</span>
        </div>
      </div>
    </div>

    <!-- Provider Selection -->
    <div class="provider-section">
      <h3>Select OAuth2 Provider</h3>
      <div class="provider-grid">
        <button
          v-for="provider in oauth2Providers"
          :key="provider.id"
          class="provider-btn"
          :disabled="isLoading"
          @click="handleProviderLogin(provider)"
        >
          <span class="provider-icon">{{ getProviderEmoji(provider.id) }}</span>
          <span class="provider-name">{{ provider.name }}</span>
        </button>
      </div>
    </div>

    <!-- Configuration Display -->
    <div class="config-section">
      <h3>Configuration</h3>
      <div class="config-code">
        <pre>{{ configDisplay }}</pre>
      </div>
    </div>

    <!-- Code Examples -->
    <div class="code-section">
      <h3>Usage Examples</h3>

      <div class="code-example">
        <h4>1. Initiate OAuth2 Login</h4>
        <pre><code>// In your login page or component
const { initiateOAuth2Login, oauth2Providers } = useOAuth2()

// Trigger login with a provider
const handleLogin = (providerId: string) => {
  initiateOAuth2Login(providerId, {
    callbackUrl: '/dashboard', // Where to go after login
  })
}</code></pre>
      </div>

      <div class="code-example">
        <h4>2. Handle OAuth2 Callback (pages/auth/callback.vue)</h4>
        <pre><code>&lt;script setup&gt;
const { handleOAuth2Callback, getRedirectUrl } = useOAuth2()
const { getSession } = useAuth()

onMounted(async () => {
  const result = await handleOAuth2Callback()

  if (result.success) {
    await getSession() // Refresh user session
    navigateTo(getRedirectUrl())
  }
})
&lt;/script&gt;</code></pre>
      </div>

      <div class="code-example">
        <h4>3. Backend Requirements (mortise example)</h4>
        <pre><code>// Spring Security OAuth2 endpoints:
// GET  /api/oauth2/authorization/{provider} - Initiate OAuth2
// GET  /login/oauth2/code/{provider}        - Provider callback
// GET  /api/v1/auth/callback?state=xxx      - Frontend token exchange</code></pre>
      </div>
    </div>

    <!-- Status Messages -->
    <div
      v-if="statusMessage"
      class="status"
      :class="statusType"
    >
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup>
const { oauth2Providers, initiateOAuth2Login } = useOAuth2()

const isLoading = ref(false)
const statusMessage = ref('')
const statusType = ref('')

const getProviderEmoji = (id) => {
  const emojis = {
    logto: '🔐',
    github: '🐙',
    google: '🔍',
    wechat: '💬',
  }
  return emojis[id] || '🔗'
}

const configDisplay = computed(() => {
  return `// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseURL: 'https://your-api.com/api/v1',
      oauth2BaseURL: 'https://your-api.com/api', // Backend OAuth2 base
    }
  },
  auth: {
    baseUrl: 'https://your-api.com/api/v1/auth',
    // ... other config
  }
})`
})

const handleProviderLogin = async (provider) => {
  isLoading.value = true
  statusMessage.value = ''

  try {
    statusMessage.value = `Redirecting to ${provider.name} OAuth2...`
    statusType.value = 'info'

    // This will redirect to the backend OAuth2 endpoint
    initiateOAuth2Login(provider.id, {
      callbackUrl: '/', // Where to redirect after successful login
    })
  }
  catch (err) {
    statusMessage.value = `Error: ${err.message}`
    statusType.value = 'error'
    isLoading.value = false
  }
}
</script>

<style scoped>
.backend-oauth-demo {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

h3 {
  margin: 1.5rem 0 0.75rem;
  font-size: 1.1rem;
  opacity: 0.9;
}

h4 {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.demo-explanation {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.demo-explanation p {
  margin: 0.5rem 0;
}

.note {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Flow Diagram */
.flow-diagram {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.flow-steps {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.flow-step {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.flow-arrow {
  opacity: 0.6;
}

/* Provider Section */
.provider-section {
  margin: 1.5rem 0;
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.provider-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}

.provider-btn:hover:not(:disabled) {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.provider-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.provider-icon {
  font-size: 1.25rem;
}

/* Config Section */
.config-section {
  margin: 1.5rem 0;
}

.config-code {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

.config-code pre {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: #e2e8f0;
}

/* Code Examples */
.code-section {
  margin: 1.5rem 0;
}

.code-example {
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
}

.code-example pre {
  margin: 0;
  overflow-x: auto;
}

.code-example code {
  font-size: 0.8rem;
  line-height: 1.5;
  color: #e2e8f0;
}

/* Status Messages */
.status {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.status.info {
  background: rgba(59, 130, 246, 0.3);
}

.status.error {
  background: rgba(239, 68, 68, 0.3);
}

.status.success {
  background: rgba(34, 197, 94, 0.3);
}
</style>
