# StudyFlow Deployment Instructions

## ⚠️ CRITICAL: Environment Variables Required

This app uses **OpenRouter API** for Mistral AI integration. You MUST configure these environment variables in your deployment platform:

### Required Environment Variables:

```
VITE_GOOGLE_AI_KEY=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
VITE_YOUTUBE_API_KEY=AIzaSyBQPe014hsgMViSzah-93_p24d30_I7a64
VITE_SUPABASE_URL=https://boakwacemdiqpayoixfa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYWt3YWNlbWRpcXBheW9peGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTkyOTAsImV4cCI6MjA3MjIzNTI5MH0.MStSGJVf3OlK1SZzxvAzOA-ypytfb0jOf0nnchbU2rY
```

## Platform-Specific Instructions:

### Vercel:
1. Go to Project Settings → Environment Variables
2. Add each variable above
3. Redeploy with "Clear Cache" checked

### Netlify:
1. Go to Site Settings → Environment Variables
2. Add each variable above  
3. Trigger deploy → Clear cache and deploy

### GitHub Pages:
1. Go to Repository Settings → Secrets and Variables → Actions
2. Add each variable as a repository secret
3. Trigger new deployment

## 🚨 Common Issues:

- **401 Error**: Environment variables not set in deployment platform
- **Supabase Error**: VITE_SUPABASE_* variables not configured
- **Cache Issues**: Deploy without cache to force fresh build

## API Details:
- **AI Provider**: OpenRouter (mistralai/mistral-7b-instruct)
- **API Endpoint**: https://openrouter.ai/api/v1/chat/completions
- **Required Headers**: HTTP-Referer, X-Title, Authorization

## Testing:
- Local: Uses .env file (works)
- Deployment: Requires platform environment variables