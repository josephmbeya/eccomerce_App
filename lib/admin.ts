// Admin configuration and utilities
export const ADMIN_EMAILS = [
  'admin@tishope.com', 
  'your-email@example.com' // Replace with your actual admin emails
]

/**
 * Check if a user email is in the admin list
 */
export function isAdmin(email: string | null | undefined): boolean {
  return email ? ADMIN_EMAILS.includes(email) : false
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
