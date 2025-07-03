<template>
  <div class="callback-page">
    <div v-if="loading">
      <h1>Processing Google Sign In...</h1>
      <p>Please wait while we complete your authentication.</p>
      <div class="loading-steps">
        <div
          class="step"
          :class="{ active: currentStep >= 1 }"
        >
          ✅ Received authorization code
        </div>
        <div
          class="step"
          :class="{ active: currentStep >= 2 }"
        >
          🔄 Verifying security state
        </div>
        <div
          class="step"
          :class="{ active: currentStep >= 3 }"
        >
          🔄 Exchanging code for tokens
        </div>
        <div
          class="step"
          :class="{ active: currentStep >= 4 }"
        >
          🔄 Setting up user session
        </div>
      </div>
    </div>
    <div v-else-if="error">
      <h1>Authentication Error</h1>
      <p>{{ error }}</p>
      <button @click="navigateTo('/')">
        Try Again
      </button>
    </div>
    <div v-else-if="success">
      <h1>Success!</h1>
      <p>Redirecting to your dashboard...</p>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { handleSocialCallback } = useAuth()

const loading = ref(true)
const error = ref('')
const success = ref(false)
const currentStep = ref(0)

onMounted(async () => {
  try {
    console.log('🔍 OAuth callback page loaded')

    const code = route.query.code
    const state = route.query.state
    const errorParam = route.query.error

    if (errorParam) {
      throw new Error(`OAuth error: ${errorParam}`)
    }

    if (!code) {
      throw new Error('No authorization code received')
    }

    console.log('✅ Authorization code received:', code)
    currentStep.value = 1
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('🔒 Verifying CSRF state...')
    currentStep.value = 2
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('🔄 Processing OAuth callback...')
    currentStep.value = 3
    await new Promise(resolve => setTimeout(resolve, 500))

    // Use the module's enhanced callback handler
    await handleSocialCallback('google', code, state)

    currentStep.value = 4
    success.value = true
    loading.value = false

    console.log('🎉 OAuth callback processed successfully!')

    // The handleSocialCallback function will automatically redirect
    // But we'll show success briefly first
    setTimeout(() => {
      // This should not be reached as handleSocialCallback redirects
      console.log('ℹ️ If you see this, check the handleSocialCallback implementation')
    }, 1000)
  }
  catch (err) {
    console.error('❌ Google OAuth callback error:', err)
    error.value = err.message || 'An unexpected error occurred'
    loading.value = false
  }
})

// Add meta to prevent this page from being indexed or cached
definePageMeta({
  robots: false,
})
</script>

<style scoped>
.callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}

.loading-steps {
  margin-top: 2rem;
  text-align: left;
  max-width: 300px;
}

.step {
  padding: 0.5rem 0;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.step.active {
  opacity: 1;
}

button {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>

<style scoped>
.callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}

button {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
