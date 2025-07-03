import { getHeader, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // Only handle POST requests
  if (event.node.req.method !== 'POST') {
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

    // For demo purposes, just return success
    // In real implementation, you would invalidate the token
    return {
      message: 'Successfully logged out',
    }
  }
  catch (error) {
    console.error('Session retrieval failed:', error)
    throw createError({
      statusCode: 400,
      statusMessage: 'Logout failed',
    })
  }
})
