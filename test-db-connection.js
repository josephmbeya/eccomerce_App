const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Testing database connection...')
    
    // Test the connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT version();`
    console.log('📊 PostgreSQL version:', result[0]?.version || 'Unknown')
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Run "npm run db:push" to create tables.')
    } else {
      console.log('📋 Existing tables:', tables.map(t => t.table_name).join(', '))
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('💡 Tip: Make sure your DATABASE_URL is correct and the database is accessible.')
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Tip: Check your database password in the connection string.')
    }
    
    if (error.message.includes('does not exist')) {
      console.log('💡 Tip: Make sure the database exists on your PostgreSQL server.')
    }
    
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
