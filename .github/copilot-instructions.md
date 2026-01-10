# GitHub Copilot Instructions for lunonex

> **Note:** These instructions document the **actual patterns and conventions used in this codebase**. Follow these patterns to maintain consistency with existing code, even if they differ from general best practices.

## Project Context
lunonex is a creator-first platform for anime and content creators with:
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
- Use single quotes for strings in JavaScript files
- Always disable ESLint only when absolutely necessary with `/* eslint-disable */` at the top of file

## Architecture
- `/src` - React frontend components (main app files)
- `/src/components` - Reusable React components
- `/api` - Express backend routes
- `/utils` - Shared utilities
- `/android` - Android mobile app (Capacitor)
- `/ios` - iOS mobile app (Capacitor)
- `/lib` - Library code
- `/config` - Configuration files
- `/middleware` - Express middleware
- `/services` - Business logic services

## Key Patterns

### 1. API Calls (Frontend to Backend)
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### 2. Supabase Queries (Always use destructured response)
```javascript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', userId);

if (error) throw error; // Always check for errors
```

### 3. Error Handling (Required)
```javascript
try {
  // code
} catch (error) {
  console.error('Descriptive error:', error);
  // Handle gracefully - show user feedback
  res.status(500).json({ error: error.message }); // Backend
}
```

### 4. Component Structure
```javascript
import React, { useState, useEffect } from 'react';
// Import components and styles
import './ComponentName.css';

export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects here
  }, [dependencies]);
  
  return (
    <div>
      {/* JSX here */}
    </div>
  );
}
```

### 5. API Route Structure (Express)
```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

router.post('/endpoint', async (req, res) => {
  try {
    const { param1, param2 } = req.body;
    
    // Validate input
    if (!param1) {
      return res.status(400).json({ error: 'Missing required field' });
    }
    
    // Query database
    const { data, error } = await supabase
      .from('table')
      .insert({ param1, param2 })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Build, Test & Development Commands

### Development
- `npm run dev` - Start frontend dev server (Vite) on port 3002
- `npm run dev:server` - Start backend server (nodemon)
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run server` - Start backend server (production mode)

### Building
- `npm run build` - Build for production (runs fix:react, inject-env, vite build, check:react)
- `npm run preview` - Preview production build locally
- `npm run build:agents` - Build TypeScript agents

### Code Quality
- `npm run lint` - Run ESLint on all .js, .ts, .jsx, .tsx files
- `npm run check:duplicates` - Check for code duplication using jscpd
- `npm run test` - Run tests with Vitest (if tests exist)

### Mobile Development
- `npm run android:build` - Build and sync Android app
- `npm run android:open` - Open Android Studio
- `npm run android:run` - Build and run on Android device/emulator
- `npm run android:release` - Build release APK
- `npm run android:bundle` - Build release AAB bundle
- `npx cap sync` - Sync web assets to mobile platforms

### Desktop
- `npm run electron` - Build and run Electron app
- `npm run electron:build` - Build Electron installer for Windows

### Installation
- `npm install --legacy-peer-deps` - Install dependencies (required flag for peer deps)

## Important Rules
- Always verify age (18+) for adult content features
- Include anti-piracy checks for user uploads
- Use environment variables for API keys (never hardcode)
- Mobile apps must work offline when possible
- All user content requires moderation capabilities
- Never commit the `.env` file (contains secrets)
- Always use `--legacy-peer-deps` flag when installing packages
- Run `npm run lint` before committing changes
- Backend uses CommonJS (require/module.exports), frontend uses ES modules (import/export)

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
1. Consider mobile responsiveness (test at various screen sizes)
2. Handle loading states (show spinners/skeletons)
3. Show error messages to users (user-friendly, not technical)
4. Add loading indicators for async operations
5. Optimize for performance (lazy load, code split)
6. Consider offline functionality (especially for mobile)
7. Validate input on both client and server
8. Use proper semantic HTML
9. Add ARIA labels for accessibility
10. Test on multiple browsers (Chrome, Firefox, Safari)

## Troubleshooting Common Issues

### "Cannot find module" errors
- Run `npm install --legacy-peer-deps` to install missing dependencies

### Build failures
- Check that all imports are correct
- Verify environment variables are set
- Run `npm run fix:react` if React version conflicts occur

### Mobile build issues
- Run `npx cap sync` after web changes
- Check Android/iOS specific logs in respective IDEs
- Verify Capacitor plugins are installed

### Supabase connection issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Check Supabase dashboard for service status
- Verify Row Level Security (RLS) policies

