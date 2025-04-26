# CelebChatAI

A modern web application that allows users to chat with AI-powered characters, each with unique personalities and knowledge bases.

## Project Overview

CelebChatAI is a Next.js application that enables users to have conversations with AI characters. The application features:

- A collection of pre-defined characters with unique personalities
- Real-time chat interface with streaming responses
- User authentication and subscription tiers
- Persistent chat history
- Responsive design with light/dark mode support

The application uses Supabase for authentication and data storage, and DeepSeek's AI API for generating character responses.

## Tech Stack

### Frontend
- **Framework**: Next.js 15.3.0
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4.1.4, DaisyUI 5.0.19
- **Icons**: Lucide React 0.488.0
- **Theme**: next-themes 0.4.6
- **Animations**: Framer Motion 12.7.4

### Backend
- **API Routes**: Next.js API Routes
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Integration**: DeepSeek API
- **Rate Limiting**: Upstash Redis

### Development Tools
- **Linting**: ESLint 9
- **Package Manager**: npm
- **Environment Variables**: dotenv 16.5.0

## Directory Structure

```
characterai/
├── app/                  # Next.js app directory (pages and API routes)
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── profile/          # User profile page
│   ├── settings/         # User settings page
│   ├── subscription/     # Subscription management page
│   ├── debug/            # Debugging tools
│   ├── globals.css       # Global styles
│   ├── layout.js         # Root layout component
│   └── page.js           # Home page component
├── components/           # React components
│   ├── chat/             # Chat-related components
│   ├── sidebar/          # Sidebar components
│   ├── subscription/     # Subscription-related components
│   ├── Logo.jsx          # Application logo component
│   ├── Navbar.js         # Navigation bar component
│   ├── theme-toggle.js   # Theme toggle component
│   └── theme-provider.js # Theme provider component
├── contexts/             # React context providers
│   ├── AuthContext.js    # Authentication context
│   ├── CharacterContext.jsx # Character management context
│   ├── ChatContext.jsx   # Chat functionality context
│   └── SubscriptionContext.jsx # Subscription management context
├── lib/                  # Utility libraries
│   ├── ai.js             # AI integration functions
│   ├── characters.js     # Character definitions
│   ├── supabase.js       # Supabase client and functions
│   └── debug-auth.js     # Authentication debugging
├── public/               # Static assets
│   └── characters/       # Character avatar images
├── supabase/             # Supabase configuration
│   └── migrations/       # Database migrations
├── utils/                # Utility functions
│   └── supabase/         # Supabase utility functions
├── .env.local.example    # Example environment variables
├── middleware.js         # Next.js middleware for auth protection
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies
└── supabase_setup.sql    # SQL setup for Supabase
```

## Modules & Components

### Contexts

#### CharacterContext
- **Location**: `contexts/CharacterContext.jsx`
- **Purpose**: Manages character data and selection
- **Key Functions**:
  - `fetchCharacters()`: Retrieves characters from the database
  - `canAccessCharacter()`: Determines if a user can access a character
  - `handleSetSelectedCharacter()`: Sets the currently selected character

#### ChatContext
- **Location**: `contexts/ChatContext.jsx`
- **Purpose**: Manages chat functionality and message history
- **Key Functions**:
  - `sendMessage()`: Sends a message to the AI and streams the response
  - `loadChat()`: Loads chat history for a specific character
  - `deleteChatMessages()`: Deletes all messages for a specific character

#### SubscriptionContext
- **Location**: `contexts/SubscriptionContext.jsx`
- **Purpose**: Manages user subscription tiers and message limits
- **Key Functions**:
  - `loadSubscriptionData()`: Loads user subscription information
  - `canSendMessage()`: Checks if a user can send a message based on their tier
  - `incrementMessageCount()`: Increments the message count for a user

#### AuthContext
- **Location**: `contexts/AuthContext.js`
- **Purpose**: Manages user authentication state
- **Key Functions**:
  - `signIn()`: Signs in a user
  - `signUp()`: Registers a new user
  - `signOut()`: Signs out the current user

### Components

#### Chat Components
- **Location**: `components/chat/`
- **Key Components**:
  - `ChatWindow.jsx`: Main chat interface
  - `MessageBubble.jsx`: Individual message display
  - `TypingIndicator.jsx`: Shows when AI is generating a response

#### Sidebar Components
- **Location**: `components/sidebar/`
- **Key Components**:
  - `CharacterList.jsx`: Displays available characters
  - `NewCharacterModal.jsx`: Modal for creating new characters

### Libraries

#### AI Integration
- **Location**: `lib/ai.js`
- **Purpose**: Handles communication with the DeepSeek API
- **Key Functions**:
  - `streamChatResponse()`: Streams AI responses for real-time chat
  - `getChatResponse()`: Gets a complete AI response

#### Supabase Integration
- **Location**: `lib/supabase.js`
- **Purpose**: Handles database operations and authentication
- **Key Functions**:
  - `saveChat()`: Saves chat messages to the database
  - `getChats()`: Retrieves chat history
  - `deleteChat()`: Deletes a chat

#### Character Definitions
- **Location**: `lib/characters.js`
- **Purpose**: Defines available characters and their properties
- **Key Functions**:
  - `getCharacterById()`: Retrieves a character by ID
  - `getAllCharacters()`: Returns all available characters

## Database

CelebChatAI uses Supabase (PostgreSQL) for data storage with the following schema:

### Tables

#### profiles
- **Purpose**: Stores user profile information
- **Fields**:
  - `id`: UUID (primary key, references auth.users)
  - `subscription_tier`: Text (default: 'free')
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

#### chats
- **Purpose**: Stores chat messages
- **Fields**:
  - `id`: UUID (primary key)
  - `user_id`: UUID (references auth.users)
  - `character_id`: Text
  - `messages`: JSONB (array of message objects)
  - `created_at`: Timestamp

### Row-Level Security (RLS)

The database uses RLS policies to ensure data security:

- Users can only view, update, insert, and delete their own profiles
- Users can only view, update, insert, and delete their own chats
- Anonymous users can insert and view chats (for guest mode)

## Setup Instructions

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Supabase account
- DeepSeek API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/characterai.git
   cd characterai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.local.example`:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # DeepSeek API Configuration
   DEEPSEEK_API_KEY=your-deepseek-api-key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Upstash Redis Configuration
   UPSTASH_REDIS_REST_URL=your-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

4. Set up the Supabase database:
   - Create a new Supabase project
   - Run the SQL commands in `supabase_setup.sql` in the Supabase SQL editor

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Reference

### Chat API

#### POST /api/chat
- **Purpose**: Generates AI responses for chat messages
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "Hello" },
      { "role": "assistant", "content": "Hi there!" }
    ],
    "characterId": "sherlock-holmes"
  }
  ```
- **Response**: Server-sent events stream with AI-generated text

## Usage Guide

### Basic Usage

1. **Select a Character**:
   - Browse the available characters in the sidebar
   - Click on a character to start a conversation

2. **Send Messages**:
   - Type your message in the input field
   - Press Enter or click the Send button
   - The AI character will respond in real-time

3. **Manage Chats**:
   - Use the three dots menu to delete a chat or block a character
   - Use the back arrow to return to the character selection

### Subscription Tiers

- **Guest**: Limited number of messages
- **Free**: Basic access to all characters
- **Pro**: Enhanced features (coming soon)
- **Ultra**: Premium features (coming soon)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
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
