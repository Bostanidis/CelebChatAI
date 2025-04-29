# CelebChatAI

A modern web application that allows users to chat with AI-powered characters, each with unique personalities and knowledge bases.

## Project Overview

CelebChatAI is a Next.js application that enables users to have conversations with AI characters. The application features:

- A collection of pre-defined characters with unique personalities
- Real-time chat interface with streaming responses
- User authentication and subscription tiers (FREE, PRO, ULTRA, ADMIN)
- Persistent chat history with Supabase
- Responsive design with light/dark mode support
- Sound effects for message interactions (configurable)
- Rate limiting with Upstash Redis
- Character selection and chat state management

The application uses Supabase for authentication and data storage, and DeepSeek's AI API for generating character responses.

## Tech Stack (As of April 2025)

### Frontend
- **Framework**: Next.js 15.3.0 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: 
  - Tailwind CSS 4.1.4
  - DaisyUI 5.0.19
  - shadcn-ui 0.9.5
- **Icons**: 
  - Lucide React 0.488.0
  - Heroicons React 2.2.0
- **Theme**: next-themes 0.4.6
- **Animations**: Framer Motion 12.7.4
- **Date Handling**: date-fns 4.1.0

### Backend & Infrastructure
- **Runtime**: Node.js 22.15.0
- **Package Manager**: npm 10.9.2
- **API Routes**: Next.js API Routes
- **Authentication**: Supabase Auth (@supabase/supabase-js 2.49.4)
- **Database**: Supabase PostgreSQL
- **AI Integration**: 
  - DeepSeek API (@ai-sdk/deepseek 0.2.13)
  - OpenAI API (openai 4.96.0)
- **Rate Limiting**: 
  - Upstash Redis (@upstash/redis 1.34.8)
  - Upstash Rate Limit (@upstash/ratelimit 2.0.5)
- **Schema Validation**: Zod 3.24.3

### Development Tools
- **Linting**: ESLint 9
- **Environment Variables**: dotenv 16.5.0
- **Deployment**: Netlify (netlify.toml configuration)

## Directory Structure

```
characterai/
├── app/                  # Next.js app directory (pages and API routes)
│   ├── api/             # API routes for chat, auth, and subscriptions
│   ├── (auth)/          # Authentication-related pages (login, signup)
│   ├── (dashboard)/     # User dashboard pages (profile, settings)
│   ├── globals.css      # Global styles
│   ├── layout.js        # Root layout with providers
│   └── page.js          # Home page with chat interface
├── components/          # React components
│   ├── chat/           # Chat interface components
│   ├── settings/       # Settings page components
│   ├── sidebar/        # Sidebar and character list
│   ├── subscription/   # Subscription management
│   └── ui/             # Reusable UI components
├── contexts/           # React context providers
│   ├── AuthContext.js  # Authentication state
│   ├── CharacterContext.jsx # Character management
│   ├── ChatContext.jsx # Chat functionality
│   └── SubscriptionContext.jsx # Subscription management
├── lib/               # Core functionality
│   ├── ai.js         # AI integration
│   ├── characters.js # Character definitions
│   ├── supabase.js   # Database operations
│   └── utils.js      # Utility functions
├── public/           # Static assets
│   ├── sounds/      # Sound effects
│   └── characters/  # Character images
├── styles/          # Additional styling
├── supabase/        # Supabase configuration
│   └── migrations/  # Database migrations
├── utils/           # Utility functions
│   └── supabase/    # Supabase utilities
└── scripts/         # Development scripts
```

## Key Features

### Authentication & Authorization
- Email/password authentication
- OAuth providers support
- Protected routes with middleware
- Role-based access control

### Subscription System
- Tiered access (FREE, PRO, ULTRA, ADMIN)
- Message limits per tier
- Premium features access control
- Subscription status management

