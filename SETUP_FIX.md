# Setup Fix Instructions

## Critical: Fix NextAuth Route Path

The NextAuth API route **MUST** be in a folder named `[...nextauth]` (with square brackets) to work correctly.

### Manual Step Required:

1. **Delete the incorrect folder:**
   ```bash
   rm -rf app/api/auth/nextauth
   ```

2. **Create the correct folder structure:**
   ```bash
   mkdir -p "app/api/auth/[...nextauth]"
   ```

3. **Create the route file:**
   Create `app/api/auth/[...nextauth]/route.ts` with this content:
   
   ```typescript
   import NextAuth from 'next-auth';
   import { authOptions } from '@/lib/auth';

   const handler = NextAuth(authOptions);

   export { handler as GET, handler as POST };
   ```

### Why This Is Needed:

NextAuth uses Next.js dynamic routes with a "catch-all" segment `[...nextauth]` to handle all authentication routes:
- `/api/auth/signin`
- `/api/auth/signout`
- `/api/auth/session`
- `/api/auth/callback/github`
- etc.

The square brackets `[...nextauth]` tell Next.js to catch all sub-routes under `/api/auth/`.

### Verify It Works:

After making this change, restart your dev server:

```bash
npm run dev
```

Then check these URLs (should return valid responses, not 404):
- http://localhost:3000/api/auth/session
- http://localhost:3000/api/auth/csrf

If you still see 404 errors, make sure:
1. The folder is exactly named `[...nextauth]` (with brackets)
2. The file is named `route.ts` (not `route.js`)
3. You restarted the dev server

## Complete Setup Checklist:

- [ ] Create GitHub OAuth App at https://github.com/settings/developers
- [ ] Set callback URL to: `http://localhost:3000/api/auth/callback/github`
- [ ] Create `.env.local` file with:
  ```
  GITHUB_CLIENT_ID=your_client_id
  GITHUB_CLIENT_SECRET=your_client_secret
  NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
  NEXTAUTH_URL=http://localhost:3000
  ```
- [ ] Fix NextAuth folder (see above)
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
