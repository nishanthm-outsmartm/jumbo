# Configuration System

This project uses a centralized configuration system that can be shared between client and server with proper environment variable parsing and type safety.

## Overview

The configuration is defined in `shared/config.ts` and provides:

- **Type-safe configuration** with TypeScript interfaces
- **Environment variable parsing** with proper type conversion
- **Validation** to ensure required variables are set
- **Client-safe configuration** that excludes sensitive server-only variables
- **Development logging** to help with debugging

## Usage

### Server-side

```typescript
import { getServerConfig, validateConfig } from "../shared/config";

// Get full server configuration
const config = getServerConfig();

// Validate configuration (exits process if invalid)
const validation = validateConfig();
if (!validation.isValid) {
  console.error(
    "Missing required environment variables:",
    validation.missingVars
  );
  process.exit(1);
}

// Use configuration
console.log(`Server running on port ${config.app.port}`);
```

### Client-side

```typescript
import { getClientConfig } from "../../../shared/config";

// Get client-safe configuration (excludes sensitive data)
const config = getClientConfig();

// Use configuration
console.log(`API Base URL: ${config.app.apiBaseUrl}`);
```

## Configuration Structure

```typescript
interface Config {
  database: {
    url: string;
  };
  firebase: {
    apiKey: string;
    appId: string;
    projectId: string;
    privateKey?: string; // Server-only
    clientEmail?: string; // Server-only
  };
  minio: {
    bucketName: string;
    objectName: string;
    endpoint: string;
    useSSL: boolean;
    accessKey: string; // Server-only
    secretKey: string; // Server-only
  };
  smtp: {
    host: string;
    port: number;
    user: string; // Server-only
    pass: string; // Server-only
    from: string; // Server-only
    fromName: string; // Server-only
    tls: boolean;
  };
  app: {
    frontendUrl: string;
    apiBaseUrl: string;
    port: number;
    loadingScreenTimeout: number;
    nodeEnv: "development" | "production" | "test";
  };
}
```

## Environment Variables

Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `FIREBASE_API_KEY` - Firebase API key
- `FIREBASE_APP_ID` - Firebase app ID
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `MINIO_BUCKET_NAME` - MinIO bucket name
- `MINIO_ENDPOINT` - MinIO endpoint URL
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `SMTP_USER` - Email service username
- `SMTP_PASS` - Email service password
- `SMTP_FROM` - Email sender address

### Optional Variables

- `FRONTEND_URL` - Frontend URL (default: http://localhost:3000)
- `API_BASE_URL` - API base URL (default: http://localhost:3006)
- `PORT` - Server port (default: 3006)
- `NODE_ENV` - Environment (default: development)
- `APP_LOADING_SCREEN_TIMEOUT` - Loading timeout (default: 100ms)

## Features

### Type Safety

All configuration values are properly typed, providing IntelliSense and compile-time error checking.

### Environment Variable Parsing

- **Strings**: Direct assignment with optional defaults
- **Numbers**: Automatic parsing with fallback to defaults
- **Booleans**: Supports 'true', '1', 'yes' (case-insensitive)
- **Required validation**: Checks for missing critical variables

### Client-Safe Configuration

The `getClientConfig()` function returns only the configuration that's safe to expose to the client, automatically excluding sensitive server-only variables like database credentials and API keys.

### Development Logging

In development mode, the configuration system logs:

- Environment status
- Configuration values (with sensitive data masked)
- Missing required variables
- Validation results

## Migration from Old System

The old configuration system has been replaced. If you have existing code using the old `serverConfig`, update it to use the new system:

```typescript
// Old way
import { serverConfig } from "../shared/config";
const dbUrl = serverConfig.env.databaseUrl;

// New way
import { getServerConfig } from "../shared/config";
const config = getServerConfig();
const dbUrl = config.database.url;
```

## Validation

The configuration system validates required environment variables on startup. If any required variables are missing, the application will log the missing variables and exit with an error code.

This helps catch configuration issues early in development and prevents runtime errors in production.
