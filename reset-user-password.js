const { PrismaClient } = require('@prisma/client');
const { hash, compare } = require('bcryptjs');

const prisma = new PrismaClient();

async function resetUserPassword() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('Usage: node reset-user-password.js <email> <new-password>');
      console.log('Example: node reset-user-password.js user@example.com newpassword123');
      return;
    }
    
    const [email, newPassword] = args;
    
    console.log('=== PASSWORD RESET UTILITY ===\n');
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword.replace(/./g, '*')}`);
    console.log();
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Name: ${user.name || 'N/A'}`);
    console.log(`- Email: ${user.email}`);
    console.log();
    
    // Hash the new password
    console.log('🔧 Hashing new password...');
    const hashedPassword = await hash(newPassword, 12);
    
    // Update the user
    console.log('💾 Updating database...');
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword }
    });
    
    // Verify the change
    console.log('🔍 Verifying password reset...');
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    const isValid = await compare(newPassword, updatedUser.hashedPassword);
    
    if (isValid) {
      console.log('✅ Password reset successful!');
      console.log('\n📧 User can now login with:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${newPassword}`);
    } else {
      console.log('❌ Password reset failed - verification unsuccessful');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUserPassword();
