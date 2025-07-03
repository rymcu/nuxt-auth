<template>
  <div class="social-login">
    <h3>Social Login Test</h3>
    <button
      :disabled="loading"
      class="google-btn"
      @click="handleGoogleSignIn"
    >
      <span v-if="loading">Signing in...</span>
      <span v-else>
        🔗 Sign in with Google (Simulated)
      </span>
    </button>

    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <div class="info">
      <p><strong>How this works:</strong></p>
      <ul>
        <li>Click the button to simulate Google OAuth flow</li>
        <li>The module handles OAuth URL generation and state management</li>
        <li>For testing, we'll simulate the callback with mock data</li>
        <li>In production, this would redirect to Google's OAuth page</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const { signInWithSocial } = useAuth()
const loading = ref(false)
const error = ref('')

const handleGoogleSignIn = async () => {
  loading.value = true
  error.value = ''

  try {
    // In a real app, this would redirect to Google
    // For testing, we'll simulate the full flow
    console.log('Initiating Google sign in...')

    // Simulate OAuth flow with mock data
    await simulateGoogleCallback()
  }
  catch (err) {
    console.error('Google sign in error:', err)
    error.value = err.message || 'Sign in failed'
  }
  finally {
    loading.value = false
  }
}

// Simulate a successful Google OAuth callback
const simulateGoogleCallback = async () => {
  try {
    // Simulate the authorization code that Google would send back
    const mockAuthCode = 'mock-auth-code-' + Date.now()

    // Call the module's social sign in function with mock data
    await signInWithSocial('google', {
      code: mockAuthCode,
      // Additional mock data that your backend might need
      provider: 'google',
      email: 'test@gmail.com',
      name: 'Test User',
      picture: 'https://via.placeholder.com/100',
    }, {
      callbackUrl: '/dashboard', // Redirect to dashboard after successful sign in
    })

    console.log('Mock Google sign in successful!')
  }
  catch (error) {
    console.error('Mock Google callback error:', error)
    throw error
  }
}
</script>

<style scoped>
.social-login {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.google-btn {
  display: block;
  width: 100%;
  padding: 12px 16px;
  margin: 1rem 0;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: white;
  color: #3c4043;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3);
}

.google-btn:hover:not(:disabled) {
  background: #f7f8f8;
  box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  margin: 1rem 0;
  padding: 0.5rem;
  border: 1px solid #dc3545;
  border-radius: 4px;
  background: #f8d7da;
}

.info {
  margin-top: 2rem;
  padding: 1rem;
  background: #e7f3ff;
  border: 1px solid #b3d7ff;
  border-radius: 4px;
  font-size: 14px;
}

.info ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.info li {
  margin: 0.25rem 0;
}
</style>
