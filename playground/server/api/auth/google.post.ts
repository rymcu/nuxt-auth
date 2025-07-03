import { readBody, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // Only handle POST requests
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    const body = await readBody(event)
    const { code, email, name, picture } = body

    // Simple validation
    if (!code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Authorization code is required',
      })
    }

    // Simulate Google OAuth token exchange
    // In a real app, you would:
    // 1. Exchange the code for access token with Google
    // 2. Use the access token to get user info from Google
    // 3. Create or update user in your database

    // For simulation, we'll create a mock user based on the provided data
    const user = {
      id: Math.floor(Math.random() * 1000),
      email: email || 'google.user@gmail.com',
      name: name || 'Google User',
      picture: picture || 'https://via.placeholder.com/100',
      provider: 'google',
      is_verified: true,
      roles: [{ slug: 'user', name: 'User' }],
    }

    // Generate mock tokens
    const mockTokens = {
      access_token: `mock-google-token-${Date.now()}`,
      refresh_token: `mock-google-refresh-${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 3600,
      user: user,
    }

    console.log('Google OAuth simulation successful:', { user: user.email, code })

    return mockTokens
  }
  catch (error: any) {
    console.error('Google OAuth error:', error)

    if (error?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during Google authentication',
    })
  }
})
