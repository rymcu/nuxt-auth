<template>
  <div>
    <h1>Nuxt Simple Auth Playground</h1>
    <div
      v-if="status === 'loading'"
      class="loading"
    >
      Loading authentication status...
    </div>
    <div
      v-else-if="status === 'authenticated'"
      class="authenticated"
    >
      <h2>Welcome back!</h2>
      <p>You are successfully authenticated.</p>
      <p v-if="data?.email">
        Email: {{ data.email }}
      </p>
      <p v-if="data?.name">
        Name: {{ data.name }}
      </p>
      <button
        class="btn"
        @click="handleSignOut"
      >
        Sign Out
      </button>
    </div>
    <div
      v-else
      class="unauthenticated"
    >
      <h2>Please sign in</h2>
      <p>You are not authenticated.</p>
      <div class="auth-buttons">
        <button
          class="btn primary"
          @click="handleSignIn"
        >
          Test Sign In
        </button>
        <button
          class="btn primary"
          @click="handleSignInCallback"
        >
          Test Sign In with Callback
        </button>
        <button
          class="btn"
          @click="handleSignUp"
        >
          Test Sign Up
        </button>
        <button
          class="btn google"
          :disabled="googleLoading"
          @click="handleGoogleSignIn"
        >
          <span v-if="googleLoading">🔄 Simulating OAuth Flow...</span>
          <span v-else>🔗 Google OAuth Simulation</span>
        </button>
      </div>
    </div>

    <div class="debug-info">
      <h3>Debug Information</h3>
      <p>Status: {{ status }}</p>
      <p>Token: {{ token ? 'Present' : 'Not present' }}</p>
      <p>Refresh Token: {{ refreshToken ? 'Present' : 'Not present' }}</p>
    </div>

    <!-- Social Login Test Component -->
    <SocialLoginTest />

    <!-- OAuth Flow Demo -->
    <OAuthDemo />
  </div>
</template>

<script setup>
const { status, data, token, refreshToken, signIn, signOut, signUp, handleSocialCallback } = useAuth()

const googleLoading = ref(false)

const handleSignIn = async () => {
  try {
    await signIn({
      email: 'test@example.com',
      password: 'password123',
    }) // Example: redirect to dashboard after sign in
  }
  catch (error) {
    console.error('Sign in failed:', error)
    alert('Sign in failed: ' + error.message)
  }
}

const handleSignInCallback = async () => {
  try {
    await signIn({
      email: 'test@example.com',
      password: 'password123',
    }, { callbackUrl: '/dashboard' }) // Example: redirect to dashboard after sign in
  }
  catch (error) {
    console.error('Sign in failed:', error)
    alert('Sign in failed: ' + error.message)
  }
}

const handleSignUp = async () => {
  try {
    await signUp({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    }, { callbackUrl: '/otp' }) // Example: redirect to OTP page after signup
  }
  catch (error) {
    console.error('Sign up failed:', error)
    alert('Sign up failed: ' + error.message)
  }
}

const handleGoogleSignIn = async () => {
  googleLoading.value = true

  try {
    console.log('🚀 Starting Google OAuth simulation...')

    // Step 1: Simulate initiateSocialLogin - this would normally redirect to Google
    console.log('📤 Step 1: Initiating social login (would redirect to Google in production)')

    // Generate mock state for CSRF protection
    const mockState = 'mock-state-' + Math.random().toString(36).substring(7)

    // Store state in localStorage to simulate real OAuth flow
    if (import.meta.client) {
      localStorage.setItem('oauth_state', mockState)
      localStorage.setItem('oauth_callback', '/dashboard')
    }

    console.log('✅ OAuth state stored:', mockState)

    // Simulate delay for OAuth redirect and user authorization
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Step 2: Simulate OAuth callback with authorization code
    console.log('📥 Step 2: Simulating OAuth callback from Google')

    const mockAuthCode = 'mock-google-auth-code-' + Date.now()
    console.log('✅ Mock authorization code generated:', mockAuthCode)

    // Step 3: Use handleSocialCallback to process the OAuth response
    console.log('🔄 Step 3: Processing OAuth callback')

    await handleSocialCallback('google', mockAuthCode, mockState)

    console.log('🎉 Google OAuth simulation completed successfully!')
  }
  catch (error) {
    console.error('❌ Google OAuth simulation failed:', error)
    alert('Google sign in failed: ' + error.message)
  }
  finally {
    googleLoading.value = false
  }
}

const handleSignOut = async () => {
  try {
    await signOut()
  }
  catch (error) {
    console.error('Sign out failed:', error)
    alert('Sign out failed: ' + error.message)
  }
}
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.authenticated {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.unauthenticated {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.auth-buttons {
  margin-top: 1rem;
}

.btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn.primary {
  background: #007bff;
}

.btn.google {
  background: white;
  color: #3c4043;
  border: 1px solid #dadce0;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
}

.btn.google:hover:not(:disabled) {
  background: #f7f8f8;
  box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);
}

.btn.google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:hover {
  opacity: 0.8;
}

.btn.google:hover {
  opacity: 1;
}

.debug-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 2rem;
}

.debug-info h3 {
  margin-top: 0;
}
</style>
