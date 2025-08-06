import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  // Note: Don't use PrismaAdapter with JWT strategy and Credentials provider
  // adapter: PrismaAdapter(prisma),
  providers: [
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email", 
          placeholder: "your.email@example.com" 
        },
        password: { 
          label: "Password", 
          type: "password" 
        },
      },
      async authorize(credentials) {
        console.log('🔐 Auth attempt:', { email: credentials?.email, hasPassword: !!credentials?.password })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        console.log('👤 User found:', { exists: !!user, hasPassword: !!user?.hashedPassword })

        if (!user || !user.hashedPassword) {
          console.log('❌ User not found or no password')
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.hashedPassword
        )

        console.log('🔑 Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('❌ Invalid password')
          return null
        }

        console.log('✅ Login successful for:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),
    
    // Google OAuth Provider
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    
    // Facebook OAuth Provider
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET ? [
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      })
    ] : []),
  ],
  
  session: {
    strategy: "jwt" as const,
  },
  
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        
        // Ensure user exists in database for JWT sessions
        if (token.id) {
          const existingUser = await prisma.user.findUnique({
            where: { id: token.id as string }
          })
          
          // If user doesn't exist in DB (shouldn't happen with proper setup), 
          // but let's be safe and find by email instead
          if (!existingUser && session.user.email) {
            const userByEmail = await prisma.user.findUnique({
              where: { email: session.user.email }
            })
            
            if (userByEmail) {
              session.user.id = userByEmail.id
              token.id = userByEmail.id
            }
          }
        }
      }
      return session
    },
  },
  
  pages: {
    signIn: "/auth/signin",
  },
  
  debug: process.env.NODE_ENV === "development",
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
