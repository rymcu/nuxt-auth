<template>
  <div class="oauth-methods">
    <h2>🔗 OAuth Callback Methods Demo</h2>

    <div class="methods-grid">
      <!-- Method 1: Client-Side Callback -->
      <div class="method-card">
        <h3>Method 1: Client-Side Callback</h3>
        <p>Direct navigation to Vue callback page that processes OAuth client-side</p>

        <div class="code-example">
          <pre><code>await initiateSocialLogin('google', {
  callbackUrl: '/dashboard'
})</code></pre>
        </div>

        <div class="flow-steps">
          <div class="step">
            1. Navigate to Google OAuth
          </div>
          <div class="step">
            2. Google redirects to <code>/auth/google/callback</code>
          </div>
          <div class="step">
            3. Vue page processes OAuth code
          </div>
          <div class="step">
            4. Navigate to callbackUrl
          </div>
        </div>

        <button
          :disabled="loading"
          class="btn primary"
          @click="testClientSideCallback"
        >
          Test Client-Side Callback
        </button>
      </div>

      <!-- Method 2: Server-Side Callback -->
      <div class="method-card">
        <h3>Method 2: Server-Side Callback</h3>
        <p>Server route handles OAuth and redirects to specified page with code</p>

        <div class="code-example">
          <pre><code>await initiateSocialLogin('google', {
  callbackUrl: '/dashboard',
  callbackPage: 'auth/custom-handler'
})</code></pre>
        </div>

        <div class="flow-steps">
          <div class="step">
            1. Set socialRedirect cookie
          </div>
          <div class="step">
            2. Navigate to Google OAuth
          </div>
          <div class="step">
            3. Server route processes callback
          </div>
          <div class="step">
            4. Redirect to custom page with code
          </div>
        </div>

        <button
          :disabled="loading"
          class="btn secondary"
          @click="testServerSideCallback"
        >
          Test Server-Side Callback
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="loading"
    >
      🔄 Running OAuth simulation...
    </div>

    <div
      v-if="result"
      class="result"
    >
      <h4>{{ result.title }}</h4>
      <p>{{ result.message }}</p>
      <div
        v-if="result.details"
        class="result-details"
      >
        <pre>{{ result.details }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const { handleSocialCallback } = useAuth()

const loading = ref(false)
const result = ref(null)

const testClientSideCallback = async () => {
  loading.value = true
  result.value = null

  try {
    result.value = {
      title: '✅ Client-Side Method Simulated',
      message: 'This would redirect to Google, then back to /auth/google/callback Vue page',
      details: `OAuth Flow:
1. initiateSocialLogin('google', { callbackUrl: '/dashboard' })
2. Redirect to Google OAuth
3. Google redirects to /auth/google/callback
4. Vue callback page processes code with handleSocialCallback()
5. Navigate to /dashboard

Cookie set: None (uses localStorage)
Final destination: /dashboard`,
    }

    // Simulate the flow without actually redirecting
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate callback processing
    const mockCode = 'client-mock-code-' + Date.now()
    const mockState = 'client-mock-state'

    if (import.meta.client) {
      localStorage.setItem('oauth_state', mockState)
      localStorage.setItem('oauth_callback', '/dashboard')
    }

    await handleSocialCallback('google', mockCode, mockState)
  }
  catch (error) {
    result.value = {
      title: '❌ Client-Side Error',
      message: error.message,
    }
  }
  finally {
    loading.value = false
  }
}

const testServerSideCallback = async () => {
  loading.value = true
  result.value = null

  try {
    result.value = {
      title: '✅ Server-Side Method Simulated',
      message: 'This would set socialRedirect cookie and use server route for callback',
      details: `OAuth Flow:
1. initiateSocialLogin('google', { 
     callbackUrl: '/dashboard',
     callbackPage: 'auth/custom-handler' 
   })
2. Set socialRedirect cookie = 'auth/custom-handler'
3. Redirect to Google OAuth
4. Google redirects to /api/auth/google/callback (server route)
5. Server reads socialRedirect cookie
6. Server redirects to /auth/custom-handler?code=...&state=...
7. Custom handler page processes the OAuth code

Cookie set: socialRedirect=auth/custom-handler
Final destination: /auth/custom-handler with OAuth params`,
    }

    // Simulate setting the cookie
    if (import.meta.client) {
      document.cookie = 'socialRedirect=auth/custom-handler; path=/; max-age=600'

      // Show what cookie was set
      const cookies = document.cookie.split(';').map(c => c.trim())
      const socialRedirectCookie = cookies.find(c => c.startsWith('socialRedirect='))

      if (socialRedirectCookie) {
        result.value.details += `\n\nCookie successfully set: ${socialRedirectCookie}`
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1500))
  }
  catch (error) {
    result.value = {
      title: '❌ Server-Side Error',
      message: error.message,
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
.oauth-methods {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
}

.methods-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

.method-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f8f9fa;
}

.method-card h3 {
  margin-top: 0;
  color: #333;
}

.code-example {
  background: #f1f3f4;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.code-example code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85em;
  line-height: 1.4;
}

.flow-steps {
  margin: 1rem 0;
}

.step {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0.25rem 0;
  font-size: 0.9em;
}

.step code {
  background: #e9ecef;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 0.8em;
}

.btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.btn.primary {
  background: #007bff;
}

.btn.secondary {
  background: #28a745;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1em;
}

.result {
  background: #e7f3ff;
  border: 1px solid #b3d7ff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.result h4 {
  margin-top: 0;
}

.result-details {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.result-details pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85em;
  line-height: 1.4;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .methods-grid {
    grid-template-columns: 1fr;
  }
}
</style>
