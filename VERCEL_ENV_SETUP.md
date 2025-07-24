# Vercel Environment Variables Setup

## Required Environment Variables for Your TISHOPE App

### 1. Database Variables (Auto-added by Vercel Postgres)
When you connect your `tishope-db` to your project, Vercel automatically adds:
- `POSTGRES_URL` - Direct connection
- `POSTGRES_PRISMA_URL` - For Prisma (use this as DATABASE_URL)
- `POSTGRES_URL_NON_POOLING` - For migrations

### 2. Set DATABASE_URL to Use Prisma URL
In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL
$POSTGRES_PRISMA_URL
```

### 3. NextAuth Configuration
```
NEXTAUTH_SECRET
L/Oi3/bHOSyZNcOm7tGOEraIwrqzOyzeF1VGYCfIhyc=

NEXTAUTH_URL
https://your-project-name.vercel.app
```

### 4. Stripe Configuration (Test Keys)
```
STRIPE_PUBLISHABLE_KEY
pk_test_your_stripe_publishable_key

STRIPE_SECRET_KEY
sk_test_your_stripe_secret_key

STRIPE_WEBHOOK_SECRET
whsec_your_webhook_secret
```

### 5. App Settings
```
NODE_ENV
production

NEXT_PUBLIC_APP_URL
https://your-project-name.vercel.app
```

## Important Notes:

1. **Use `$POSTGRES_PRISMA_URL`** as the value for `DATABASE_URL` - this references the auto-generated Vercel Postgres variable
2. **Replace `your-project-name`** with your actual Vercel project name
3. **Get Stripe keys** from your Stripe Dashboard (use test keys initially)
4. **The webhook secret** will be generated after you set up Stripe webhooks

## Next Steps After Setting Environment Variables:

1. **Redeploy** your Vercel project to pick up the new environment variables
2. **Set up database tables** using Prisma
3. **Configure Stripe webhooks**
4. **Test your deployment**
