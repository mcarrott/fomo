# Deployment Guide

This application uses Supabase for backend services and can be deployed to any static hosting platform.

## Required Environment Variables

Before deploying, you MUST configure these environment variables in your hosting platform:

```
VITE_SUPABASE_URL=https://myzukjpxzqomybamqdjw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15enVranB4enFvbXliYW1xZGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Mjk0OTEsImV4cCI6MjA3NjMwNTQ5MX0.3-X1QvV9vnFDCYNATfQKVlNezx6V-dKAjYpDOBwHrzg
```

## Deployment Instructions

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Site settings → Environment variables
5. Deploy

Or use Netlify CLI:
```bash
netlify deploy --prod
```

### Vercel

1. Connect your repository to Vercel
2. Vercel will auto-detect Vite configuration
3. Add environment variables in Project Settings → Environment Variables
4. Deploy

Or use Vercel CLI:
```bash
vercel --prod
```

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize: `firebase init hosting`
3. Set public directory to `dist`
4. Configure as single-page app: Yes
5. Build: `npm run build`
6. Deploy: `firebase deploy --only hosting`

Note: Firebase hosting is just for static files. Your backend remains on Supabase.

### Other Platforms

For any static hosting platform:
- Build command: `npm run build`
- Output directory: `dist`
- Add the two environment variables above
- Enable SPA redirect (all routes → index.html)

## Testing Before Deployment

```bash
npm run build
npm run preview
```

## Troubleshooting

**Error: Missing Supabase environment variables**
- Ensure both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set
- Variable names must match exactly (case-sensitive)
- Restart your build after adding variables

**App shows blank page**
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure your deployment platform serves index.html for all routes

**Database connection fails**
- Verify your Supabase project is active
- Check that the Supabase URL and key are correct
- Ensure no trailing slashes in VITE_SUPABASE_URL
