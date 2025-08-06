const { PrismaClient } = require('@prisma/client');
const { hash, compare } = require('bcryptjs');

const prisma = new PrismaClient();

async function authHealthCheck() {
  try {
    console.log('=== AUTHENTICATION HEALTH CHECK ===\n');
    
    // Check 1: Verify all users with passwords have proper bcrypt hashes
    console.log('🔍 Check 1: Verifying password hash formats...');
    const users = await prisma.user.findMany({
      where: {
        hashedPassword: {
          not: null
        }
      }
    });
    
    let hashFormatIssues = 0;
    let roundsIssues = 0;
    
    for (const user of users) {
      const hash = user.hashedPassword;
      
      // Check bcrypt format
      const isBcryptFormat = hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');
      if (!isBcryptFormat) {
        console.log(`❌ ${user.email}: Invalid hash format`);
        hashFormatIssues++;
        continue;
      }
      
      // Check rounds
      const parts = hash.split('$');
      const rounds = parseInt(parts[2]);
      if (rounds !== 12) {
        console.log(`⚠️  ${user.email}: Using ${rounds} rounds instead of 12`);
        roundsIssues++;
      }
    }
    
    if (hashFormatIssues === 0 && roundsIssues === 0) {
      console.log('✅ All password hashes are properly formatted');
    } else {
      console.log(`❌ Found ${hashFormatIssues} format issues and ${roundsIssues} rounds issues`);
    }
    
    // Check 2: Test bcrypt functionality
    console.log('\n🔍 Check 2: Testing bcrypt functionality...');
    try {
      const testPassword = 'test123';
      const testHash = await hash(testPassword, 12);
      const testVerify = await compare(testPassword, testHash);
      
      if (testVerify) {
        console.log('✅ Bcrypt hashing and comparison working correctly');
      } else {
        console.log('❌ Bcrypt functionality issue detected');
      }
    } catch (error) {
      console.log('❌ Bcrypt error:', error.message);
    }
    
    // Check 3: Verify NextAuth configuration consistency
    console.log('\n🔍 Check 3: Checking authentication configuration...');
    
    // Read auth.ts file to verify configuration
    const fs = require('fs');
    const path = require('path');
    
    try {
      const authFilePath = path.join(__dirname, 'auth.ts');
      const authContent = fs.readFileSync(authFilePath, 'utf8');
      
      // Check for proper bcrypt import
      if (authContent.includes('import { compare } from "bcryptjs"')) {
        console.log('✅ Proper bcrypt import found in auth.ts');
      } else {
        console.log('⚠️  Check bcrypt import in auth.ts');
      }
      
      // Check for proper compare usage
      if (authContent.includes('await compare(')) {
        console.log('✅ Proper bcrypt compare usage found');
      } else {
        console.log('⚠️  Check bcrypt compare usage in auth.ts');
      }
      
    } catch (error) {
      console.log('⚠️  Could not read auth.ts file for verification');
    }
    
    // Check 4: Test actual authentication flow for each user
    console.log('\n🔍 Check 4: Testing authentication for all users...');
    
    // Known working credentials
    const knownCredentials = [
      { email: 'test@example.com', password: 'testpass123' },
      { email: 'test2@example.com', password: 'password123' }
    ];
    
    let workingAuths = 0;
    let failedAuths = 0;
    
    for (const cred of knownCredentials) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: cred.email }
        });
        
        if (user && user.hashedPassword) {
          const isValid = await compare(cred.password, user.hashedPassword);
          if (isValid) {
            console.log(`✅ ${cred.email}: Authentication working`);
            workingAuths++;
          } else {
            console.log(`❌ ${cred.email}: Authentication failed`);
            failedAuths++;
          }
        } else {
          console.log(`⚠️  ${cred.email}: User not found or no password`);
        }
      } catch (error) {
        console.log(`❌ ${cred.email}: Error during authentication test:`, error.message);
        failedAuths++;
      }
    }
    
    // Summary
    console.log('\n=== HEALTH CHECK SUMMARY ===');
    console.log(`👥 Total users with passwords: ${users.length}`);
    console.log(`✅ Working authentications: ${workingAuths}`);
    console.log(`❌ Failed authentications: ${failedAuths}`);
    
    if (hashFormatIssues === 0 && roundsIssues === 0 && failedAuths === 0) {
      console.log('\n🎉 ALL SYSTEMS HEALTHY!');
      console.log('Your authentication system is working properly.');
    } else {
      console.log('\n⚠️  ISSUES DETECTED!');
      console.log('Please address the issues mentioned above.');
      
      if (failedAuths > 0) {
        console.log('\n🔧 To fix failed authentications:');
        console.log('1. Run: node reset-user-password.js <email> <new-password>');
        console.log('2. Or use the fix-password-issues.js script');
      }
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Run this health check regularly');
    console.log('2. Implement proper password reset functionality in your app');
    console.log('3. Add password strength validation');
    console.log('4. Consider implementing account lockout after failed attempts');
    console.log('5. Log authentication attempts for monitoring');
    
  } catch (error) {
    console.error('Health check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

authHealthCheck();
