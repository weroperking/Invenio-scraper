# Getting Started

This guide will help you get started with the Invenio Scraper SDK, from installation to making your first API call.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Your First API Call](#your-first-api-call)
- [Next Steps](#next-steps)

---

## Prerequisites

### Node.js Version

The SDK requires **Node.js 18.0.0** or later.

```bash
# Check your Node.js version
node --version
```

### Package Manager

The SDK uses **pnpm** for package management. If you don't have pnpm installed:

```bash
# Install pnpm globally
npm install -g pnpm

# Or use corepack (Node.js 14+)
corepack enable
```

---

## Installation

### Install from npm

```bash
pnpm add @weroperking/invenio-scraper
```

### Install from GitHub (Latest Development Version)

```bash
pnpm add github:weroperking/invenio-scraper
```

### Verify Installation

```typescript
// Check that the SDK loads correctly
import { MovieboxSession } from '@weroperking/invenio-scraper';

const session = new MovieboxSession();
console.log('SDK loaded successfully');
```

> **Note:** Use `tsx` to run TypeScript files directly. For example: `npx tsx your-script.ts`

---

## Basic Setup

### Creating a Session

The `MovieboxSession` is the main entry point for all SDK operations. Create one instance and reuse it throughout your application.

```typescript
import { MovieboxSession, createLogger } from '@weroperking/invenio-scraper';

// Create a session with optional configuration
const session = new MovieboxSession({
  // Enable logging for debugging
  logger: createLogger({ level: 'info' }),
  
  // Configure retry behavior
  retry: {
    maxAttempts: 3,
    delayMs: 500
  }
});
```

### Configuration Options

Here's a more complete configuration:

```typescript
import { MovieboxSession, createLogger } from '@weroperking/invenio-scraper';

const session = new MovieboxSession({
  // Connection options
  host: 'h5.aoneroom.com',
  protocol: 'https',
  
  // Mirror hosts for fallback
  mirrorHosts: [
    'h5.aoneroom.com',
    'movieboxapp.in'
  ],
  
  // Proxy configuration (optional)
  proxyUrl: process.env.MOVIEBOX_PROXY,
  
  // Logging
  logger: createLogger({
    level: 'debug',
    name: 'my-app'
  }),
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    delayMs: 500,
    // Custom retry logic
    shouldRetryError: (error) => {
      // Don't retry on geo-blocking
      return error.name !== 'GeoBlockedError';
    }
  },
  
  // Custom headers
  defaultHeaders: {
    'X-Custom-Header': 'value'
  }
});
```

---

## Your First API Call

### Step 1: Search for Content

```typescript
import { MovieboxSession, search, createLogger } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  // Create session
  const session = new MovieboxSession({
    logger: createLogger({ level: 'info' })
  });

  // Search for movies
  const results = await search(session, {
    query: 'Titanic',
    type: 'movie',  // 'movie', 'tv', 'music', or 'all'
    page: 1,
    perPage: 10
  });

  console.log(`Found ${results.totalCount} results`);
  
  // Display first result
  if (results.results.length > 0) {
    const movie = results.results[0];
    console.log(`Title: ${movie.title}`);
    console.log(`Year: ${movie.releaseYear}`);
    console.log(`Rating: ${movie.rating}`);
    console.log(`Has Download: ${movie.hasResource}`);
    console.log(`Detail URL: ${movie.pageUrl}`);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Step 2: Get Movie Details

```typescript
import { MovieboxSession, search, getMovieDetails, createLogger } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const session = new MovieboxSession({
    logger: createLogger({ level: 'info' })
  });

  // First, search for the movie
  const searchResults = await search(session, {
    query: 'Titanic',
    type: 'movie'
  });

  if (searchResults.results.length === 0) {
    console.log('No results found');
    return;
  }

  // Get the first result's detail path
  const movie = searchResults.results[0];
  const detailPath = movie.id; // Using the ID as detail path

  // Fetch full details
  const details = await getMovieDetails(session, {
    detailPath: detailPath
  });

  console.log('Movie Details:');
  console.log(`  Title: ${details.title}`);
  console.log(`  Synopsis: ${details.synopsis}`);
  console.log(`  Duration: ${details.durationLabel}`);
  console.log(`  Genres: ${details.genres.join(', ')}`);
  console.log(`  Rating: ${details.rating}/10`);
  console.log(`  Downloads available: ${details.downloads.length}`);
  
  if (details.bestDownload) {
    console.log(`  Best quality: ${details.bestDownload.quality}`);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Step 3: Stream or Download

```typescript
import { MovieboxSession, getMovieDetails, getMovieStreamUrl, downloadMovie, createLogger } from '@weroperking/invenio-scraper';
import { createWriteStream } from 'node:fs';

async function main(): Promise<void> {
  const session = new MovieboxSession({
    logger: createLogger({ level: 'info' })
  });

  // Get movie details
  const details = await getMovieDetails(session, {
    detailPath: 'titanic-id'
  });

  // Option 1: Get streaming URL
  console.log('Getting stream URL...');
  const streamResult = await getMovieStreamUrl(session, {
    detailPath: 'titanic-id',
    quality: 'best'
  });

  if (streamResult.stream) {
    console.log(`Stream URL: ${streamResult.stream.url}`);
    console.log(`Quality: ${streamResult.stream.quality}`);
    console.log(`Duration: ${streamResult.stream.durationSeconds}s`);
  }

  // Option 2: Download movie
  console.log('Starting download...');
  const destination = await downloadMovie(session, {
    detailPath: 'titanic-id',
    quality: 'best',
    outputDir: './downloads',
    onProgress: (progress) => {
      if (progress.percentage) {
        console.log(`Progress: ${progress.percentage}%`);
      }
    }
  });

  console.log(`Downloaded to: ${destination}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## Next Steps

Now that you've made your first API calls, explore these guides to learn more:

### Session Management
Learn about [Session Management](./session-management.md):
- Configuring mirrors and fallback
- Retry policies
- Cookie management
- Proxy configuration

### Downloading
Learn about [Downloading](./downloading.md):
- Downloading movies and episodes
- Progress tracking
- Resume support
- Custom filenames

### Streaming
Learn about [Streaming](./streaming.md):
- Getting stream URLs
- Quality selection
- Working with stream metadata

### Error Handling
Learn about [Error Handling](../errors.md):
- Understanding error types
- Handling specific errors
- Best practices

### API Reference
See the full [API Reference](../api-reference.md) for detailed documentation on all methods and types.

---

## Example Projects

Check out the examples directory for complete integration examples:

- **Express.js** - REST API wrapper
- **Next.js** - Server-side rendering example
- **Vue** - Frontend integration example

---

## Common Issues

### "No resource available"

This means the content doesn't have downloadable/streamable versions yet. This is determined by the MovieBox API, not the SDK.

### "Geo-blocked" Error

The content is not available in your region. Consider using a proxy or VPN.

### "All mirrors exhausted"

All configured mirror hosts failed. Check your network connection or try different mirror hosts.

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/weroperking/invenio-scraper/issues)
- **Discussions**: [GitHub Discussions](https://github.com/weroperking/invenio-scraper/discussions)
- **Documentation**: See other docs in the `docs/` folder
