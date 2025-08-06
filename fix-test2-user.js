const { PrismaClient } = require('@prisma/client');
const { compare, hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function fixTest2User() {
  try {
    console.log('=== FIXING test2@example.com PASSWORD ===\n');
    
    // Find the problematic user
    const user = await prisma.user.findUnique({
      where: { email: 'test2@example.com' }
    });
    
    if (!user) {
      console.log('❌ User test2@example.com not found');
      return;
    }
    
    console.log('👤 Found user:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Current hash length: ${user.hashedPassword?.length || 0}`);
    
    // Set a known password
    const newPassword = 'password123';
    console.log(`\n🔧 Setting new password: "${newPassword}"`);
    
    // Hash the new password
    const newHashedPassword = await hash(newPassword, 12);
    console.log(`- New hash length: ${newHashedPassword.length}`);
    console.log(`- New hash preview: ${newHashedPassword.substring(0, 20)}...`);
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword: newHashedPassword }
    });
    
    console.log('✅ Password updated in database');
    
    // Verify immediately
    console.log('\n🔍 Verifying new password...');
    const isValid = await compare(newPassword, updatedUser.hashedPassword);
    console.log(`- Direct verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    // Test NextAuth simulation
    console.log('\n🔄 Testing NextAuth simulation...');
    
    const authUser = await prisma.user.findUnique({
      where: { email: 'test2@example.com' }
    });
    
    if (authUser && authUser.hashedPassword) {
      const authCheck = await compare(newPassword, authUser.hashedPassword);
      console.log(`- NextAuth check: ${authCheck ? '✅ VALID' : '❌ INVALID'}`);
      
      if (authCheck) {
        console.log('\n🎉 SUCCESS! User can now login with:');
        console.log(`Email: ${authUser.email}`);
        console.log(`Password: ${newPassword}`);
      } else {
        console.log('\n❌ Authentication still failing');
        
        // Debug: Let's examine the hash more closely
        console.log('\n🔍 Debug information:');
        console.log(`- Hash in DB: ${authUser.hashedPassword}`);
        console.log(`- Hash parts: ${authUser.hashedPassword.split('$').length} parts`);
        console.log(`- Algorithm: ${authUser.hashedPassword.split('$')[1]}`);
        console.log(`- Rounds: ${authUser.hashedPassword.split('$')[2]}`);
        
        // Try creating another hash and compare
        const testHash = await hash(newPassword, 12);
        console.log(`- Test hash: ${testHash}`);
        console.log(`- Test comparison: ${await compare(newPassword, testHash)}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTest2User();
