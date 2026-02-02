# Deployment Guide

## 🚀 Deploy to Production

This guide will help you deploy the ChatAI MVP to production on Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Pusher account (free tier works)
- Google OAuth credentials (optional)
- PostgreSQL database (Vercel provides free tier)

## Step 1: Prepare the Code

### 1.1 Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ChatAI MVP"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/chatai-mvp.git
git branch -M main
git push -u origin main
```

### 1.2 Update Database Configuration

In `prisma/schema.prisma`, the datasource is ready for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"  // Change from sqlite to postgresql
  url      = env("DATABASE_URL")
}
```

## Step 2: Set Up Vercel

### 2.1 Import Project

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository you just pushed

### 2.2 Configure Build Settings

Vercel will auto-detect Next.js. Verify these settings:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 2.3 Add Environment Variables

In Vercel project settings, add these environment variables:

```env
# Pusher Configuration
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret

# Google OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret
JWT_SECRET=generate_a_strong_random_secret_here

# Database (Vercel Postgres)
DATABASE_URL=postgresql://...
```

## Step 3: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. In your Vercel project, go to "Storage"
2. Click "Create Database"
3. Select "Postgres"
4. Choose a name (e.g., "chatai-db")
5. Select region closest to your users
6. Click "Create"

Vercel will automatically add `DATABASE_URL` to your environment variables.

### Option B: External PostgreSQL

Use any PostgreSQL provider:
- Supabase (free tier)
- Railway (free tier)
- Neon (free tier)
- AWS RDS
- DigitalOcean

Get the connection string and add it as `DATABASE_URL`.

## Step 4: Run Database Migrations

### 4.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 4.2 Link Project

```bash
vercel link
```

### 4.3 Pull Environment Variables

```bash
vercel env pull .env.local
```

### 4.4 Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or use migrations for production
npx prisma migrate deploy
```

## Step 5: Update Google OAuth

### 5.1 Add Production URL

1. Go to Google Cloud Console
2. Navigate to your OAuth credentials
3. Add authorized redirect URIs:
   ```
   https://your-app.vercel.app
   https://your-custom-domain.com (if using custom domain)
   ```

## Step 6: Deploy

### 6.1 Deploy via Vercel Dashboard

Click "Deploy" in Vercel dashboard. Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the application
4. Deploy to production

### 6.2 Deploy via CLI

```bash
vercel --prod
```

## Step 7: Verify Deployment

### 7.1 Check Build Logs

In Vercel dashboard, check the deployment logs for any errors.

### 7.2 Test the Application

1. Visit your production URL
2. Test login (Google OAuth and Demo User)
3. Send messages between users
4. Verify real-time functionality

## Step 8: Custom Domain (Optional)

### 8.1 Add Domain in Vercel

1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 8.2 Update OAuth Redirect URIs

Add your custom domain to Google OAuth authorized URIs.

## Production Checklist

### Security ✅
- [ ] Strong JWT secret generated
- [ ] Environment variables secured
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Rate limiting (consider adding)

### Performance ✅
- [ ] Database indexes created
- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] Caching configured

### Monitoring ✅
- [ ] Error tracking (consider Sentry)
- [ ] Analytics (consider Vercel Analytics)
- [ ] Uptime monitoring
- [ ] Database monitoring

### Backup ✅
- [ ] Database backup strategy
- [ ] Code in version control
- [ ] Environment variables documented

## Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
```bash
# Add to package.json
"scripts": {
  "postinstall": "prisma generate"
}
```

**Error: Module not found**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

**Error: Can't reach database server**
- Check DATABASE_URL is correct
- Verify database is accessible from Vercel
- Check firewall rules

### WebSocket Issues

**Error: Pusher connection failed**
- Verify Pusher credentials
- Check CORS settings in Pusher dashboard
- Ensure cluster is correct

### OAuth Issues

**Error: Redirect URI mismatch**
- Add production URL to Google OAuth settings
- Check for http vs https
- Verify exact URL match

## Environment Variables Reference

### Required
```env
DATABASE_URL              # PostgreSQL connection string
JWT_SECRET               # Random secret for JWT signing
NEXT_PUBLIC_PUSHER_KEY   # Pusher app key
NEXT_PUBLIC_PUSHER_CLUSTER # Pusher cluster (e.g., us2)
PUSHER_APP_ID            # Pusher app ID
PUSHER_SECRET            # Pusher secret key
```

### Optional
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID  # Google OAuth client ID
GOOGLE_CLIENT_SECRET          # Google OAuth secret
```

## Scaling Considerations

### Database
- Start with Vercel Postgres free tier
- Upgrade as needed based on usage
- Consider read replicas for high traffic

### Pusher
- Free tier: 100 concurrent connections
- Upgrade for more connections
- Consider self-hosted WebSocket for scale

### Vercel
- Free tier: Good for MVP and testing
- Pro tier: For production apps
- Enterprise: For high-traffic applications

## Monitoring & Analytics

### Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking (Sentry)
```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically deploys
```

### Preview Deployments
- Every pull request gets a preview URL
- Test changes before merging
- Share with team for review

## Cost Estimation

### Free Tier (Good for MVP)
- Vercel: Free (with limits)
- Vercel Postgres: Free tier available
- Pusher: Free (100 concurrent connections)
- Google OAuth: Free

### Paid Tier (Production)
- Vercel Pro: $20/month
- Database: $5-20/month
- Pusher: $49/month (500 connections)
- Total: ~$75-90/month

## Post-Deployment

### 1. Test Everything
- [ ] Login functionality
- [ ] Real-time messaging
- [ ] User list
- [ ] Search
- [ ] Mobile responsiveness

### 2. Monitor Performance
- [ ] Check Vercel Analytics
- [ ] Monitor database queries
- [ ] Watch error logs

### 3. Gather Feedback
- [ ] Share with users
- [ ] Collect feedback
- [ ] Iterate and improve

## Rollback Strategy

If deployment fails:

```bash
# Revert to previous deployment in Vercel dashboard
# Or redeploy previous commit
git revert HEAD
git push
```

## Support

- Vercel Docs: https://vercel.com/docs
- Pusher Docs: https://pusher.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

## 🎉 Congratulations!

Your ChatAI MVP is now live in production!

Share the URL with users and start collecting feedback for the next iteration.

---

**Need Help?**
- Check Vercel deployment logs
- Review error messages carefully
- Consult documentation
- Test locally first with production environment variables
