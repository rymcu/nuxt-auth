<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div v-if="status === 'loading'">
      Loading...
    </div>
    <div v-else-if="status === 'authenticated'">
      <h2>Welcome, {{ data?.name || 'User' }}!</h2>
      <p>Email: {{ data?.email }}</p>
      <button @click="handleSignOut">
        Sign Out
      </button>
    </div>
    <div v-else>
      <p>Please sign in to view the dashboard.</p>
      <button @click="navigateTo('/')">
        Go to Sign In
      </button>
    </div>
  </div>
</template>

<script setup>
const { status, data, signOut } = useAuth()

// Protect this page with auth middleware
definePageMeta({
  middleware: 'auth',
})

const handleSignOut = async () => {
  try {
    await signOut()
    await navigateTo('/')
  }
  catch (error) {
    console.error('Sign out failed:', error)
    alert('Sign out failed: ' + error.message)
  }
}
</script>

<style scoped>
.dashboard {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

button {
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: white;
}

button:hover {
  background: #0056b3;
}
</style>
