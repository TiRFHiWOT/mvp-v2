# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Environment Setup

Create a `.env.local` file in the project root:

```env
# Pusher Configuration (Required for real-time messaging)
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key_here
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster_here
PUSHER_APP_ID=your_app_id_here
PUSHER_SECRET=your_pusher_secret_here

# AI Chat Configuration (Required for AI Assistant)
GROQ_API_KEY=your_groq_api_key_here

# Google OAuth (Optional - Demo login works without this)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret (Required)
JWT_SECRET=your_random_secret_key_here

# Database (Already configured for SQLite)
DATABASE_URL="file:./dev.db"
```

### Step 2: Get Pusher Credentials (Free)

1. Go to https://pusher.com/
2. Sign up for a free account
3. Create a new app (Channels product)
4. Copy your credentials:
   - App ID
   - Key
   - Secret
   - Cluster
5. Paste them into `.env.local`

### Step 3: Get Groq AI API Key (Free)

1. Go to https://console.groq.com/
2. Sign up for a free account (no credit card required)
3. Click "Create API Key"
4. Copy the key and paste into `GROQ_API_KEY` in `.env.local`

**Note:** The AI Chat uses Groq's Llama 3.1 model. The free tier includes generous rate limits for development and production.

### Step 4: Get Google OAuth Credentials (Optional)

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000`
6. Copy Client ID and Secret to `.env.local`

**Note:** You can skip this step and use the "Demo User" login button!

### Step 5: Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### Step 6: Run the App

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## 🎯 Testing the App

### Option 1: Demo Login (Easiest)
1. Click "Continue as Demo User" on the login page
2. You'll be logged in instantly!

### Option 2: Google Login
1. Click the Google sign-in button
2. Choose your Google account
3. You'll be redirected to the chat interface

### Option 3: Test Real-time Messaging
1. Open two browser windows (or use incognito mode)
2. Login as different users in each window
3. Start chatting - messages appear instantly!

## 📱 What You'll See

### Login Page
- Beautiful gradient background with animated elements
- Feature highlights
- Google login button
- Demo user button

### Chat Interface
- **Left Sidebar**: Dark navigation with icons
- **Middle Panel**: User list with search and "New Message" button
- **Right Panel**: Chat window with messages

### Key Features to Try
- ✅ Send a message
- ✅ See online/offline status
- ✅ Search for users
- ✅ Click emoji button for emoji picker
- ✅ Watch messages appear in real-time

## 🐛 Troubleshooting

### "Loading..." stuck on screen
- Check that Pusher credentials are correct in `.env.local`
- Restart the dev server: `Ctrl+C` then `npm run dev`

### Google login not working
- Verify Google OAuth credentials
- Check authorized redirect URIs
- Or just use Demo User login instead!

### Database errors
- Run `npx prisma db push` again
- Delete `prisma/dev.db` and run `npx prisma db push`

### Port 3000 already in use
- Kill the process: `lsof -ti:3000 | xargs kill -9`
- Or use a different port: `npm run dev -- -p 3001`

## 🎨 Customization

### Change Primary Color
Edit `app/globals.css`:
```css
:root {
  --color-primary: #YOUR_COLOR_HERE;
}
```

### Change App Name
Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your description",
};
```

## 📚 Next Steps

1. **Read the README.md** for full feature list
2. **Check TECHNICAL.md** for implementation details
3. **Explore the code** in `components/` and `app/`
4. **Add new features** - the architecture is ready!

## 🎉 You're All Set!

The app is now running with:
- ✅ Pixel-perfect Figma design
- ✅ Real-time messaging
- ✅ Beautiful UI
- ✅ Google OAuth + Demo login
- ✅ Persistent chat history

Enjoy building! 🚀