### Chat Interface
- Real-time message streaming
- Persistent chat history
- Character-specific conversations
- Sound effects (configurable)
- Typing indicators
- Message status indicators

### Character System
- Pre-defined character personalities
- Character-specific knowledge bases
- Access control based on subscription
- Character selection and management

## Database Schema

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  subscription_tier TEXT DEFAULT 'FREE',
  subscription_status TEXT DEFAULT 'active',
  subscription_end_date TIMESTAMPTZ,
  sound_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### chats
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  character_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### message_counts
```sql
CREATE TABLE message_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  character_id TEXT NOT NULL,
  date DATE NOT NULL,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, character_id, date)
);
```

## Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# DeepSeek API Configuration
DEEPSEEK_API_KEY=your-api-key
OPENAI_API_KEY=your-openai-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## Setup Instructions

1. **Prerequisites**
   - Node.js 22.15.0 (use .nvmrc)
   - npm 10.9.2
- Supabase account
- DeepSeek API key
   - Upstash Redis account

2. **Installation**
   ```bash
   git clone https://github.com/yourusername/characterai.git
   cd characterai
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.local.example` to `.env.local`
   - Fill in all required environment variables

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   npm run check-supabase
   ```

5. **Development**
   ```bash
   npm run dev
   ```

6. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup`: Register new user
- `POST /api/auth/login`: User login
- `POST /api/auth/logout`: User logout

### Chat
- `POST /api/chat`: Send message and get AI response
- `GET /api/chat/history`: Get chat history
- `DELETE /api/chat`: Delete chat history

### Subscription
- `GET /api/subscription/status`: Get subscription status
- `POST /api/subscription/upgrade`: Upgrade subscription
- `POST /api/subscription/cancel`: Cancel subscription

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Character avatars sourced from public domain or licensed images
- UI inspired by modern chat applications
- Built with Next.js and Supabase

## Security Features

### Authentication & Session Management
- Secure session handling with HTTP-only cookies
- 30-minute session timeout with automatic refresh
- Token rotation for enhanced security
- Protected routes with middleware authentication checks

### API Security
- Rate limiting (10 requests per minute per user)
- Input validation using Zod schemas
- XSS prevention through input sanitization
- Secure cookie handling with SameSite and HttpOnly flags
- CSRF protection through secure cookie settings

### Data Protection
- Row Level Security (RLS) policies in Supabase
- Secure environment variable handling
- Input sanitization for chat messages
- Secure password hashing via Supabase Auth

### Best Practices
- Regular security audits
- Dependency vulnerability scanning
- Secure headers configuration
- Error handling without exposing sensitive information

## Security Considerations

1. **Session Management**
   - Sessions expire after 30 minutes of inactivity
   - Tokens are automatically refreshed
   - Secure cookie handling prevents XSS and CSRF attacks

2. **Rate Limiting**
   - Prevents abuse and DoS attacks
   - Configurable limits per user/IP
   - Rate limit headers included in responses

3. **Input Validation**
   - All user input is validated using Zod schemas
   - Maximum message length enforced
   - XSS prevention through content sanitization

4. **Data Protection**
   - Row Level Security ensures data isolation
   - Sensitive data is never exposed in error messages
   - Secure password handling via Supabase Auth

5. **API Security**
   - All API routes are protected
   - Request validation before processing
   - Secure headers configuration
   - Error handling without information leakage

## Recent Updates

### Supabase Client Implementation
- Updated all server-side Supabase client implementations to use the latest recommended approach
- Replaced deprecated `createServerClient` from '@supabase/ssr' with `createClient` from '@supabase/supabase-js'
- Updated client configuration to use the new auth options:
  ```javascript
  {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
  ```
- Removed deprecated cookie handling code
- Updated files:
  - middleware.js
  - app/api/chat/route.js
  - utils/supabase/server.js
  - utils/supabase/middleware.js
  - app/api/subscription/webhook/route.js
  - app/api/subscription/create-checkout/route.js
