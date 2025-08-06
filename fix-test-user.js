const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function fixTestUser() {
  try {
    console.log('🔧 Fixing test user password...');
    
    // Create a fresh hash for the password
    const newHashedPassword = await hash('testpass123', 12);
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { hashedPassword: newHashedPassword }
    });
    
    console.log('✅ Test user password updated successfully!');
    console.log(`- User ID: ${updatedUser.id}`);
    console.log(`- Email: ${updatedUser.email}`);
    
    // Test the new password
    const { compare } = require('bcryptjs');
    const isValid = await compare('testpass123', updatedUser.hashedPassword);
    console.log(`- Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (isValid) {
      console.log('\n🎉 You can now login with:');
      console.log('Email: test@example.com');
      console.log('Password: testpass123');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTestUser();
