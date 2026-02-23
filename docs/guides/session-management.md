# Session Management

This guide covers advanced session configuration, including mirror fallback, retry policies, cookie management, and proxy configuration.

---

## Table of Contents

- [Creating a Session](#creating-a-session)
- [Configuration Options](#configuration-options)
- [Mirror Fallback Mechanism](#mirror-fallback-mechanism)
- [Retry Policies](#retry-policies)
- [Cookie Management](#cookie-management)
- [Proxy Configuration](#proxy-configuration)

---

## Creating a Session

The `MovieboxSession` class manages all HTTP communication with the MovieBox API. Create a single instance and reuse it throughout your application.

```typescript
import { MovieboxSession, createLogger } from 'moviebox-js-sdk';

const session = new MovieboxSession({
  logger: createLogger({ level: 'info' })
});
```

---

## Configuration Options

### Basic Configuration

```typescript
const session = new MovieboxSession({
  // Host configuration
  host: 'h5.aoneroom.com',
  protocol: 'https',
  
  // Logging
  logger: createLogger({ level: 'debug' })
});
```

### Full Configuration

```typescript
import { MovieboxSession, createLogger } from 'moviebox-js-sdk';

const session = new MovieboxSession({
  // Connection
  host: 'h5.aoneroom.com',
  protocol: 'https',
  baseUrl: 'https://custom.example.com',  // Overrides host
  mirrorHosts: [
    'h5.aoneroom.com',
    'movieboxapp.in',
    'mirror2.example.com'
  ],
  
  // Request defaults
  defaultHeaders: {
    'User-Agent': 'MyApp/1.0',
    'Accept-Language': 'en-US'
  },
  
  // Custom fetch (for testing or advanced use)
  fetch: customFetchImplementation,
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    delayMs: 500,
    shouldRetryError: (error, context) => {
      // Don't retry geo-blocking
      return error.name !== 'GeoBlockedError';
    },
    shouldRetryResponse: (response, context) => {
      // Retry on 5xx errors
      return response.status >= 500;
    }
  },
  
  // Logging
  logger: createLogger({ level: 'info' }),
  
  // Proxy
  proxyUrl: process.env.HTTP_PROXY,
  
  // Advanced
  dispatcher: customDispatcher
});
```

---

## Mirror Fallback Mechanism

The SDK automatically handles mirror fallback when a request fails. Here's how it works:

### How Mirrors Work

1. **Primary Host**: The `host` option or environment variable is tried first
2. **Base URL**: If `baseUrl` is provided, it's tried first
3. **Mirror Hosts**: Configured `mirrorHosts` are tried in order
4. **Built-in Fallbacks**: If no mirrors are configured, built-in defaults are used

```typescript
const session = new MovieboxSession({
  // This will be tried first
  baseUrl: 'https://my-preferred-mirror.com',
  
  // These will be tried if baseUrl fails
  mirrorHosts: [
    'h5.aoneroom.com',
    'movieboxapp.in',
    'backup-mirror.example.com'
  ]
});
```

### Accessing Current Mirror

```typescript
console.log(session.baseUrl); // Current base URL being used
```

### Custom Mirror Logic

```typescript
const session = new MovieboxSession({
  mirrorHosts: [
    'mirror1.example.com',
    'mirror2.example.com',
    'mirror3.example.com'
  ],
  retry: {
    // Reduce retries since we have multiple mirrors
    maxAttempts: 2
  }
});
```

---

## Retry Policies

The SDK includes built-in retry logic for failed requests.

### Default Behavior

- **Max Attempts**: 3 (including initial attempt)
- **Delay**: 200ms between attempts
- **Retries On**:
  - HTTP 5xx errors
  - HTTP 429 (Too Many Requests)
  - HTTP 408 (Request Timeout)
  - Network errors

- **Does NOT Retry On**:
  - Geo-blocking errors (status 451)
  - Mirror exhaustion

### Customizing Retry Behavior

```typescript
const session = new MovieboxSession({
  retry: {
    // Increase max attempts
    maxAttempts: 5,
    
    // Increase delay
    delayMs: 1000,
    
    // Custom error retry logic
    shouldRetryError: (error, context) => {
      // Don't retry geo-blocking
      if (error.name === 'GeoBlockedError') {
        return false;
      }
      
      // Don't retry mirror exhaustion
      if (error.name === 'MirrorExhaustedError') {
        return false;
      }
      
      // Retry everything else
      return true;
    },
    
    // Custom response retry logic
    shouldRetryResponse: (response, context) => {
      // Retry on 502 Bad Gateway
      if (response.status === 502) {
        return true;
      }
      
      // Use default logic for others
      return response.status >= 500 || 
             response.status === 429 || 
             response.status === 408;
    }
  }
});
```

### Retry Context

The retry callbacks receive a context object:

```typescript
interface RetryContext {
  attempt: number;      // Current attempt (1, 2, 3, ...)
  maxAttempts: number;  // Maximum allowed attempts
  url: string;          // Full URL being requested
  baseUrl: string;      // Base URL being used
}
```

### Example: Exponential Backoff

```typescript
const session = new MovieboxSession({
  retry: {
    maxAttempts: 4,
    delayMs: 500,
    shouldRetryResponse: (response, context) => {
      // Only retry server errors
      return response.status >= 500;
    }
  }
});
```

---

## Cookie Management

Some API endpoints require session cookies. The SDK handles this automatically.

### Automatic Cookie Handling

```typescript
const session = new MovieboxSession();

// Cookies are automatically obtained when needed
const result = await getMovieStreamUrl(session, {
  detailPath: 'some-movie',
  // This internally calls ensureSessionCookies()
});
```

### Manual Cookie Management

```typescript
// Ensure cookies are initialized before making requests
await session.ensureSessionCookies();

// Now cookies will be included in subsequent requests
const result = await search(session, { query: 'movie' });
```

### How Cookies Work

1. When `requireCookies` is true or `ensureSessionCookies()` is called:
   - The SDK makes a request to `/app`
   - Extracts cookies from the response
   - Stores them for subsequent requests

2. Cookies are automatically included in:
   - Stream URL requests
   - Download requests

---

## Proxy Configuration

The SDK supports HTTP/HTTPS proxies for requests.

### Environment Variables

```bash
# Set proxy via environment variable
export MOVIEBOX_PROXY=http://proxy.example.com:8080
```

### Configuration Option

```typescript
const session = new MovieboxSession({
  proxyUrl: 'http://proxy.example.com:8080'
});
```

### Using with Authentication

```typescript
const session = new MovieboxSession({
  proxyUrl: 'http://username:password@proxy.example.com:8080'
});
```

### Advanced: Custom Dispatcher

For more complex proxy setups, use a custom undici dispatcher:

```typescript
import { ProxyAgent } from 'undici';
import { MovieboxSession } from 'moviebox-js-sdk';

const dispatcher = new ProxyAgent({
  uri: 'http://proxy.example.com:8080',
  token: 'optional-token'
});

const session = new MovieboxSession({
  dispatcher
});
```

### See Also

For more proxy configuration options, see [Proxy Configuration](../proxy.md).

---

## Logging

Enable logging to debug issues:

```typescript
import { createLogger } from 'moviebox-js-sdk';

const session = new MovieboxSession({
  logger: createLogger({
    level: 'debug',  // 'trace', 'debug', 'info', 'warn', 'error', 'fatal'
    name: 'my-app'
  })
});
```

### Log Messages

The logger outputs:
- Mirror selection and switching
- Retry attempts
- Request/response details
- Error information

---

## Session Reuse

Create one session and reuse it:

```typescript
// ❌ Wrong - Creating new session for each request
async function fetchMovie(id: string) {
  const session = new MovieboxSession(); // New session each time
  return await getMovieDetails(session, { detailPath: id });
}

// ✅ Correct - Reuse session
const session = new MovieboxSession();

async function fetchMovie(id: string) {
  return await getMovieDetails(session, { detailPath: id });
}

async function fetchSeries(id: string) {
  return await getSeriesDetails(session, { detailPath: id });
}
```

---

## Best Practices

### 1. Single Session Instance

```typescript
// Create once at application startup
const session = new MovieboxSession({
  logger: createLogger({ level: 'info' })
});

// Export for use throughout app
export { session };
```

### 2. Configure Appropriate Retry Settings

```typescript
// For production
const session = new MovieboxSession({
  retry: {
    maxAttempts: 3,
    delayMs: 500
  }
});

// For development/debugging
const session = new MovieboxSession({
  retry: {
    maxAttempts: 1  // Fail fast for debugging
  },
  logger: createLogger({ level: 'debug' })
});
```

### 3. Handle Errors Appropriately

```typescript
import { GeoBlockedError, MirrorExhaustedError } from 'moviebox-js-sdk';

try {
  const result = await getMovieDetails(session, { detailPath: 'movie' });
} catch (error) {
  if (error instanceof GeoBlockedError) {
    // Content not available in region
  } else if (error instanceof MirrorExhaustedError) {
    // All mirrors failed
  }
}
```

---

## See Also

- [Getting Started](./getting-started.md)
- [Downloading](./downloading.md)
- [Streaming](./streaming.md)
- [Error Handling](../errors.md)
- [Proxy Configuration](../proxy.md)
