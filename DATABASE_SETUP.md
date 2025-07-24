# Database Setup Guide

## 🗄️ Supabase Setup (Recommended)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### Step 2: Create New Project
1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: `tishope-db` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

### Step 3: Get Connection String
1. Go to Settings → Database
2. Find "Connection string" section
3. Copy the URI format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your database password

### Step 4: Configure Connection Pooling (Recommended)
1. In Settings → Database
2. Find "Connection pooling" section
3. Copy the pooled connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
   ```

## 🗄️ Alternative: Neon (Also Great Free Option)

### Step 1: Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub

### Step 2: Create Database
1. Click "Create a project"
2. Choose:
   - **Name**: `tishope`
   - **Region**: Closest to your users
   - **PostgreSQL Version**: Latest (16)

### Step 3: Get Connection String
1. Go to Dashboard
2. Click on your database
3. Copy the connection string from "Connection Details"

## 🗄️ Alternative: PlanetScale

### Step 1: Create PlanetScale Account
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub

### Step 2: Create Database
1. Click "Create database"
2. Name: `tishope`
3. Region: Choose closest to your users

### Step 3: Get Connection String
1. Go to your database dashboard
2. Click "Connect"
3. Select "Prisma" from framework dropdown
4. Copy the DATABASE_URL

## ⚙️ Database Configuration Tips

### For Production:
- Use connection pooling when available
- Choose the region closest to your Vercel deployment
- Enable SSL (usually enabled by default)

### Security:
- Use strong passwords
- Limit database access to your IP if possible
- Enable row-level security if supported

## 🔧 Next Steps After Database Creation

1. **Update your `.env` file** with the connection string
2. **Test the connection** locally
3. **Run Prisma migrations** to create tables
4. **Add the DATABASE_URL** to Vercel environment variables
