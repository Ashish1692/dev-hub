# DevHub - Kanban, Notes & Scripts Manager

A developer productivity hub built with Next.js 14, React, TypeScript, and NextAuth.js. Features secure GitHub OAuth authentication and GitHub sync for data persistence.

![DevHub](https://img.shields.io/badge/DevHub-Next.js%2014-blue)
![Auth](https://img.shields.io/badge/Auth-GitHub%20OAuth-green)

## Features

### 🔐 Secure GitHub OAuth Authentication
- No personal access tokens stored in browser
- Secure OAuth 2.0 flow via NextAuth.js
- Token managed server-side in encrypted JWT
- Automatic session refresh

### 🎯 Kanban Board
- Drag-and-drop tasks between columns
- Add/delete tasks and columns
- Markdown content with live preview
- Comments system with timestamps
- Version tracking for every change

### 📝 Notes Manager
- Create, edit, and delete notes
- Name and description fields
- Markdown content with split-view editor
- Live preview
- Complete version history with restore capability

### 💻 Scripts Manager
- Create, edit, and delete code snippets
- Syntax highlighting for 12+ languages
- Split view with code editor and highlighted preview
- Copy code to clipboard
- Version tracking with restore

### 🔗 GitHub Integration
- Select any repository from your account
- Create new repositories directly from the app
- Stores all data as JSON in your GitHub repository
- Auto-save with intelligent debouncing
- Queue-based sync to prevent race conditions

### 🗂️ Workspaces
- Create multiple workspaces (separate data files)
- Switch between workspaces instantly
- Delete workspaces (except default)
- Each workspace is a separate JSON file

## Getting Started

### Prerequisites

1. **Node.js 18+** installed
2. **GitHub OAuth App** credentials

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: DevHub (or your preferred name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy it

### Step 2: Setup Environment Variables

Create a `.env.local` file in the project root:

```env
# GitHub OAuth App Credentials
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here

# NextAuth Secret - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_random_secret_here

# NextAuth URL
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub!

## Project Structure

```
devhub/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts    # NextAuth API handler (catch-all route)
│   ├── globals.css             # Global styles & Tailwind
│   ├── layout.tsx              # Root layout with Providers
│   ├── page.tsx                # Main app component
│   └── providers.tsx           # SessionProvider wrapper
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── github.ts               # GitHub API utilities
│   └── store.ts                # Zustand state management
├── .env.example                # Environment variables template
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── tsconfig.json
```

## How It Works

### Authentication Flow
1. User clicks "Sign in with GitHub"
2. Redirected to GitHub for OAuth consent
3. GitHub redirects back with authorization code
4. NextAuth exchanges code for access token
5. Access token stored in encrypted JWT session
6. Token passed to client for GitHub API calls

### Data Sync
1. **Debounced Saves**: Changes are batched and saved after 1.5 seconds of inactivity
2. **Queue-Based Sync**: All save operations are queued to prevent race conditions
3. **SHA Tracking**: Every file operation tracks the current SHA to prevent conflicts
4. **Fresh SHA on Save**: Before each save, the current SHA is fetched
5. **Optimistic UI**: UI updates immediately while sync happens in background

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)

4. Update GitHub OAuth App:
   - Homepage URL: `https://your-app.vercel.app`
   - Callback URL: `https://your-app.vercel.app/api/auth/callback/github`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Security

- ✅ OAuth tokens are never stored in localStorage
- ✅ Tokens are encrypted in JWT session cookies
- ✅ Server-side token management via NextAuth
- ✅ CSRF protection built-in
- ✅ Secure HTTP-only cookies
- ✅ Your data stays in YOUR GitHub repository

## Dependencies

```json
{
  "next": "14.2.0",
  "react": "^18.2.0",
  "next-auth": "^4.24.7",
  "react-markdown": "^9.0.1",
  "react-syntax-highlighter": "^15.5.0",
  "zustand": "^4.5.2",
  "date-fns": "^3.6.0"
}
```

## License

MIT
