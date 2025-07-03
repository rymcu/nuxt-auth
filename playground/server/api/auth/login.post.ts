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
    const { email, password } = body

    // Simple validation
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required',
      })
    }

    // Simulate authentication logic
    // For demo purposes, accept any email/password combination
    const user = {
      id: 1,
      email: email,
      name: 'Test User',
      is_verified: true,
      roles: [{ slug: 'user', name: 'User' }],
    }

    // Generate mock tokens
    const accessToken = `mock-access-token-${Date.now()}`
    const refreshToken = `mock-refresh-token-${Date.now()}`

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: user,
      expires_in: 3600,
      token_type: 'Bearer',
    }
  }
  catch (error) {
    console.error('Session retrieval failed:', error)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid credentials',
    })
  }
})
