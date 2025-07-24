# 🚀 Complete Setup Guide: Database + Vercel Deployment

## 📋 Pre-Deployment Checklist

- [ ] ✅ Your code is ready and tested locally
- [ ] ✅ Prisma schema updated for PostgreSQL
- [ ] ✅ Environment variables template created
- [ ] ✅ Vercel configuration files ready

## Step 1: Create PostgreSQL Database

### Option A: Supabase (Recommended - Free Tier)

1. **Create Account**: Go to [supabase.com](https://supabase.com) → "Start your project"
2. **New Project**: 
   - Name: `tishope-production`
   - Generate strong password
   - Region: Choose closest to your users
3. **Get Connection String**:
   - Go to Settings → Database
   - Copy the URI format connection string
   - Example: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option B: Neon (Great Alternative)

1. **Create Account**: Go to [neon.tech](https://neon.tech) → Sign up with GitHub
2. **Create Project**: Name it `tishope`, choose your region
3. **Copy Connection String**: From the dashboard connection details

## Step 2: Test Database Connection Locally

1. **Update your local `.env`**:
   ```bash
   # Replace with your actual database URL
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

2. **Test the connection**:
   ```bash
   npm run db:test
   ```
   
   You should see:
   ```
   🔄 Testing database connection...
   ✅ Database connection successful!
   📊 PostgreSQL version: [version info]
   ⚠️ No tables found. Run "npm run db:push" to create tables.
   ```

3. **Generate Prisma client and push schema**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Verify tables were created**:
   ```bash
   npm run db:test
   ```
   
   Should now show: `📋 Existing tables: User, Account, Session, VerificationToken, Order, Payment`

## Step 3: Push to GitHub

```bash
git add .
git commit -m "Configure PostgreSQL database and prepare for Vercel deployment"
git push origin main
```

## Step 4: Deploy to Vercel

### 4.1 Create Vercel Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. **Framework Preset**: Next.js (auto-detected)

### 4.2 Configure Build Settings

- **Build Command**: `npm run vercel-build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 4.3 Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

#### Required Variables:
```bash
# Database
DATABASE_URL=your_database_connection_string_here

# NextAuth (Use the generated secret)
NEXTAUTH_SECRET=L/Oi3/bHOSyZNcOm7tGOEraIwrqzOyzeF1VGYCfIhyc=
NEXTAUTH_URL=https://your-project-name.vercel.app

# Stripe (Get from Stripe Dashboard)
STRIPE_PUBLISHABLE_KEY=pk_live_or_test_your_key
STRIPE_SECRET_KEY=sk_live_or_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

#### Optional OAuth Variables:
```bash
# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth (if using)
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

### 4.4 Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Step 5: Post-Deployment Setup

### 5.1 Set up Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://your-project-name.vercel.app/api/payments/stripe/webhook`
4. **Events to send**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret to Vercel environment variables

### 5.2 Update Environment Variables

Update these in Vercel with your actual deployment URL:
- `NEXTAUTH_URL=https://your-actual-domain.vercel.app`
- `NEXT_PUBLIC_APP_URL=https://your-actual-domain.vercel.app`

### 5.3 Test Your Deployment

Visit your deployed app and test:
- [ ] App loads correctly
- [ ] User registration works
- [ ] Login/logout works
- [ ] OAuth providers work (if configured)
- [ ] Product browsing works
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] Payment processing (test mode)
- [ ] Admin panel access

## Step 6: Custom Domain (Optional)

1. **In Vercel Dashboard**: Go to Settings → Domains
2. **Add Domain**: Enter your custom domain
3. **Configure DNS**: Follow Vercel's instructions
4. **Update Environment Variables**:
   - `NEXTAUTH_URL=https://yourdomain.com`
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.com`

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run db:test` | Test database connection |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Deploy migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run vercel-build` | Build for Vercel deployment |

## 🚨 Troubleshooting

### Database Connection Issues

1. **"connect ECONNREFUSED"**: Check DATABASE_URL format
2. **"password authentication failed"**: Verify password in connection string
3. **"database does not exist"**: Ensure database exists on server

### Build Failures

1. **Check build logs** in Vercel Dashboard → Deployments
2. **Verify environment variables** are all set correctly
3. **Test locally first**: Run `npm run build` locally

### Runtime Errors

1. **Check function logs** in Vercel Dashboard → Functions
2. **Verify database tables exist**: Run `npm run db:test` locally
3. **Check NextAuth configuration**: Ensure NEXTAUTH_URL matches deployment URL

## 🎉 Success!

Once everything is working:
- Your ecommerce app is live on Vercel
- Database is connected and working
- Payments are configured
- Authentication is working
- Admin panel is accessible

Ready to start selling! 🛍️
