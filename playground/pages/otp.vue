<template>
  <div class="otp-page">
    <h1>OTP Verification</h1>
    <p>Please check your email for the verification code.</p>
    <div class="otp-form">
      <input
        v-model="otpCode"
        type="text"
        placeholder="Enter OTP code"
        maxlength="6"
      >
      <button @click="verifyOTP">
        Verify
      </button>
      <button @click="goBack">
        Go Back
      </button>
    </div>
  </div>
</template>

<script setup>
const otpCode = ref('')

const verifyOTP = () => {
  // Mock OTP verification
  if (otpCode.value === '123456') {
    alert('OTP verified successfully!')
    navigateTo('/dashboard')
  }
  else {
    alert('Invalid OTP code. Try 123456')
  }
}

const goBack = () => {
  navigateTo('/')
}
</script>

<style scoped>
.otp-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.otp-form {
  margin-top: 2rem;
}

.otp-form input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 0.2rem;
}

.otp-form button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.otp-form button:first-of-type {
  background: #007bff;
  color: white;
}

.otp-form button:last-of-type {
  background: #6c757d;
  color: white;
}
</style>
