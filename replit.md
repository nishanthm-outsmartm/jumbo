# Overview

JumboJolt is a privacy-first social platform that empowers Indian consumers to switch from foreign products to quality Indian alternatives. The application is built as a full-stack monorepo with a React frontend and Express backend, featuring Firebase authentication, social feeds for product switches, gamification through points and leaderboards, and admin functionality for content moderation.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Bug Fixes (August 14, 2025)
- Fixed critical server crash in `/api/feed` endpoint caused by incorrect database table aliasing in `getFeedPosts` method
- Resolved TypeScript type errors in `EnhancedModeratorPanel.tsx` by updating import path from `@/lib/auth` to `@/context/AuthContext`
- Fixed API request usage in moderator panel by correcting `apiRequest` function calls and adding proper type annotations
- Resolved DOM nesting warnings in Navigation component by replacing nested anchor tags with proper Link/span combinations
- Fixed syntax errors in storage.ts methods by adding missing closing braces to `getMessagesForUser` and `getUnreadMessages` methods
- Corrected database query type errors by fixing nullable field handling in reaction and comment operations
- Improved navigation accessibility by removing nested `<a>` tags that caused React validation warnings
- Enhanced error handling and logging for better debugging capabilities

## Application Status
- All main API endpoints now working correctly: `/api/feed`, `/api/leaderboard`, `/api/trending`, `/api/auth/login`
- Database operations functioning properly with proper type safety
- Frontend navigation rendering without React warnings
- Authentication flow working with Firebase integration
- TypeScript compilation successful with minimal remaining diagnostics

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based architecture using functional components and hooks
- **Vite Build System**: Fast development server and optimized production builds
- **Wouter Router**: Lightweight client-side routing for single-page application navigation
- **UI Framework**: shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom Indian-inspired color palette (saffron, forest green, royal blue)
- **State Management**: React Query for server state, React Context for authentication state
- **Form Management**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Express.js Server**: RESTful API with middleware-based request processing
- **Database Layer**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection Pooling**: Neon serverless PostgreSQL with connection pooling via @neondatabase/serverless
- **Schema Management**: Centralized database schema in shared directory using Drizzle
- **Storage Interface**: Abstracted data access layer with IStorage interface for modularity

## Authentication & Authorization
- **Firebase Authentication**: Phone/SMS OTP and email authentication
- **Role-based Access**: User roles (MEMBER, MODERATOR, STRATEGIST, ADMIN) with different permission levels
- **Privacy-focused**: Handle-based usernames with optional public aliases for social sharing
- **Session Management**: Firebase token verification middleware for protected routes

## Data Architecture
- **PostgreSQL Schema**: Comprehensive relational model with users, brands, switch logs, posts, comments, and suggestions
- **Gamification System**: Points, levels, and leaderboards with automatic scoring for product switches
- **Content Categories**: Structured product categories (Food & Beverages, Electronics, Fashion, etc.)
- **Social Features**: Posts, likes, comments, and user-generated content with moderation capabilities

## File Upload & Storage
- **Google Cloud Storage**: File upload handling with @google-cloud/storage
- **Uppy Integration**: Progressive file upload UI with drag-and-drop support
- **Multiple Upload Methods**: Dashboard, drag-drop, and file input components

# External Dependencies

## Core Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Firebase**: Authentication service for phone/email OTP verification
- **Google Cloud Storage**: File storage and CDN for user-generated content

## Development & Build Tools
- **Vite**: Frontend development server and build system
- **TypeScript**: Type safety across the entire application
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Backend bundling for production deployment

## UI & Component Libraries
- **Radix UI**: Accessible component primitives for dropdowns, dialogs, forms
- **Lucide Icons**: Consistent icon system throughout the application
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **React Query**: Server state management and caching

## Form & Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Runtime schema validation shared between frontend and backend
- **Input Validation**: Type-safe form validation with error handling

## Deployment & Monitoring
- **Replit Integration**: Development environment with hot reloading and error overlay
- **Environment Configuration**: Separate development and production settings
- **Error Handling**: Centralized error management with user-friendly messages