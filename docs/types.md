# Types Reference

This document provides a comprehensive reference for all TypeScript types used in the MovieBox JS SDK.

---

## Table of Contents

- [Search Types](#search-types)
- [Movie Types](#movie-types)
- [Series Types](#series-types)
- [Stream Types](#stream-types)
- [Download Types](#download-types)
- [Logger Types](#logger-types)
- [Session Configuration Types](#session-configuration-types)
- [Raw API Response Types](#raw-api-response-types)

---

## Search Types

### SearchFilter

Filter type for search queries.

```typescript
type SearchFilter = 'all' | 'movie' | 'tv' | 'music';
```

| Value | Description |
|-------|-------------|
| `'all'` | Search all content types |
| `'movie'` | Search only movies |
| `'tv'` | Search only TV series |
| `'music'` | Search only music |

---

### SearchResultType

Normalized result type from search.

```typescript
type SearchResultType = 'movie' | 'tv' | 'music' | 'unknown';
```

---

### SearchParams

Parameters for the search function.

```typescript
interface SearchParams {
  query: string;        // Required search query
  type?: SearchFilter; // Filter type (default: 'all')
  page?: number;       // Page number, 1-indexed (default: 1)
  perPage?: number;    // Results per page (default: 24)
}
```

---

### NormalizedSearchResult

A normalized search result with consistent properties.

```typescript
interface NormalizedSearchResult {
  id: string;                  // Unique identifier (subjectId)
  title: string;              // Media title
  type: SearchResultType;     // Content type
  description: string;        // Media description/synopsis
  releaseDate: string | null; // Release date (YYYY-MM-DD format)
  releaseYear: number | null;  // Release year extracted from date
  rating: number | null;       // IMDB rating (0-10 scale)
  genres: string[];           // Array of genre names
  country: string | null;     // Country of origin
  pageUrl: string;           // Full URL to detail page
  posterUrl: string | null;   // Poster image URL
  subtitles: string[];       // Available subtitle language codes
  hasResource: boolean;      // Whether download/stream is available
  raw: RawSearchItem;       // Original API response
}
```

---

### SearchResultPage

Paginated search results.

```typescript
interface SearchResultPage {
  results: NormalizedSearchResult[]; // Array of results
  page: number;                       // Current page number
  perPage: number;                   // Results per page
  totalCount: number;                // Total results available
  hasMore: boolean;                  // Whether more pages exist
  nextPage: number | null;           // Next page number or null if last page
  raw: RawSearchData;               // Raw API response for debugging
}
```

---

## Movie Types

### MovieDetails

Complete movie information.

```typescript
interface MovieDetails {
  id: string;                          // Movie's unique identifier
  detailPath: string;                  // URL slug for detail page
  title: string;                      // Movie title
  synopsis: string;                   // Movie description/plot
  releaseDate: string | null;          // Release date (YYYY-MM-DD)
  releaseYear: number | null;          // Year extracted from release date
  durationSeconds: number | null;      // Duration in seconds
  durationLabel: string | null;        // Human-readable duration (e.g., "2h 30m")
  genres: string[];                    // Array of genre names
  posterUrl: string | null;            // Poster image URL
  backdropUrl: string | null;          // Backdrop/hero image URL
  rating: number | null;               // IMDB rating (0-10)
  ratingCount: number | null;          // Number of IMDB ratings
  country: string | null;              // Country of origin
  hasResource: boolean;              // Whether content is available
  availableSubtitleLanguages: string[]; // Available subtitle languages
  downloads: MovieDownloadOption[];   // All available download options
  bestDownload: MovieDownloadOption | null;   // Best quality download
  worstDownload: MovieDownloadOption | null;  // Lowest quality download
  captions: MovieSubtitleOption[];   // Available subtitle files
}
```

---

### MovieDownloadOption

A downloadable quality option for a movie.

```typescript
interface MovieDownloadOption {
  id: string;          // Unique identifier for this option
  resolution: number;  // Vertical resolution (e.g., 1080, 720, 480)
  quality: string;     // Quality string (e.g., "1080p", "720p")
  sizeBytes: number;   // File size in bytes
  url: string;         // Download URL
}
```

---

### MovieSubtitleOption

A subtitle/caption file option.

```typescript
interface MovieSubtitleOption {
  id: string;           // Unique identifier
  languageCode: string; // ISO language code (e.g., "en", "es")
  language: string;     // Human-readable language name
  sizeBytes: number;   // File size in bytes
  delay: number;        // Display delay in milliseconds
  url: string;         // Subtitle file URL
}
```

---

## Series Types

### SeriesDetails

Complete TV series information.

```typescript
interface SeriesDetails {
  id: string;                          // Series unique identifier
  detailPath: string;                  // URL slug for detail page
  title: string;                       // Series title
  synopsis: string;                    // Series description
  releaseDate: string | null;          // Initial release date
  releaseYear: number | null;         // Year from initial release
  genres: string[];                   // Array of genre names
  country: string | null;             // Country of origin
  posterUrl: string | null;           // Poster image URL
  rating: number | null;              // IMDB rating
  ratingCount: number | null;         // Number of IMDB ratings
  hasResource: boolean;              // Whether content is available
  availableSubtitleLanguages: string[]; // Available subtitle languages
  seasons: SeriesSeasonSummary[];     // Summary of each season
}
```

---

### SeriesSeasonSummary

Summary information for a single season.

```typescript
interface SeriesSeasonSummary {
  seasonNumber: number;         // Season number (1, 2, 3, etc.)
  episodeCount: number;        // Total episodes in this season
  availableResolutions: number[]; // Available download resolutions
}
```

---

### EpisodeQualities

Available qualities for a specific episode.

```typescript
interface EpisodeQualities {
  downloads: EpisodeDownloadOption[];       // All available downloads
  bestDownload: EpisodeDownloadOption | null; // Best quality option
  worstDownload: EpisodeDownloadOption | null; // Lowest quality option
  captions: EpisodeSubtitleOption[];       // Available subtitles
}
```

---

### EpisodeDownloadOption

A downloadable quality option for an episode. Same structure as `MovieDownloadOption`.

```typescript
type EpisodeDownloadOption = MovieDownloadOption;
```

---

### EpisodeSubtitleOption

A subtitle file for an episode. Same structure as `MovieSubtitleOption`.

```typescript
type EpisodeSubtitleOption = MovieSubtitleOption;
```

---

## Stream Types

### StreamOption

A streaming quality option.

```typescript
interface StreamOption {
  id: string;              // Stream unique identifier
  resolution: number;      // Vertical resolution (e.g., 1080)
  quality: string;         // Quality string (e.g., "1080p")
  sizeBytes: number;      // Estimated file size in bytes
  durationSeconds: number; // Duration in seconds
  format: string;         // Video format (e.g., "mp4", "mkv")
  codec: string;          // Video codec name
  url: string;           // Stream URL
}
```

---

### StreamResult

Result from getting stream URL.

```typescript
interface StreamResult {
  stream: StreamOption | null;      // Selected stream option
  options: StreamOption[];          // All available stream options
  captions: MovieSubtitleOption[];  // Available subtitles
  hasResource: boolean;              // Whether stream is available
  freeStreamsRemaining: number;      // Number of free streams available
  isLimited: boolean;               // Whether limited access applies
}
```

---

### StreamQuality

Quality selector for streaming.

```typescript
type StreamQuality = 'best' | 'worst' | number | undefined;
```

| Value | Description |
|-------|-------------|
| `'best'` | Highest available resolution |
| `'worst'` | Lowest available resolution |
| `number` | Specific resolution (e.g., `1080`, `720`) |
| `undefined` | Same as `'best'` |

---

## Download Types

### DownloadQuality

Quality selector for downloads.

```typescript
type DownloadQuality = 'best' | 'worst' | number;
```

| Value | Description |
|-------|-------------|
| `'best'` | Highest available resolution |
| `'worst'` | Lowest available resolution |
| `number` | Specific resolution (e.g., `1080`, `720`) |

---

### DownloadMode

Download behavior mode.

```typescript
type DownloadMode = 'auto' | 'resume' | 'overwrite';
```

| Value | Behavior |
|-------|----------|
| `'auto'` | Skip if file exists and matches expected size; otherwise download |
| `'resume'` | Continue from existing partial file (throws if no partial exists) |
| `'overwrite'` | Always overwrite existing file |

---

### DownloadProgress

Progress information during download.

```typescript
interface DownloadProgress {
  downloadedBytes: number;   // Number of bytes downloaded so far
  totalBytes: number | null; // Total file size in bytes (null if unknown)
  percentage: number | null; // Progress percentage (0-100, null if unknown)
}
```

---

## Logger Types

### Logger

Logger interface compatible with Pino.

```typescript
type Logger = Pick<ReturnType<typeof pinoLogger>, 'debug' | 'info' | 'warn' | 'error'>;
```

```typescript
interface Logger {
  debug(message: string, ...params: unknown[]): void;
  info(message: string, ...params: unknown[]): void;
  warn(message: string, ...params: unknown[]): void;
  error(message: string, ...params: unknown[]): void;
}
```

---

### LoggerOptions

Options for creating a logger.

```typescript
interface LoggerOptions {
  level?: LevelWithSilent;  // Log level (default: 'info')
  name?: string;           // Logger name (default: 'moviebox-js-sdk')
}
```

Valid log levels (from lowest to highest priority):
- `'trace'`
- `'debug'`
- `'info'`
- `'warn'`
- `'error'`
- `'fatal'`
- `'silent'`

---

## Session Configuration Types

### MovieboxSessionOptions

Options for creating a MovieboxSession.

```typescript
interface MovieboxSessionOptions {
  // Connection options
  host?: string;                    // Primary host override
  protocol?: 'https' | 'http';     // Protocol (default: 'https')
  baseUrl?: string;                // Full base URL override
  mirrorHosts?: readonly string[]; // Mirror hosts to try
  
  // Request options
  defaultHeaders?: HeadersInit;    // Default headers
  fetch?: typeof fetch;             // Custom fetch implementation
  
  // Retry options
  maxRetries?: number;             // Max retry attempts (deprecated)
  retryDelayMs?: number;           // Delay between retries (deprecated)
  retry?: {
    maxAttempts?: number;         // Max attempts (default: 3)
    delayMs?: number;              // Delay in ms (default: 200)
    shouldRetryError?: (error: Error, context: RetryContext) => boolean;
    shouldRetryResponse?: (response: Response, context: RetryContext) => boolean;
  };
  
  // Logging
  logger?: Logger;                 // Custom logger
  
  // Proxy
  proxyUrl?: string;               // Proxy URL
  dispatcher?: Dispatcher;          // Custom undici dispatcher
}
```

---

### RetryContext

Context object passed to retry predicates.

```typescript
interface RetryContext {
  attempt: number;      // Current attempt number (1-indexed)
  maxAttempts: number;  // Maximum attempts allowed
  url: string;          // Full request URL
  baseUrl: string;      // Base URL being used
}
```

---

## Raw API Response Types

These types represent the raw API responses before normalization. They are primarily for debugging and advanced use cases.

### RawSearchData

```typescript
interface RawSearchData {
  items: RawSearchItem[];  // Raw search results
  pager: RawSearchPager;    // Pagination info
  [key: string]: unknown;  // Additional fields
}
```

---

### RawSearchPager

```typescript
interface RawSearchPager {
  hasMore: boolean;
  nextPage: number;
  page: number;
  perPage: number;
  totalCount: number;
}
```

---

### RawSearchItem

```typescript
interface RawSearchItem {
  id: string;
  title: string;
  image: RawSearchImage;
  cover?: RawSearchImage;
  url?: string;
  subjectId: string;
  subjectType: number;
  description?: string;
  releaseDate?: string;
  genre?: string | string[];
  countryName?: string;
  imdbRatingValue?: number | null;
  detailPath: string;
  subtitles?: string | string[];
  ops?: string;
  hasResource?: boolean;
  [key: string]: unknown;
}
```

---

### RawMovieResData

```typescript
interface RawMovieResData {
  metadata: RawMovieMetadata;
  subject: RawMovieSubject;
  resource: RawMovieResource;
  stars?: RawMovieStar[];
  pubParam?: RawMoviePubParam;
}
```

---

### RawSeriesResData

```typescript
interface RawSeriesResData {
  metadata: RawMovieMetadata;
  subject: RawSeriesSubject;
  resource: RawSeriesResource;
  stars?: RawMovieStar[];
  pubParam?: RawMoviePubParam;
}
```

---

### RawStreamResponse

```typescript
interface RawStreamResponse {
  streams: RawStreamFile[];
  freeNum: number;
  limited: boolean;
  limitedCode: string;
  dash: unknown[];
  hls: unknown[];
  hasResource: boolean;
}
```

---

### RawDownloadableFilesResponse

```typescript
interface RawDownloadableFilesResponse {
  downloads: RawDownloadableMedia[];
  captions: RawDownloadableCaption[];
  limited: boolean;
  limitedCode: string;
  hasResource: boolean;
}
```

---

## Type Aliases

The SDK also exports these type aliases for convenience:

```typescript
// Episode types are aliases for movie types
type EpisodeDownloadOption = MovieDownloadOption;
type EpisodeSubtitleOption = MovieSubtitleOption;
```

---

## See Also

- [API Reference](./api-reference.md)
- [Error Handling](./errors.md)
- [Proxy Configuration](./proxy.md)
