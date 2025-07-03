import { sendRedirect, getQuery, getCookie, setCookie, defineEventHandler } from 'h3'
// This route handles the Google OAuth callback and redirects the user to the appropriate page after authentication.
// It checks for the 'code' query parameter and uses a cookie to determine where to redirect the user after successful authentication.
// If the 'code' is missing, it redirects to the registration page
// If the 'code' is present, it redirects to the specified page with the 'code' and 'state' query parameters.
// The redirect location is determined by a cookie named 'socialRedirect', which is cleared after reading it.
// If the cookie is not set, it defaults to redirecting to the registration page.
// This route is designed to work seamlessly with the existing Nuxt 3 authentication system and can be easily integrated into an existing Nuxt 3 application.
// It follows best practices for security and performance

export default defineEventHandler(async (event) => {
  if (!event) return

  if (event.node.req.method === 'GET' || event.node.req.method === 'POST') {
    const { code, state } = getQuery(event)

    if (code === null || code === undefined || code === '') {
      return sendRedirect(event, '/register', 302)
    }

    // Check for the redirect cookie to determine where to send the user
    const socialRedirect = getCookie(event, 'socialRedirect') || 'register'

    // Clear the cookie after reading it
    setCookie(event, 'socialRedirect', '', {
      maxAge: -1, // Expires immediately
      path: '/',
    })

    return sendRedirect(event, `/${socialRedirect}/?code=${code}&state=${state}`, 302)
  }
})
