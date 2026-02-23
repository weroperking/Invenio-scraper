# Error Handling

This guide covers the error handling approach in MovieBox JS SDK, including error classes, when they are thrown, and how to handle them.

---

## Table of Contents

- [Overview](#overview)
- [Error Classes](#error-classes)
- [Handling Errors](#handling-errors)
- [Best Practices](#best-practices)

---

## Overview

The SDK uses a hierarchical error class system based on `MovieboxApiError`. All errors thrown by the SDK extend this base class, allowing you to catch SDK-specific errors separately from other JavaScript errors.

```typescript
import { 
  MovieboxApiError, 
  MovieboxHttpError, 
  GeoBlockedError,
  // ... other errors
} from 'moviebox-js-sdk';

try {
  // SDK operations
} catch (error) {
  if (error instanceof MovieboxApiError) {
    // Handle SDK-specific errors
  } else {
    // Handle other errors
  }
}
```

---

## Error Classes

### MovieboxApiError

The base error class for all SDK errors.

```typescript
class MovieboxApiError extends Error {
  name: 'MovieboxApiError';
  message: string;
}
```

**When it's thrown:**
- Base class for all SDK errors
- General API failures without specific classification

**Example:**

```typescript
try {
  const details = await getMovieDetails(session, { detailPath: '' });
} catch (error) {
  if (error instanceof MovieboxApiError) {
    console.log('SDK Error:', error.message);
  }
}
```

---

### MovieboxHttpError

HTTP request failures.

```typescript
class MovieboxHttpError extends MovieboxApiError {
  name: 'MovieboxHttpError';
  status: number;    // HTTP status code
  url: string;       // Request URL that failed
}
```

**When it's thrown:**
- HTTP response status is not OK (not 2xx)
- Response cannot be retried successfully

**Example:**

```typescript
import { MovieboxHttpError } from 'moviebox-js-sdk';

try {
  const result = await search(session, { query: 'test' });
} catch (error) {
  if (error instanceof MovieboxHttpError) {
    console.log(`HTTP ${error.status} error for ${error.url}`);
    console.log(error.message);
  }
}
```

---

### EmptyResponseError

The API returned an empty response.

```typescript
class EmptyResponseError extends MovieboxApiError {
  name: 'EmptyResponseError';
}
```

**When it's thrown:**
- API returns empty body
- HTML page is empty

**Handling:**

```typescript
import { EmptyResponseError } from 'moviebox-js-sdk';

try {
  const html = await session.fetchHtml('/some/path');
} catch (error) {
  if (error instanceof EmptyResponseError) {
    // Retry or use fallback
    console.log('Empty response, might need to try a different mirror');
  }
}
```

---

### UnsuccessfulResponseError

The API returned a failure response (non-zero code in envelope).

```typescript
class UnsuccessfulResponseError extends MovieboxApiError {
  name: 'UnsuccessfulResponseError';
  response: unknown;  // The raw API response
}
```

**When it's thrown:**
- API response envelope has non-zero `code`
- API reports failure in response data

**Handling:**

```typescript
import { UnsuccessfulResponseError } from 'moviebox-js-sdk';

try {
  const results = await search(session, { query: 'test' });
} catch (error) {
  if (error instanceof UnsuccessfulResponseError) {
    console.log('API reported failure:', error.response);
  }
}
```

---

### GeoBlockedError

Content is not available in the user's region.

```typescript
class GeoBlockedError extends MovieboxHttpError {
  name: 'GeoBlockedError';
  // Inherits: status, url
}
```

**When it's thrown:**
- HTTP status 451 (Unavailable For Legal Reasons)
- HTTP status 403 with geo-blocking detected

**Important:** This error is not retried because changing mirrors won't resolve the issue.

**Handling:**

```typescript
import { GeoBlockedError } from 'moviebox-js-sdk';

try {
  const details = await getMovieDetails(session, { detailPath: 'some-movie' });
} catch (error) {
  if (error instanceof GeoBlockedError) {
    console.log('This content is not available in your region');
    // Inform user or use VPN suggestion
  }
}
```

---

### MirrorExhaustedError

All mirror hosts have failed.

```typescript
interface MirrorFailure {
  url: string;    // The mirror URL that failed
  error: Error;   // The error that caused the failure
}

class MirrorExhaustedError extends MovieboxApiError {
  name: 'MirrorExhaustedError';
  failures: MirrorFailure[];  // Array of all failures
}
```

**When it's thrown:**
- All configured mirror hosts have failed
- No mirror could successfully fulfill the request

**Handling:**

```typescript
import { MirrorExhaustedError } from 'moviebox-js-sdk';

try {
  const details = await getMovieDetails(session, { detailPath: 'movie' });
} catch (error) {
  if (error instanceof MirrorExhaustedError) {
    console.log('All mirrors failed:');
    for (const failure of error.failures) {
      console.log(`  - ${failure.url}: ${failure.error.message}`);
    }
    // Consider implementing custom fallback logic
  }
}
```

---

### RetryLimitExceededError

Maximum retry attempts have been exceeded.

```typescript
class RetryLimitExceededError extends MovieboxApiError {
  name: 'RetryLimitExceededError';
  attempts: number;  // Number of attempts made
}
```

**When it's thrown:**
- Request failed after all retry attempts
- Includes the original error that caused the final failure

**Handling:**

```typescript
import { RetryLimitExceededError } from 'moviebox-js-sdk';

try {
  const result = await search(session, { query: 'movie' });
} catch (error) {
  if (error instanceof RetryLimitExceededError) {
    console.log(`Failed after ${error.attempts} attempts`);
    console.log('Original error:', error.message);
    // Implement exponential backoff or notify user
  }
}
```

---

## Handling Errors

### Basic Error Handling Pattern

```typescript
import { 
  MovieboxApiError,
  GeoBlockedError,
  MirrorExhaustedError,
  RetryLimitExceededError,
  // ... other imports
} from 'moviebox-js-sdk';

async function handleMovieOperation(session: MovieboxSession, detailPath: string) {
  try {
    const details = await getMovieDetails(session, { detailPath });
    return details;
  } catch (error) {
    if (error instanceof GeoBlockedError) {
      // Content not available in region
      return { error: 'geo_blocked', message: error.message };
    }
    
    if (error instanceof MirrorExhaustedError) {
      // All mirrors failed
      return { error: 'mirrors_exhausted', failures: error.failures };
    }
    
    if (error instanceof RetryLimitExceededError) {
      // Retries didn't help
      return { error: 'retry_exceeded', attempts: error.attempts };
    }
    
    if (error instanceof MovieboxApiError) {
      // Generic SDK error
      return { error: 'api_error', message: error.message };
    }
    
    // Re-throw unexpected errors
    throw error;
  }
}
```

### Type-Safe Error Handling

```typescript
import { MovieboxApiError, isMovieboxError } from 'moviebox-js-sdk';

// Type guard function
function isMovieboxError(error: unknown): error is MovieboxApiError {
  return error instanceof MovieboxApiError;
}

// Usage
function handleError(error: unknown) {
  if (isMovieboxError(error)) {
    console.log('SDK Error:', error.name, error.message);
  } else if (error instanceof Error) {
    console.log('JavaScript Error:', error.message);
  } else {
    console.log('Unknown error:', error);
  }
}
```

### Conditional Error Recovery

```typescript
async function searchWithFallback(
  session: MovieboxSession, 
  query: string,
  maxRetries: number = 3
) {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await search(session, { query });
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry geo-blocking
      if (error instanceof GeoBlockedError) {
        throw error;
      }
      
      // Log retry attempt
      console.log(`Attempt ${attempt} failed, retrying...`);
    }
  }
  
  throw lastError;
}
```

---

## Best Practices

### 1. Always Catch Specific Errors First

```typescript
// ❌ Wrong - Generic catch first
try {
  // operation
} catch (error) {
  if (error instanceof MovieboxApiError) {
    // Never reached if catching as unknown first
  }
}

// ✅ Correct - Specific errors first
try {
  // operation
} catch (error) {
  if (error instanceof GeoBlockedError) {
    // Handle geo-blocking
  } else if (error instanceof MirrorExhaustedError) {
    // Handle mirror failure
  } else if (error instanceof MovieboxApiError) {
    // Handle generic SDK error
  }
}
```

### 2. Preserve Error Context

```typescript
// ❌ Wrong - Losing error context
catch (error) {
  console.log(error.message); // Only message
}

// ✅ Correct - Preserving full error
catch (error) {
  if (error instanceof MovieboxHttpError) {
    console.log({
      name: error.name,
      message: error.message,
      status: error.status,
      url: error.url,
      stack: error.stack
    });
  }
}
```

### 3. Implement Proper Retry Logic

```typescript
import { createLogger } from 'moviebox-js-sdk';

const session = new MovieboxSession({
  logger: createLogger({ level: 'debug' }),
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    // Retry on network errors and 5xx responses
    shouldRetryError: (error) => !(error instanceof GeoBlockedError),
    shouldRetryResponse: (response) => response.status >= 500
  }
});
```

### 4. Use Logging for Debugging

```typescript
import { createLogger } from 'moviebox-js-sdk';

const session = new MovieboxSession({
  logger: createLogger({ level: 'debug' })
});

// Logs will show:
// - Which mirror is being used
// - Retry attempts
// - Request/response details
const result = await search(session, { query: 'movie' });
```

### 5. Handle Edge Cases

```typescript
async function robustMovieFetch(session: MovieboxSession, detailPath: string) {
  try {
    return await getMovieDetails(session, { detailPath });
  } catch (error) {
    // Handle missing content
    if (error instanceof MovieboxApiError) {
      if (error.message.includes('No resource')) {
        return null; // Content not available
      }
    }
    throw error;
  }
}
```

---

## Error Recovery Strategies

### Mirror Fallback

The SDK automatically handles mirror fallback, but you can customize behavior:

```typescript
const session = new MovieboxSession({
  // Add custom mirrors
  mirrorHosts: [
    'h5.aoneroom.com',
    'movieboxapp.in',
    'custom-mirror.example.com'
  ],
  retry: {
    // Reduce retries if mirrors change frequently
    maxAttempts: 2,
    delayMs: 500
  }
});
```

### Circuit Breaker Pattern

Implement a circuit breaker for repeated failures:

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure: Date | null = null;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.failures >= this.threshold) {
      const timeSinceLastFailure = Date.now() - (this.lastFailure?.getTime() ?? 0);
      if (timeSinceLastFailure < this.timeout) {
        throw new Error('Circuit breaker open');
      }
    }

    try {
      const result = await operation();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailure = new Date();
      throw error;
    }
  }
}
```

---

## See Also

- [API Reference](./api-reference.md)
- [Types Reference](./types.md)
- [Proxy Configuration](./proxy.md)
- [Session Management Guide](./guides/session-management.md)
