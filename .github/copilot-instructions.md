# GitHub Copilot Instructions for ForTheWeebs

## Project Context
ForTheWeebs is a creator-first platform for anime and content creators with:
- React frontend with Vite
- Express backend API
- Capacitor for mobile (Android/iOS)
- Supabase for database
- Stripe for payments
- OpenAI for AI features
- Anthropic Claude for Mico AI assistant

## Code Style
- Use React hooks (useState, useEffect, etc.)
- Prefer arrow functions
- Use async/await over .then()
- Use template literals for strings
- Add JSDoc comments for complex functions
- Keep functions under 50 lines
- Descriptive variable names

## Architecture
- `/src` - React frontend components
- `/api` - Express backend routes
- `/utils` - Shared utilities
- `/components` - Reusable React components
- `/android` - Android mobile app
- `/ios` - iOS mobile app

## Key Patterns
1. **API Calls:**
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

2. **Supabase Queries:**
```javascript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', userId);
```

3. **Error Handling:**
```javascript
try {
  // code
} catch (error) {
  console.error('Descriptive error:', error);
  // Handle gracefully
}
```

## Important Rules
- Always verify age (18+) for adult content features
- Include anti-piracy checks for user uploads
- Use environment variables for API keys (never hardcode)
- Mobile apps must work offline when possible
- All user content requires moderation capabilities

## Tech Stack
- React 18+ with Hooks
- Vite for bundling
- Express.js for backend
- Capacitor 7 for mobile
- Stripe for payments
- Supabase (PostgreSQL)
- OpenAI GPT-4 for AI features
- Anthropic Claude for Mico assistant

## Don't Suggest
- Class components (use functional)
- jQuery (we use React)
- Firebase (we use Supabase)
- Older React patterns (use hooks)

## When Writing Code
1. Consider mobile responsiveness
2. Handle loading states
3. Show error messages to users
4. Add loading indicators
5. Optimize for performance
6. Consider offline functionality

## Common Tasks
- Creating new components in `/src/components/`
- Adding API routes in `/api/`
- Updating mobile builds with `npx cap sync`
- Testing with `npm run dev:all`

## Environment Variables
Use these prefixes:
- `VITE_` for frontend env vars
- No prefix for backend-only vars

## Security
- Always sanitize user input
- Validate on both client AND server
- Use parameterized queries (Supabase handles this)
- Never expose API keys to frontend
- Check user authentication before sensitive operations
