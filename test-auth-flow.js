const { PrismaClient } = require('@prisma/client');
const { compare, hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuthFlow() {
  try {
    console.log('=== COMPREHENSIVE AUTHENTICATION TEST ===\n');
    
    // Get all users with passwords
    const users = await prisma.user.findMany({
      where: {
        hashedPassword: {
          not: null
        }
      }
    });
    
    console.log(`Testing authentication for ${users.length} users...\n`);
    
    // Test passwords that users might commonly use
    const commonPasswords = [
      'testpass123',
      'password123',
      'test123',
      'admin123',
      '123456',
      'password',
      'user123'
    ];
    
    const authResults = [];
    
    for (const user of users) {
      console.log(`\n🔐 Testing user: ${user.email}`);
      console.log(`- User ID: ${user.id}`);
      console.log(`- Hash preview: ${user.hashedPassword.substring(0, 20)}...`);
      
      let passwordFound = false;
      let correctPassword = null;
      
      // Test each common password
      for (const testPassword of commonPasswords) {
        try {
          const isValid = await compare(testPassword, user.hashedPassword);
          if (isValid) {
            console.log(`✅ Password found: "${testPassword}"`);
            passwordFound = true;
            correctPassword = testPassword;
            break;
          }
        } catch (error) {
          console.log(`❌ Error testing password "${testPassword}":`, error.message);
          authResults.push({
            email: user.email,
            issue: `Hash comparison error with password "${testPassword}"`,
            error: error.message
          });
        }
      }
      
      if (!passwordFound) {
        console.log('❌ No matching password found from common passwords');
        authResults.push({
          email: user.email,
          issue: 'No matching password found',
          testedPasswords: commonPasswords
        });
      } else {
        // Test the NextAuth flow simulation
        console.log('\n🔄 Simulating NextAuth authorization flow...');
        
        try {
          // Simulate the exact logic from auth.ts
          const authUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
          
          if (!authUser || !authUser.hashedPassword) {
            console.log('❌ Auth simulation failed: User not found or no password');
            authResults.push({
              email: user.email,
              issue: 'Auth simulation failed: User not found or no password'
            });
          } else {
            const isPasswordValid = await compare(correctPassword, authUser.hashedPassword);
            if (isPasswordValid) {
              console.log('✅ NextAuth simulation successful');
              authResults.push({
                email: user.email,
                status: 'success',
                password: correctPassword
              });
            } else {
              console.log('❌ NextAuth simulation failed: Password mismatch');
              authResults.push({
                email: user.email,
                issue: 'NextAuth simulation failed: Password mismatch'
              });
            }
          }
        } catch (error) {
          console.log('❌ NextAuth simulation error:', error.message);
          authResults.push({
            email: user.email,
            issue: 'NextAuth simulation error',
            error: error.message
          });
        }
      }
      
      console.log('─'.repeat(60));
    }
    
    // Summary
    console.log('\n=== AUTHENTICATION TEST SUMMARY ===');
    const successfulAuths = authResults.filter(r => r.status === 'success');
    const failedAuths = authResults.filter(r => r.issue);
    
    console.log(`✅ Successful authentications: ${successfulAuths.length}`);
    console.log(`❌ Failed authentications: ${failedAuths.length}`);
    
    if (successfulAuths.length > 0) {
      console.log('\n✅ WORKING CREDENTIALS:');
      successfulAuths.forEach(auth => {
        console.log(`- ${auth.email}: "${auth.password}"`);
      });
    }
    
    if (failedAuths.length > 0) {
      console.log('\n❌ AUTHENTICATION ISSUES:');
      failedAuths.forEach((auth, index) => {
        console.log(`${index + 1}. ${auth.email}`);
        console.log(`   Issue: ${auth.issue}`);
        if (auth.error) {
          console.log(`   Error: ${auth.error}`);
        }
      });
    }
    
    // Check for potential hash corruption
    console.log('\n🔍 CHECKING FOR HASH CORRUPTION...');
    for (const user of users) {
      try {
        // Try to create a new hash with the same settings and see if there are any issues
        const testHash = await hash('test123', 12);
        const testCompare = await compare('test123', testHash);
        
        if (!testCompare) {
          console.log(`⚠️  Hash function issue detected for bcrypt operations`);
        }
        
        // Check the user's hash structure
        const parts = user.hashedPassword.split('$');
        if (parts.length !== 4) {
          console.log(`⚠️  Invalid hash structure for ${user.email}: ${parts.length} parts instead of 4`);
        }
        
      } catch (error) {
        console.log(`❌ Hash corruption check failed for ${user.email}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthFlow();
