const { PrismaClient } = require('@prisma/client');
const { compare, hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('=== CHECKING ALL USERS FOR PASSWORD HASH ISSUES ===\n');
    
    // Get all users with passwords
    const users = await prisma.user.findMany({
      where: {
        hashedPassword: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        hashedPassword: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${users.length} users with passwords\n`);
    
    const issues = [];
    
    for (const user of users) {
      console.log(`\n👤 Checking user: ${user.email}`);
      console.log(`- ID: ${user.id}`);
      console.log(`- Name: ${user.name || 'N/A'}`);
      console.log(`- Created: ${user.createdAt}`);
      
      // Check hash format and length
      const hash = user.hashedPassword;
      console.log(`- Hash length: ${hash.length}`);
      console.log(`- Hash starts with: ${hash.substring(0, 7)}...`);
      
      // Check if it's a proper bcrypt hash
      const isBcryptFormat = hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');
      console.log(`- Is bcrypt format: ${isBcryptFormat ? '✅' : '❌'}`);
      
      if (!isBcryptFormat) {
        issues.push({
          user: user.email,
          issue: 'Invalid bcrypt format',
          hash: hash.substring(0, 50) + '...'
        });
        console.log('❌ ISSUE: Hash is not in bcrypt format!');
      }
      
      // Check bcrypt rounds
      if (isBcryptFormat) {
        const rounds = hash.split('$')[2];
        console.log(`- Bcrypt rounds: ${rounds}`);
        
        if (parseInt(rounds) !== 12) {
          issues.push({
            user: user.email,
            issue: `Inconsistent bcrypt rounds: ${rounds} (expected: 12)`,
            hash: hash.substring(0, 50) + '...'
          });
          console.log(`⚠️  WARNING: Using ${rounds} rounds instead of 12`);
        }
      }
      
      console.log('─'.repeat(50));
    }
    
    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total users checked: ${users.length}`);
    console.log(`Issues found: ${issues.length}`);
    
    if (issues.length > 0) {
      console.log('\n🚨 ISSUES DETECTED:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.user}: ${issue.issue}`);
        console.log(`   Hash preview: ${issue.hash}`);
      });
      
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('1. Re-hash passwords with consistent bcrypt rounds (12)');
      console.log('2. Ensure all registration/password update flows use the same hashing method');
      console.log('3. Consider running a migration to fix existing inconsistent hashes');
    } else {
      console.log('✅ No issues found! All password hashes are consistent.');
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();
