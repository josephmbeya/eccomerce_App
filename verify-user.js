const { PrismaClient } = require('@prisma/client');
const { compare } = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyUser() {
  try {
    console.log('=== VERIFYING TEST USER ===');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Has Password: ${!!user.hashedPassword}`);
    console.log(`- Created: ${user.createdAt}`);
    
    // Test password verification
    if (user.hashedPassword) {
      const isValid = await compare('testpass123', user.hashedPassword);
      console.log(`- Password Verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isValid) {
        console.log('\n🔧 Fixing password...');
        const { hash } = require('bcryptjs');
        const newHashedPassword = await hash('testpass123', 12);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { hashedPassword: newHashedPassword }
        });
        
        console.log('✅ Password updated successfully!');
      }
    } else {
      console.log('❌ No password hash found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser();
