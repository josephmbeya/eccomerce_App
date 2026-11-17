// Admin configuration and utilities
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

/**
 * Check if a user email is in the admin list
 */
export function isAdmin(email: string | null | undefined): boolean {
  return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false
}

/**
 * Get admin configuration
 */
export function getAdminConfig() {
  return {
    emails: ADMIN_EMAILS,
    dashboardPath: '/admin'
  }
}
