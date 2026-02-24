# API Reference

This document provides detailed API documentation for `@weroperking/invenio-scraper`, including full method signatures, parameters, return types, and usage examples.

---

## Table of Contents

- [Session](#session)
- [Search](#search)
- [Movie APIs](#movie-apis)
- [Series APIs](#series-apis)
- [Streaming](#streaming)
- [Downloading](#downloading)
- [Logging](#logging)
- [Error Handling](#error-handling)

---

## Session

### MovieboxSession

The main session class for interacting with the MovieBox API. Handles HTTP requests, cookie management, mirror fallback, and retry logic.

```typescript
import { MovieboxSession, createLogger } from '@weroperking/invenio-scraper';

const session = new MovieboxSession({
  host: 'h5.aoneroom.com',
  mirrorHosts: ['h5.aoneroom.com', 'movieboxapp.in'],
  proxyUrl: process.env.MOVIEBOX_API_PROXY,
  logger: createLogger({ level: 'info' }),
  retry: {
    maxAttempts: 2,
    delayMs: 250
  }
});
```

> **Note:** Use `tsx` to run TypeScript files directly. For example: `npx tsx your-script.ts`

#### Constructor

```typescript
constructor(options: MovieboxSessionOptions = {})
```

##### MovieboxSessionOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `host` | `string` | Environment `MOVIEBOX_HOST` or default | Primary host to use |
| `protocol` | `'https' \| 'http'` | `'https'` | Protocol to use |
| `baseUrl` | `string` | - | Full base URL (overrides host) |
| `mirrorHosts` | `readonly string[]` | Built-in mirrors | Array of mirror hosts to try |
| `defaultHeaders` | `HeadersInit` | - | Default headers for all requests |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Custom fetch implementation |
| `maxRetries` | `number` | `2` | Number of retry attempts (deprecated, use `retry.maxAttempts`) |
| `retryDelayMs` | `number` | `200` | Delay between retries in ms (deprecated, use `retry.delayMs`) |
| `retry.maxAttempts` | `number` | `3` | Maximum retry attempts |
| `retry.delayMs` | `number` | `200` | Delay between retries in milliseconds |
| `retry.shouldRetryError` | `(error: Error, context: RetryContext) => boolean` | - | Custom error retry predicate |
| `retry.shouldRetryResponse` | `(response: Response, context: RetryContext) => boolean` | - | Custom response retry predicate |
| `logger` | `Logger` | No-op logger | Custom logger instance |
| `proxyUrl` | `string` | Environment `MOVIEBOX_PROXY` | Proxy URL for requests |
| `dispatcher` | `Dispatcher` | - | Custom undici dispatcher |

##### RetryContext

```typescript
interface RetryContext {
  attempt: number;      // Current attempt number (1-indexed)
  maxAttempts: number;  // Maximum attempts allowed
  url: string;          // Request URL
  baseUrl: string;      // Base URL being used
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `baseUrl` | `string` (readonly) | Current base URL being used |
| `fetchImpl` | `typeof fetch` (readonly) | The fetch implementation |
| `defaultHeaders` | `Record<string, string>` (readonly) | Default headers for requests |
| `logger` | `Logger` (readonly) | Logger instance |

#### Public Methods

##### buildUrl

Builds a complete URL from a path and optional query parameters.

```typescript
buildUrl(path: string, searchParams?: RequestSearchParams, baseUrl?: string): string
```

**Parameters:**
- `path` - API endpoint path
- `searchParams` - Optional query parameters
- `baseUrl` - Optional base URL override

**Returns:** Complete URL string

---

##### buildDetailUrl

Builds a detail page URL for a specific item.

```typescript
buildDetailUrl(detailPath: string, subjectId: string): string
```

**Parameters:**
- `detailPath` - The detail path slug (e.g., 'titanic-m7a9yt0abq6')
- `subjectId` - The subject ID

**Returns:** Full detail URL

---

##### fetchJson

Performs a JSON fetch request.

```typescript
async fetchJson<T>(path: string, options?: FetchJsonOptions): Promise<T>
```

**Parameters:**
- `path` - API endpoint path
- `options.method` - HTTP method (`'GET'` | `'POST'`), default: `'GET'`
- `options.body` - Request body
- `options.headers` - Additional headers
- `options.searchParams` - Query parameters
- `options.requireCookies` - Whether cookies are required

**Returns:** Parsed JSON response

---

##### postJson

Performs a POST request with JSON body.

```typescript
async postJson<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T>
```

**Parameters:**
- `path` - API endpoint path
- `body` - Request body (will be JSON stringified)
- `headers` - Optional headers

**Returns:** Parsed JSON response

---

##### fetchHtml

Fetches an HTML page.

```typescript
async fetchHtml(path: string, options?: FetchHtmlOptions): Promise<string>
```

**Parameters:**
- `path` - API endpoint path
- `options.headers` - Optional headers
- `options.searchParams` - Query parameters
- `options.requireCookies` - Whether cookies are required

**Returns:** HTML string

---

##### ensureSessionCookies

Ensures session cookies are initialized. Required for some API endpoints.

```typescript
async ensureSessionCookies(): Promise<boolean>
```

**Returns:** `true` if cookies were obtained, `false` otherwise

---

## Search

### search

Searches for movies, TV series, or music.

```typescript
import { search } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const results = await search(session, { 
    query: 'Merlin', 
    type: 'movie', 
    page: 1,
    perPage: 24 
  });
  
  console.log(results);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

#### Function Signature

```typescript
async function search(session: MovieboxSession, params: SearchParams): Promise<SearchResultPage>
```

#### SearchParams

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | `string` | Yes | - | Search query string |
| `type` | `SearchFilter` | No | `'all'` | Filter: `'all'`, `'movie'`, `'tv'`, or `'music'` |
| `page` | `number` | No | `1` | Page number (1-indexed) |
| `perPage` | `number` | No | `24` | Results per page |

#### SearchResultPage

```typescript
interface SearchResultPage {
  results: NormalizedSearchResult[];  // Array of search results
  page: number;                       // Current page number
  perPage: number;                   // Results per page
  totalCount: number;                 // Total number of results
  hasMore: boolean;                   // Whether more pages exist
  nextPage: number | null;            // Next page number or null
  raw: RawSearchData;                 // Raw API response
}
```

#### NormalizedSearchResult

```typescript
interface NormalizedSearchResult {
  id: string;              // Unique identifier
  title: string;           // Media title
  type: SearchResultType;  // Type: 'movie' | 'tv' | 'music' | 'unknown'
  description: string;     // Media description
  releaseDate: string | null;      // Release date string
  releaseYear: number | null;     // Release year
  rating: number | null;          // IMDB rating
  genres: string[];        // Array of genres
  country: string | null;  // Country of origin
  pageUrl: string;         // Detail page URL
  posterUrl: string | null;        // Poster image URL
  subtitles: string[];      // Available subtitle languages
  hasResource: boolean;     // Whether content is available
  raw: RawSearchItem;      // Raw API response item
}
```

---

## Movie APIs

### getMovieDetails

Retrieves detailed information about a movie.

```typescript
import { getMovieDetails } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const details = await getMovieDetails(session, { 
    detailPath: 'titanic-m7a9yt0abq6' 
  });
  
  console.log(details);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

#### Function Signature

```typescript
async function getMovieDetails(
  session: MovieboxSession, 
  params: GetMovieDetailsParams
): Promise<MovieDetails>
```

#### GetMovieDetailsParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `detailPath` | `string` | Yes | Detail path slug (e.g., 'titanic-m7a9yt0abq6') |
| `subjectId` | `string` | No | Optional subject ID (resolved from detailPath if not provided) |

#### MovieDetails

```typescript
interface MovieDetails {
  id: string;                          // Movie ID
  detailPath: string;                 // Detail path
  title: string;                      // Movie title
  synopsis: string;                  // Movie description
  releaseDate: string | null;        // Release date
  releaseYear: number | null;         // Release year
  durationSeconds: number | null;    // Duration in seconds
  durationLabel: string | null;      // Human-readable duration
  genres: string[];                   // Array of genres
  posterUrl: string | null;           // Poster image URL
  backdropUrl: string | null;         // Backdrop image URL
  rating: number | null;              // IMDB rating
  ratingCount: number | null;         // IMDB rating count
  country: string | null;             // Country of origin
  hasResource: boolean;               // Whether content is available
  availableSubtitleLanguages: string[];  // Available subtitle languages
  downloads: MovieDownloadOption[];   // Available download options
  bestDownload: MovieDownloadOption | null;   // Best quality download
  worstDownload: MovieDownloadOption | null;  // Lowest quality download
  captions: MovieSubtitleOption[];    // Available subtitles
}
```

---

### getMovieStreamUrl

Gets streaming URL for a movie.

```typescript
import { getMovieStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const result = await getMovieStreamUrl(session, {
    detailPath: 'titanic-m7a9yt0abq6',
    quality: 'best'  // or 'worst', or a number like 1080
  });
  
  console.log(result);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

#### Function Signature

```typescript
async function getMovieStreamUrl(
  session: MovieboxSession, 
  params: MovieStreamParams
): Promise<StreamResult>
```

#### MovieStreamParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `detailPath` | `string` | Yes | Detail path slug |
| `subjectId` | `string` | No | Optional subject ID |
| `quality` | `StreamQuality` | No | Desired quality (`'best'`, `'worst'`, or resolution number) |

#### StreamQuality

```typescript
type StreamQuality = 'best' | 'worst' | number | undefined;
```

#### StreamResult

```typescript
interface StreamResult {
  stream: StreamOption | null;        // Selected stream
  options: StreamOption[];            // All available streams
  captions: MovieSubtitleOption[];    // Available subtitles
  hasResource: boolean;               // Whether content is available
  freeStreamsRemaining: number;       // Remaining free streams
  isLimited: boolean;                 // Whether limited access
}
```

#### StreamOption

```typescript
interface StreamOption {
  id: string;              // Stream ID
  resolution: number;       // Resolution (e.g., 1080)
  quality: string;          // Quality string (e.g., '1080p')
  sizeBytes: number;        // File size in bytes
  durationSeconds: number; // Duration in seconds
  format: string;          // Video format
  codec: string;           // Video codec
  url: string;             // Stream URL
}
```

---

### downloadMovie

Downloads a movie to the local filesystem.

```typescript
import { downloadMovie } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const destination = await downloadMovie(session, {
    detailPath: 'titanic-m7a9yt0abq6',
    quality: 'best',
    outputDir: './downloads',
    mode: 'auto',
    parallel: 4,
    chunkSize: 4 * 1024 * 1024,  // 4 MiB
    onProgress: (progress) => {
      console.log(`Downloaded: ${progress.percentage}%`);
    }
  });
  
  console.log(`Downloaded to: ${destination}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

#### Function Signature

```typescript
async function downloadMovie(
  session: MovieboxSession, 
  params: DownloadMovieParams
): Promise<string>
```

#### DownloadMovieParams

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `detailPath` | `string` | Yes | - | Detail path slug |
| `subjectId` | `string` | No | - | Optional subject ID |
| `quality` | `DownloadQuality` | No | `'best'` | Download quality |
| `outputDir` | `string` | No | Current directory | Output directory |
| `filename` | `string` | No | Auto-generated | Custom filename |
| `mode` | `DownloadMode` | No | `'auto'` | Download mode |
| `parallel` | `number` | No | `4` | Parallel download chunks |
| `chunkSize` | `number` | No | `4 MiB` | Chunk size in bytes |
| `keepTempParts` | `boolean` | No | `false` | Keep partial files |
| `headers` | `Record<string, string>` | No | - | Custom headers |
| `onProgress` | `(progress: DownloadProgress) => void` | No | - | Progress callback |

---

## Series APIs

### getSeriesDetails

Retrieves detailed information about a TV series.

```typescript
import { getSeriesDetails } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const details = await getSeriesDetails(session, { 
    detailPath: 'merlin-b8z92m3k5w1' 
  });
  
  console.log(details);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

#### Function Signature

```typescript
async function getSeriesDetails(
  session: MovieboxSession, 
  params: GetSeriesDetailsParams
): Promise<SeriesDetails>
```

#### GetSeriesDetailsParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `detailPath` | `string` | Yes | Detail path slug |

#### SeriesDetails

```typescript
interface SeriesDetails {
  id: string;                          // Series ID
  detailPath: string;                  // Detail path
  title: string;                       // Series title
  synopsis: string;                    // Series description
  releaseDate: string | null;          // Release date
  releaseYear: number | null;          // Release year
  genres: string[];                    // Array of genres
  country: string | null;             // Country of origin
  posterUrl: string | null;            // Poster image URL
  rating: number | null;              // IMDB rating
  ratingCount: number | null;         // IMDB rating count
  hasResource: boolean;               // Whether content is available
  availableSubtitleLanguages: string[];  // Available subtitle languages
  seasons: SeriesSeasonSummary[];     // Season summaries
}
```

#### SeriesSeasonSummary

```typescript
interface SeriesSeasonSummary {
  seasonNumber: number;      // Season number
  episodeCount: number;      // Number of episodes
  availableResolutions: number[];  // Available resolutions
}
```

---

### getEpisodeQualities

Gets available download qualities for a specific episode.

```typescript
import { getEpisodeQualities } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const qualities = await getEpisodeQualities(session, {
    detailPath: 'merlin-b8z92m3k5w1',
    season: 1,
    episode: 1
  });
  
  console.log(qualities);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

#### Function Signature

```typescript
async function getEpisodeQualities(
  session: MovieboxSession, 
  params: GetEpisodeQualitiesParams
): Promise<EpisodeQualities>
```

#### GetEpisodeQualitiesParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `detailPath` | `string` | Yes | Detail path slug |
| `season` | `number` | Yes | Season number |
| `episode` | `number` | Yes | Episode number |
| `subjectId` | `string` | No | Optional subject ID |

#### EpisodeQualities

```typescript
interface EpisodeQualities {
  downloads: EpisodeDownloadOption[];       // Available downloads
  bestDownload: EpisodeDownloadOption | null; // Best quality
  worstDownload: EpisodeDownloadOption | null; // Lowest quality
  captions: EpisodeSubtitleOption[];         // Available subtitles
}
```

---

### getEpisodeStreamUrl

Gets streaming URL for a specific episode.

```typescript
import { getEpisodeStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const result = await getEpisodeStreamUrl(session, {
    detailPath: 'merlin-b8z92m3k5w1',
    season: 1,
    episode: 1,
    quality: 1080
  });
  
  console.log(result);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

#### Function Signature

```typescript
async function getEpisodeStreamUrl(
  session: MovieboxSession, 
  params: EpisodeStreamParams
): Promise<StreamResult>
```

#### EpisodeStreamParams

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `detailPath` | `string` | Yes | Detail path slug |
| `season` | `number` | Yes | Season number |
| `episode` | `number` | Yes | Episode number |
| `subjectId` | `string` | No | Optional subject ID |
| `quality` | `StreamQuality` | No | Desired quality |

---

### downloadEpisode

Downloads a specific episode to the local filesystem.

```typescript
import { downloadEpisode } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const destination = await downloadEpisode(session, {
    detailPath: 'merlin-b8z92m3k5w1',
    season: 1,
    episode: 1,
    quality: 'best',
    outputDir: './downloads'
  });
  
  console.log(`Downloaded: ${destination}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

#### Function Signature

```typescript
async function downloadEpisode(
  session: MovieboxSession, 
  params: DownloadEpisodeParams
): Promise<string>
```

#### DownloadEpisodeParams

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `detailPath` | `string` | Yes | - | Detail path slug |
| `subjectId` | `string` | No | - | Optional subject ID |
| `season` | `number` | Yes | - | Season number |
| `episode` | `number` | Yes | - | Episode number |
| `quality` | `DownloadQuality` | No | `'best'` | Download quality |
| `outputDir` | `string` | No | Current dir | Output directory |
| `filename` | `string` | No | Auto-generated | Custom filename |
| `mode` | `DownloadMode` | No | `'auto'` | Download mode |
| `parallel` | `number` | No | `4` | Parallel chunks |
| `chunkSize` | `number` | No | `4 MiB` | Chunk size |
| `keepTempParts` | `boolean` | No | `false` | Keep partial files |
| `headers` | `Record<string, string>` | No | - | Custom headers |
| `onProgress` | `(progress: DownloadProgress) => void` | No | - | Progress callback |

---

## Downloading

### downloadMediaFile

Low-level function to download a media file from a specific URL.

```typescript
import { downloadMediaFile } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  await downloadMediaFile(
    session,
    { id: '123', resolution: 1080, quality: '1080p', sizeBytes: 1500000000, url: 'https://...' },
    './output.mp4',
    {
      mode: 'auto',
      parallel: 4,
      onProgress: (progress) => console.log(progress.percentage)
    }
  );
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

#### Function Signature

```typescript
async function downloadMediaFile(
  session: Pick<MovieboxSession, 'fetchImpl' | 'ensureSessionCookies'>,
  option: MovieDownloadOption,
  destination: string,
  options?: DownloadOptions
): Promise<void>
```

#### DownloadOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | `DownloadMode` | `'auto'` | Download mode |
| `parallel` | `number` | `4` | Parallel download chunks |
| `chunkSize` | `number` | `4 MiB` | Chunk size in bytes |
| `keepTempParts` | `boolean` | `false` | Keep partial files |
| `headers` | `Record<string, string>` | - | Custom headers |
| `onProgress` | `(progress: DownloadProgress) => void` | - | Progress callback |

#### DownloadQuality

```typescript
type DownloadQuality = 'best' | 'worst' | number;
```

- `'best'` - Highest resolution available
- `'worst'` - Lowest resolution available
- `number` - Specific resolution (e.g., `1080`, `720`, `480`)

#### DownloadMode

```typescript
type DownloadMode = 'auto' | 'resume' | 'overwrite';
```

- `'auto'` - Skip if file exists and matches size, otherwise download
- `'resume'` - Resume partial download (requires existing partial file)
- `'overwrite'` - Always overwrite existing file

#### DownloadProgress

```typescript
interface DownloadProgress {
  downloadedBytes: number;    // Bytes downloaded so far
  totalBytes: number | null;  // Total bytes (null if unknown)
  percentage: number | null;  // Percentage complete (null if unknown)
}
```

---

## Logging

### createLogger

Creates a Pino-based logger instance.

```typescript
import { createLogger } from '@weroperking/invenio-scraper';

const logger = createLogger({
  level: 'debug',           // Log level
  name: 'my-app'           // Logger name
});
```

#### Function Signature

```typescript
function createLogger(options?: LoggerOptions): Logger
```

#### LoggerOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `level` | `LevelWithSilent` | `'info'` | Log level (`'trace'`, `'debug'`, `'info'`, `'warn'`, `'error'`, `'fatal'`, `'silent'`) |
| `name` | `string` | `'moviebox-js-sdk'` | Logger name |

#### Logger

```typescript
type Logger = Pick<ReturnType<typeof pinoLogger>, 'debug' | 'info' | 'warn' | 'error'>;
```

---

### createNoopLogger

Creates a no-op logger for testing or when logging is not needed.

```typescript
import { createNoopLogger } from '@weroperking/invenio-scraper';

const noopLogger = createNoopLogger();
```

#### Function Signature

```typescript
function createNoopLogger(): Logger
```

---

## Error Handling

The SDK provides several error classes for different failure scenarios. See [Error Handling Guide](./errors.md) for detailed information.

### Error Classes

| Error Class | Description |
|-------------|-------------|
| `MovieboxApiError` | Base error class for all SDK errors |
| `MovieboxHttpError` | HTTP request failures |
| `EmptyResponseError` | Empty API response |
| `UnsuccessfulResponseError` | API reported failure |
| `GeoBlockedError` | Content blocked by region |
| `MirrorExhaustedError` | All mirrors failed |
| `RetryLimitExceededError` | Max retries exceeded |

---

## Type Exports

The SDK exports all types for use in your application:

```typescript
// Search types
export type { SearchParams, SearchFilter, SearchResultPage, NormalizedSearchResult, SearchResultType };

// Movie types
export type { MovieDetails, MovieDownloadOption, MovieSubtitleOption };

// Series types
export type { SeriesDetails, SeriesSeasonSummary, EpisodeQualities, EpisodeDownloadOption, EpisodeSubtitleOption };

// Stream types
export type { StreamOption, StreamResult };

// Download types
export type { DownloadQuality, DownloadMode, DownloadProgress };

// Logger types
export type { Logger };
```

---

## See Also

- [Error Handling](./errors.md)
- [Types Reference](./types.md)
- [Proxy Configuration](./proxy.md)
- [Getting Started Guide](./guides/getting-started.md)
- [Session Management Guide](./guides/session-management.md)
- [Downloading Guide](./guides/downloading.md)
- [Streaming Guide](./guides/streaming.md)
