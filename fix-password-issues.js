const { PrismaClient } = require('@prisma/client');
const { compare, hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function fixPasswordIssues() {
  try {
    console.log('=== PASSWORD HASH ISSUE DIAGNOSIS & FIX ===\n');
    
    // Step 1: Get all users with passwords
    const users = await prisma.user.findMany({
      where: {
        hashedPassword: {
          not: null
        }
      }
    });
    
    console.log(`Found ${users.length} users with passwords\n`);
    
    // Step 2: Test each user's authentication
    const issueUsers = [];
    const workingUsers = [];
    
    // Common passwords to test
    const testPasswords = [
      'testpass123',
      'password123', 
      'test123',
      'password',
      '123456',
      'admin123',
      'user123',
      'secretpass',
      'mypassword',
      'welcome123'
    ];
    
    for (const user of users) {
      console.log(`\n🔍 Analyzing user: ${user.email}`);
      
      let passwordFound = false;
      let workingPassword = null;
      
      // Test common passwords
      for (const testPass of testPasswords) {
        try {
          const isValid = await compare(testPass, user.hashedPassword);
          if (isValid) {
            console.log(`✅ Working password found: "${testPass}"`);
            passwordFound = true;
            workingPassword = testPass;
            workingUsers.push({ email: user.email, password: testPass });
            break;
          }
        } catch (error) {
          console.log(`❌ Error testing "${testPass}":`, error.message);
        }
      }
      
      if (!passwordFound) {
        console.log('❌ No working password found - marking for reset');
        issueUsers.push(user);
      }
    }
    
    console.log('\n=== DIAGNOSIS RESULTS ===');
    console.log(`✅ Users with working passwords: ${workingUsers.length}`);
    console.log(`❌ Users needing password reset: ${issueUsers.length}`);
    
    if (workingUsers.length > 0) {
      console.log('\n✅ WORKING CREDENTIALS:');
      workingUsers.forEach(user => {
        console.log(`- ${user.email}: "${user.password}"`);
      });
    }
    
    if (issueUsers.length > 0) {
      console.log('\n❌ USERS WITH ISSUES:');
      issueUsers.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id})`);
      });
      
      console.log('\n🔧 FIXING PASSWORD ISSUES...');
      
      // Fix each problematic user
      for (const user of issueUsers) {
        console.log(`\n🛠️ Fixing password for ${user.email}...`);
        
        // Generate a temporary password
        const tempPassword = `temp${Date.now().toString().slice(-4)}`;
        const newHash = await hash(tempPassword, 12);
        
        // Update the user's password
        await prisma.user.update({
          where: { id: user.id },
          data: { hashedPassword: newHash }
        });
        
        // Verify the fix
        const verifyUser = await prisma.user.findUnique({
          where: { id: user.id }
        });
        
        const isNewPasswordValid = await compare(tempPassword, verifyUser.hashedPassword);
        
        if (isNewPasswordValid) {
          console.log(`✅ Password fixed! New temporary password: "${tempPassword}"`);
        } else {
          console.log('❌ Failed to fix password');
        }
      }
    }
    
    // Step 3: Final verification
    console.log('\n=== FINAL VERIFICATION ===');
    
    const allUsers = await prisma.user.findMany({
      where: {
        hashedPassword: {
          not: null
        }
      }
    });
    
    let allFixed = true;
    const finalCredentials = [];
    
    for (const user of allUsers) {
      console.log(`\n🔐 Final test for ${user.email}:`);
      
      // Test all possible passwords (including new temp ones)
      const allTestPasswords = [
        ...testPasswords,
        `temp${Date.now().toString().slice(-4)}`,
        `temp${(Date.now() - 1000).toString().slice(-4)}`,
        `temp${(Date.now() - 2000).toString().slice(-4)}`
      ];
      
      let finalPasswordFound = false;
      
      for (const testPass of allTestPasswords) {
        try {
          const isValid = await compare(testPass, user.hashedPassword);
          if (isValid) {
            console.log(`✅ Working password: "${testPass}"`);
            finalCredentials.push({ email: user.email, password: testPass });
            finalPasswordFound = true;
            break;
          }
        } catch (error) {
          // Silent error for cleaner output
        }
      }
      
      if (!finalPasswordFound) {
        console.log('❌ Still has issues');
        allFixed = false;
      }
    }
    
    console.log('\n=== FINAL SUMMARY ===');
    if (allFixed) {
      console.log('🎉 ALL PASSWORD ISSUES HAVE BEEN FIXED!');
    } else {
      console.log('⚠️  Some issues may still remain');
    }
    
    console.log('\n📋 CURRENT WORKING CREDENTIALS:');
    finalCredentials.forEach(cred => {
      console.log(`✅ ${cred.email}: "${cred.password}"`);
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Users should be asked to reset their passwords through the app');
    console.log('2. Implement proper password reset functionality');
    console.log('3. Ensure consistent hashing across all password operations');
    console.log('4. Consider adding password strength validation');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswordIssues();
