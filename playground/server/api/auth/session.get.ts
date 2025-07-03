import { getHeader, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // Only handle GET requests
  if (event.node.req.method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    // Get the authorization header
    const authorization = getHeader(event, 'authorization')

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    // Extract token (for validation in real scenario)
    const token = authorization.split(' ')[1]

    // For demo purposes, return mock user data for any valid token
    if (token && token.startsWith('mock-access-token')) {
      return {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        is_verified: true,
        roles: [{ slug: 'user', name: 'User' }],
      }
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    })
  }
  catch (error) {
    console.error('Session retrieval failed:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
})
