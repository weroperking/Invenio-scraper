# 🎬 invenio-scraper

[![npm version](https://img.shields.io/npm/v/invenio-scraper)](https://www.npmjs.com/package/invenio-scraper)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)

**invenio-scraper - A web scraping library for extracting movie and TV show data**

A resilient, fully-typed JavaScript SDK for interacting with Moviebox APIs.

## ✨ Features

- 🔍 **Search** — Find movies, TV series, and music with filtering and pagination
- 🎥 **Details** — Get full metadata including ratings, subtitles, and quality options
- 📡 **Streaming** — Extract direct stream URLs with quality selection
- ⬇️ **Downloads** — Parallel chunked downloads with resume support and progress tracking
- 🔄 **Session Management** — Automatic mirror fallback (7 mirrors), retry policies, cookie handling
- 🌐 **Proxy Support** — HTTP/HTTPS/SOCKS proxy routing via undici
- 📦 **Pure ESM** — Modern JavaScript module format with tree-shaking support
- 🛡️ **Fully Typed** — Complete TypeScript type definitions included

## 📦 Installation

```bash
npm install invenio-scraper
```

```bash
pnpm add invenio-scraper
```

```bash
yarn add invenio-scraper
```

**Requirements:** Node.js 18+

## 🚀 Quick Start

```typescript
import {
  MovieboxSession,
  search,
  getMovieDetails,
  getMovieStreamUrl
} from 'invenio-scraper';

const session = new MovieboxSession();

// Search for content
const results = await search(session, { query: 'Inception' });
const first = results.results[0];

if (first) {
  // Get detailed movie information
  const details = await getMovieDetails(session, {
    detailPath: first.raw.detailPath
  });

  // Get stream URL
  const stream = await getMovieStreamUrl(session, {
    detailPath: first.raw.detailPath,
    quality: 'best'
  });

  console.log(`${details.title}: ${stream.stream?.url}`);
}
```

## 📚 API Overview

| Capability | Function | Description |
|------------|----------|-------------|
| 🔍 Search | [`search(session, params)`](docs/api-reference.md) | Search movies, series, and music |
| 🎬 Movie Details | [`getMovieDetails(session, params)`](docs/api-reference.md) | Get full movie metadata |
| 📺 Series Details | [`getSeriesDetails(session, params)`](docs/api-reference.md) | Get series metadata & seasons |
| 📺 Episode Qualities | [`getEpisodeQualities(session, params)`](docs/api-reference.md) | Get episode download options |
| 📡 Movie Stream | [`getMovieStreamUrl(session, params)`](docs/api-reference.md) | Extract movie stream URL |
| 📡 Episode Stream | [`getEpisodeStreamUrl(session, params)`](docs/api-reference.md) | Extract episode stream URL |
| ⬇️ Movie Download | [`downloadMovie(session, params)`](docs/api-reference.md) | Download a movie file |
| ⬇️ Episode Download | [`downloadEpisode(session, params)`](docs/api-reference.md) | Download an episode file |
| ⬇️ Media Download | [`downloadMediaFile(session, option, destination, options)`](docs/api-reference.md) | Download with progress tracking |

## ⚙️ Configuration

### Session Options

```typescript
import { MovieboxSession, createLogger } from 'invenio-scraper';

const session = new MovieboxSession({
  host: 'h5.aoneroom.com',
  mirrorHosts: ['h5.aoneroom.com', 'movieboxapp.in'],
  proxyUrl: process.env.INVENIO_API_PROXY,
  logger: createLogger({ level: 'info' }),
  retry: {
    maxAttempts: 3,
    delayMs: 500
  }
});
```

### Options Table

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `host` | `string` | First mirror | Primary API host |
| `mirrorHosts` | `readonly string[]` | 7 built-in mirrors | List of fallback mirrors |
| `protocol` | `'http' \| 'https'` | `'https'` | Protocol to use |
| `proxyUrl` | `string` | — | HTTP/HTTPS/SOCKS proxy URL |
| `logger` | `Logger` | No-op logger | Custom logger instance |
| `retry.maxAttempts` | `number` | `2` | Maximum retry attempts |
| `retry.delayMs` | `number` | `200` | Delay between retries (ms) |
| `defaultHeaders` | `HeadersInit` | Built-in headers | Custom request headers |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `INVENIO_API_HOST` | Override the default mirror host |
| `INVENIO_API_PROXY` | Route requests through an HTTP/S/SOCKS proxy |

## 📖 Usage Examples

### Basic Search

```typescript
import { MovieboxSession, search } from 'invenio-scraper';

const session = new MovieboxSession();

// Search with filters
const results = await search(session, {
  query: 'The Matrix',
  type: 'movie', // 'all' | 'movie' | 'tv' | 'music'
  page: 1,
  perPage: 20
});

console.log(`Found ${results.totalCount} results`);
console.log(`Has more: ${results.hasMore}`);

for (const item of results.results) {
  console.log(`${item.title} (${item.releaseYear ?? 'N/A'}) - ${item.rating}/10`);
}
```

### Getting Movie Details

```typescript
import { MovieboxSession, getMovieDetails } from 'invenio-scraper';

const session = new MovieboxSession();

const details = await getMovieDetails(session, {
  detailPath: 'inception-e1BOR6f19C7'
});

console.log(`Title: ${details.title}`);
console.log(`Synopsis: ${details.synopsis}`);
console.log(`Rating: ${details.rating}/10 (${details.ratingCount} votes)`);
console.log(`Duration: ${details.durationLabel}`);
console.log(`Genres: ${details.genres.join(', ')}`);

// Available download qualities
for (const download of details.downloads) {
  console.log(`${download.quality}: ${(download.sizeBytes / 1024 / 1024).toFixed(1)} MB`);
}

// Available subtitles
for (const caption of details.captions) {
  console.log(`Subtitle: ${caption.language}`);
}
```

### Downloading with Progress

```typescript
import { MovieboxSession, downloadMovie } from 'invenio-scraper';

const session = new MovieboxSession();

const filePath = await downloadMovie(session, {
  detailPath: 'inception-e1BOR6f19C7',
  quality: 1080, // or 'best' | 'worst' | number
  outputDir: './downloads',
  mode: 'resume', // 'auto' | 'resume' | 'overwrite'
  onProgress: ({ downloadedBytes, totalBytes, percentage }) => {
    const mb = (downloadedBytes / 1024 / 1024).toFixed(1);
    const total = ((totalBytes ?? 0) / 1024 / 1024).toFixed(1);
    process.stdout.write(`\r${mb}MB / ${total}MB (${percentage ?? 0}%)`);
  }
});

console.log(`\nSaved to: ${filePath}`);
```

### Series & Episodes

```typescript
import {
  MovieboxSession,
  search,
  getSeriesDetails,
  getEpisodeQualities,
  getEpisodeStreamUrl,
  downloadEpisode
} from 'invenio-scraper';

const session = new MovieboxSession();

// Search for a series
const results = await search(session, { query: 'Breaking Bad', type: 'tv' });
const series = results.results.find(r => r.type === 'tv');

if (series) {
  // Get series details
  const details = await getSeriesDetails(session, {
    detailPath: series.raw.detailPath
  });

  console.log(`${details.title} — ${details.seasons?.length} seasons`);

  // Get episode qualities
  const qualities = await getEpisodeQualities(session, {
    detailPath: series.raw.detailPath,
    season: 1,
    episode: 1
  });

  console.log('Available qualities:', qualities.downloads.map(d => d.quality));

  // Get stream URL
  const stream = await getEpisodeStreamUrl(session, {
    detailPath: series.raw.detailPath,
    season: 1,
    episode: 1,
    quality: 'best'
  });

  console.log('Stream URL:', stream.stream?.url);

  // Download episode
  const filePath = await downloadEpisode(session, {
    detailPath: series.raw.detailPath,
    season: 1,
    episode: 1,
    quality: 720,
    outputDir: './downloads'
  });

  console.log('Downloaded:', filePath);
}
```

### Proxy Configuration

```typescript
import { MovieboxSession } from 'invenio-scraper';

// HTTP proxy
const session = new MovieboxSession({
  proxyUrl: 'http://proxy.example.com:8080'
});

// SOCKS5 proxy
const sessionWithSocks = new MovieboxSession({
  proxyUrl: 'socks5://user:password@proxy.example.com:1080'
});

// Or use environment variable
// INVENIO_API_PROXY=socks5://proxy.example.com:1080
```

See [docs/proxy.md](docs/proxy.md) for detailed proxy configuration.

### Error Handling

```typescript
import {
  MovieboxSession,
  search,
  MovieboxApiError,
  MovieboxHttpError,
  GeoBlockedError,
  MirrorExhaustedError,
  RetryLimitExceededError
} from 'invenio-scraper';

const session = new MovieboxSession();

try {
  const results = await search(session, { query: 'Inception' });
} catch (error) {
  if (error instanceof GeoBlockedError) {
    console.error('Content is geo-blocked in your region');
  } else if (error instanceof MirrorExhaustedError) {
    console.error('All mirrors failed:', error.failures);
  } else if (error instanceof RetryLimitExceededError) {
    console.error(`Failed after ${error.attempts} attempts`);
  } else if (error instanceof MovieboxHttpError) {
    console.error(`HTTP ${error.status} error for ${error.url}`);
  } else if (error instanceof MovieboxApiError) {
    console.error('API error:', error.message);
  }
}
```

### Custom Logger

```typescript
import { MovieboxSession, createLogger, createNoopLogger } from 'invenio-scraper';

// Enable logging
const session = new MovieboxSession({
  logger: createLogger({ level: 'debug' })
});

// Disable logging (default)
const silentSession = new MovieboxSession({
  logger: createNoopLogger()
});
```

## 🛡️ Error Classes

| Error Class | Description |
|-------------|-------------|
| `MovieboxApiError` | Base error class for all SDK errors |
| `MovieboxHttpError` | HTTP errors with status code and URL |
| `EmptyResponseError` | API returned an empty response |
| `UnsuccessfulResponseError` | API reported failure in response |
| `GeoBlockedError` | Content not available in region |
| `MirrorExhaustedError` | All mirror hosts failed |
| `RetryLimitExceededError` | Maximum retry attempts exceeded |

## 📘 TypeScript Support

This SDK is written in TypeScript and provides full type definitions. All types are exported:

```typescript
import type {
  SearchParams,
  SearchResultPage,
  NormalizedSearchResult,
  MovieDetails,
  SeriesDetails,
  EpisodeQualities,
  StreamResult,
  DownloadProgress,
  Logger
} from 'invenio-scraper';
```

## 📄 Documentation

- [API Reference](docs/api-reference.md) — Detailed API documentation
- [Proxy Configuration](docs/proxy.md) — Proxy setup guide

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run checks: `pnpm lint && pnpm test`
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please include tests and update fixtures when applicable.

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck
```

## 📜 License

This project is licensed under the ISC License.

---

<p align="center">
  ⭐ Star this repo if you find it useful!
</p>
