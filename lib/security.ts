import { NextRequest, NextResponse } from 'next/server'
import { getIp } from '@/lib/utils'

// Rate limiting store (in production, use Redis)
const rateLimitMap = new Map<string, { attempts: number; lastAttempt: number; blocked: boolean }>()

export interface SecurityConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

const defaultConfig: SecurityConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
}

export class SecurityManager {
  private config: SecurityConfig

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // Rate limiting for login attempts
  checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = rateLimitMap.get(identifier)

    if (!record) {
      rateLimitMap.set(identifier, {
        attempts: 1,
        lastAttempt: now,
        blocked: false
      })
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: now + this.config.windowMs
      }
    }

    // Check if block period has expired
    if (record.blocked && (now - record.lastAttempt) > this.config.blockDurationMs) {
      record.blocked = false
      record.attempts = 1
      record.lastAttempt = now
      rateLimitMap.set(identifier, record)
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: now + this.config.windowMs
      }
    }

    // If still blocked
    if (record.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.lastAttempt + this.config.blockDurationMs
      }
    }

    // Check if window has expired
    if ((now - record.lastAttempt) > this.config.windowMs) {
      record.attempts = 1
      record.lastAttempt = now
      rateLimitMap.set(identifier, record)
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: now + this.config.windowMs
      }
    }

    // Increment attempts
    record.attempts++
    record.lastAttempt = now

    if (record.attempts > this.config.maxAttempts) {
      record.blocked = true
      rateLimitMap.set(identifier, record)
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + this.config.blockDurationMs
      }
    }

    rateLimitMap.set(identifier, record)
    return {
      allowed: true,
      remaining: this.config.maxAttempts - record.attempts,
      resetTime: now + this.config.windowMs
    }
  }

  // Reset rate limit for successful login
  resetRateLimit(identifier: string): void {
    rateLimitMap.delete(identifier)
  }

  // Get security headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    }
  }

  // Input sanitization
  sanitizeInput(input: string, type: 'email' | 'text' | 'password' = 'text'): string {
    if (!input) return ''
    
    let sanitized = input.trim()
    
    switch (type) {
      case 'email':
        sanitized = sanitized.toLowerCase()
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
          throw new Error('Invalid email format')
        }
        break
      case 'password':
        // Don't trim passwords as spaces might be intentional
        sanitized = input
        if (sanitized.length < 8) {
          throw new Error('Password must be at least 8 characters long')
        }
        break
      case 'text':
        // Remove potentially dangerous characters
        sanitized = sanitized.replace(/[<>'"&]/g, '')
        break
    }
    
    return sanitized
  }

  // Password strength validation
  validatePasswordStrength(password: string): { isValid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push('Password should be at least 8 characters long')

    if (password.length >= 12) score += 1
    else feedback.push('Consider using 12+ characters for better security')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Include uppercase letters')

    if (/[0-9]/.test(password)) score += 1
    else feedback.push('Include numbers')

    if (/[^A-Za-z0-9]/.test(password)) score += 1
    else feedback.push('Include special characters (!@#$%^&*)')

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 1
      feedback.push('Avoid repeating characters')
    }

    if (/^[0-9]+$/.test(password)) {
      score -= 2
      feedback.push('Avoid using only numbers')
    }

    if (/^[a-zA-Z]+$/.test(password)) {
      score -= 1
      feedback.push('Mix letters with numbers and symbols')
    }

    return {
      isValid: score >= 4,
      score: Math.max(0, Math.min(6, score)),
      feedback: feedback
    }
  }
}

// Export singleton instance
export const security = new SecurityManager()

// Middleware function for API routes
export function withSecurity(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Add security headers
    const response = await handler(req)
    const headers = security.getSecurityHeaders()
    
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}

// Rate limiting middleware for auth endpoints
export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>, config?: Partial<SecurityConfig>) {
  const rateLimiter = new SecurityManager(config)

  return async (req: NextRequest): Promise<NextResponse> => {
    const ip = getIp(req)
    const { allowed, remaining, resetTime } = rateLimiter.checkRateLimit(ip)

    if (!allowed) {
      return NextResponse.json(
        { 
          error: 'Too many attempts. Please try again later.',
          resetTime: new Date(resetTime).toISOString()
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString()
          }
        }
      )
    }

    const response = await handler(req)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', resetTime.toString())

    return response
  }
}
