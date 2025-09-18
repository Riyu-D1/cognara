# 🚨 Development Mode - Authentication Bypass

## Current Status: AUTHENTICATION DISABLED

Authentication has been temporarily disabled to allow frontend development without OAuth login issues.

## How It Works

- A `BYPASS_AUTH` constant in `/App.tsx` controls authentication
- When `true`: Uses a mock user and skips all authentication
- When `false`: Normal authentication flow with Supabase
- Yellow banner shows when auth is bypassed

## Mock User Details

```javascript
const mockUser = {
  id: 'dev-user-123',
  name: 'Dev User',
  email: 'developer@Cognara.com',
  avatar_url: null,
  provider: 'mock'
};
```

## How to Toggle

### To Enable Authentication (when OAuth is fixed):
1. Open `/App.tsx`
2. Change: `const BYPASS_AUTH = true;` to `const BYPASS_AUTH = false;`
3. Save the file

### To Disable Authentication (current state):
1. Open `/App.tsx`  
2. Change: `const BYPASS_AUTH = false;` to `const BYPASS_AUTH = true;`
3. Save the file

## What's Still Available

✅ **Full frontend functionality:**
- Dashboard with all features
- Notes page with rich text editing
- Flashcards creation and study mode
- Quiz generation and taking
- Settings page (shows mock user info)
- All navigation and UI components

✅ **All authentication code preserved:**
- AuthProvider component intact
- AuthPage component intact
- All Supabase client functions preserved
- OAuth troubleshooting guides maintained

## What's Different in Dev Mode

- Yellow warning banner at the top
- Mock user information in settings
- No real data persistence (unless backend is connected)
- Sign out button logs to console instead of actual logout

## Re-enabling Authentication

When you're ready to fix and re-enable authentication:

1. Set `BYPASS_AUTH = false` in `/App.tsx`
2. Follow the OAuth troubleshooting guide in `/OAUTH_TROUBLESHOOTING.md`
3. Test email authentication (should work immediately)
4. Configure OAuth providers as needed

## Benefits of This Approach

- ✅ No authentication code deleted
- ✅ Easy one-line toggle to switch modes
- ✅ Clear visual indication when bypassed
- ✅ All components still work with mock data
- ✅ Can focus on UI/UX improvements
- ✅ Authentication can be re-enabled instantly