### Payment integration issues
- Use test mode Stripe keys for development
- Never commit real Stripe keys
- Test with Stripe test card numbers

## Common Tasks & Conventions

### Creating New Components
1. Create file in `/src/components/ComponentName.jsx`
2. Create matching CSS file `/src/components/ComponentName.css` (if needed)
3. Use PascalCase for component names
4. Export as default: `export default function ComponentName({ props }) {}`
5. Import React hooks at the top: `import React, { useState, useEffect } from 'react';`
6. Import styles: `import './ComponentName.css';`

### Adding API Routes
1. Create file in `/api/route-name.js`
2. Use kebab-case for file names
3. Always use Express Router pattern
4. Always validate input parameters
5. Always handle errors with try-catch
6. Return proper HTTP status codes
7. Use Supabase service key for server-side operations: `process.env.SUPABASE_SERVICE_KEY`

### Database Operations
- Always destructure `{ data, error }` from Supabase queries
- Always check for `error` after Supabase operations
- Use `.select()` after insert/update to return data
- Use `.single()` when expecting one result
- Use `.eq()`, `.in()`, `.gt()`, etc. for filtering
- Supabase automatically handles SQL injection via parameterized queries

### Styling
- Use inline styles for component-specific styling (common pattern in this project)
- Use CSS files for complex or reusable styles
- Use responsive design (mobile-first)
- Add hover/focus states for interactive elements
- Use gradient backgrounds for premium features

### File Naming
- Components: PascalCase (e.g., `CreatorDashboard.jsx`)
- API routes: kebab-case (e.g., `user-profile.js`)
- Utilities: camelCase (e.g., `vipAccess.js`)
- CSS: Match component name (e.g., `CreatorDashboard.css`)

### Import Organization
1. React imports first
2. Third-party libraries
3. Local components
4. Utilities
5. CSS files last
Example:
```javascript
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ComponentName from './components/ComponentName';
import { helperFunction } from './utils/helpers';
import './ComponentName.css';
```

### State Management
- Use `useState` for component-local state
- Use `useEffect` for side effects (API calls, subscriptions)
- Pass state down via props
- Lift state up when shared between components
- Use Supabase realtime subscriptions for live data

### Mobile Considerations
- After making changes to web app, run `npx cap sync` to update mobile
- Test on both Android and iOS
- Consider offline functionality
- Use responsive breakpoints
- Handle touch events differently than mouse events

## Environment Variables
Use these prefixes:
- `VITE_` for frontend env vars
- No prefix for backend-only vars

## Security
- Always sanitize user input
- Validate on both client AND server
- Use parameterized queries (Supabase handles this automatically)
- Never expose API keys to frontend (use VITE_ prefix for safe frontend vars)
- Check user authentication before sensitive operations
- Use environment variables for all secrets
- Implement rate limiting on API endpoints
- Content moderation required for all user uploads
- Age verification (18+) required for adult content
- CSAM detection and NCMEC reporting compliance
- Use helmet.js for security headers (already configured)
- Use CORS appropriately (already configured)

## Performance & Best Practices
- Lazy load heavy components (e.g., 3D viewers, video editors)
- Use code splitting for large features
- Optimize images before upload
- Use proper loading states while data fetches
- Cache API responses when appropriate
- Minimize bundle size (already optimized to 588KB main bundle)
- Use React.memo for expensive components
- Avoid unnecessary re-renders

## Testing
- Run `npm run test` to execute Vitest tests
- Test components in isolation
- Test API endpoints with proper error cases
- Test authentication flows
- Test payment integrations carefully
- Manual testing required for VR/AR features

## Debugging
- Use browser DevTools for frontend issues
- Check console for errors and warnings
- Use React DevTools extension
- Backend logs via console.error
- Check Supabase dashboard for database issues
- Use `npm run lint` to catch common issues

## Documentation
- Add JSDoc comments for complex functions
- Document API endpoints with parameter descriptions
- Update README.md for major feature changes
- Keep QUICKSTART.md current for setup instructions
- Document environment variables in .env.example

## VIP System
- Owner: Full admin access
- VIPs (14 free slots): Everything free forever
- Paid VIPs ($1000 one-time): Platform + creator content free
- Regular Users: Pay for tiers + creator content
- Edit VIP list in: `utils/vipAccess.js`
- Always check VIP status before charging users

## AI Features
- OpenAI for content generation (GPT-4)
- Anthropic Claude for Mico assistant
- TensorFlow for image processing
- Google Vision API for content moderation
- Always handle AI API errors gracefully
- Show loading states during AI operations
- Implement timeouts for AI requests
