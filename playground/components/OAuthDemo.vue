<template>
  <div class="oauth-demo">
    <h2>🔗 Google OAuth Flow Simulation</h2>

    <div class="demo-explanation">
      <p>This demo shows how the enhanced social login works using <code>initiateSocialLogin()</code> and <code>handleSocialCallback()</code>.</p>
    </div>

    <div class="demo-steps">
      <div
        class="step"
        :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
      >
        <div class="step-number">
          1
        </div>
        <div class="step-content">
          <h4>Initiate OAuth Flow</h4>
          <p>Call <code>initiateSocialLogin('google')</code> to start the process</p>
          <div
            v-if="currentStep === 1"
            class="step-details"
          >
            <ul>
              <li>✅ Generate CSRF state token</li>
              <li>✅ Store state in localStorage</li>
              <li>✅ Store callback URL</li>
              <li>🔄 Would redirect to Google (simulated here)</li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="step"
        :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
      >
        <div class="step-number">
          2
        </div>
        <div class="step-content">
          <h4>User Authorization</h4>
          <p>User authenticates with Google and authorizes your app</p>
          <div
            v-if="currentStep === 2"
            class="step-details"
          >
            <ul>
              <li>🔄 User signs in with Google</li>
              <li>🔄 User grants permissions</li>
              <li>✅ Google generates authorization code</li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="step"
        :class="{ active: currentStep >= 3, completed: currentStep > 3 }"
      >
        <div class="step-number">
          3
        </div>
        <div class="step-content">
          <h4>Handle OAuth Callback</h4>
          <p>Process the callback using <code>handleSocialCallback()</code></p>
          <div
            v-if="currentStep === 3"
            class="step-details"
          >
            <ul>
              <li>✅ Verify CSRF state token</li>
              <li>✅ Extract authorization code</li>
              <li>✅ Get stored callback URL</li>
              <li>🔄 Exchange code for user data</li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="step"
        :class="{ active: currentStep >= 4, completed: currentStep > 4 }"
      >
        <div class="step-number">
          4
        </div>
        <div class="step-content">
          <h4>Complete Authentication</h4>
          <p>Set user session and redirect to destination</p>
          <div
            v-if="currentStep === 4"
            class="step-details"
          >
            <ul>
              <li>✅ Store authentication tokens</li>
              <li>✅ Set user session data</li>
              <li>✅ Clean up temporary data</li>
              <li>🎉 Redirect to callback URL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-controls">
      <button
        :disabled="isRunning"
        class="btn primary"
        @click="startDemo"
      >
        {{ isRunning ? 'Running Demo...' : 'Start OAuth Demo' }}
      </button>

      <button
        :disabled="isRunning"
        class="btn"
        @click="resetDemo"
      >
        Reset
      </button>
    </div>

    <div
      v-if="error"
      class="error"
    >
      ❌ {{ error }}
    </div>

    <div
      v-if="success"
      class="success"
    >
      🎉 OAuth simulation completed successfully! Check the main page to see your authenticated state.
    </div>
  </div>
</template>

<script setup>
const { handleSocialCallback } = useAuth()

const currentStep = ref(0)
const isRunning = ref(false)
const error = ref('')
const success = ref(false)

const startDemo = async () => {
  isRunning.value = true
  error.value = ''
  success.value = false
  currentStep.value = 0

  try {
    // Step 1: Initiate OAuth
    currentStep.value = 1
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate state generation and storage
    const mockState = 'demo-state-' + Math.random().toString(36).substring(7)
    if (import.meta.client) {
      localStorage.setItem('oauth_state', mockState)
      localStorage.setItem('oauth_callback', '/dashboard')
    }

    // Step 2: User Authorization (simulated)
    currentStep.value = 2
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 3: Handle Callback
    currentStep.value = 3
    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockAuthCode = 'demo-auth-code-' + Date.now()

    // Step 4: Complete Authentication
    currentStep.value = 4
    await handleSocialCallback('google', mockAuthCode, mockState)

    await new Promise(resolve => setTimeout(resolve, 1000))
    success.value = true
  }
  catch (err) {
    error.value = err.message || 'Demo failed'
  }
  finally {
    isRunning.value = false
  }
}

const resetDemo = () => {
  currentStep.value = 0
  error.value = ''
  success.value = false
  if (import.meta.client) {
    localStorage.removeItem('oauth_state')
    localStorage.removeItem('oauth_callback')
  }
}
</script>

<style scoped>
.oauth-demo {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.demo-explanation {
  background: #e7f3ff;
  border: 1px solid #b3d7ff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.demo-explanation code {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.demo-steps {
  margin: 2rem 0;
}

.step {
  display: flex;
  margin-bottom: 1.5rem;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
  transform: scale(1.02);
}

.step.completed {
  opacity: 0.7;
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
}

.step.active .step-number {
  background: #007bff;
  animation: pulse 2s infinite;
}

.step.completed .step-number {
  background: #28a745;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.step-content p {
  margin: 0 0 0.5rem 0;
  color: #666;
}

.step-details {
  background: #f8f9fa;
  border-left: 4px solid #007bff;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.step-details ul {
  margin: 0;
  padding-left: 1.5rem;
}

.step-details li {
  margin: 0.25rem 0;
  font-size: 0.9em;
}

.demo-controls {
  text-align: center;
  margin: 2rem 0;
}

.btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin: 0 0.5rem;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn.primary {
  background: #007bff;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}

.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}
</style>
