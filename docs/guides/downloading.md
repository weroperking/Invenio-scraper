# Downloading

This guide covers downloading movies and episodes using the MovieBox JS SDK, including progress tracking, resume support, and file naming.

---

## Table of Contents

- [Overview](#overview)
- [Downloading Movies](#downloading-movies)
- [Downloading Episodes](#downloading-episodes)
- [Progress Tracking](#progress-tracking)
- [Resume Support](#resume-support)
- [File Naming](#file-naming)
- [Advanced Options](#advanced-options)

---

## Overview

The SDK provides two main download functions:

- `downloadMovie` - Download a movie
- `downloadEpisode` - Download a specific TV episode
- `downloadMediaFile` - Low-level function for direct URL downloads

All downloads support:
- Parallel chunk downloading for faster speeds
- Progress callbacks
- Resume capability
- Custom headers

---

## Downloading Movies

### Basic Download

```typescript
import { MovieboxSession, getMovieDetails, downloadMovie, createLogger } from 'moviebox-js-sdk';

const session = new MovieboxSession({
  logger: createLogger({ level: 'info' })
});

const destination = await downloadMovie(session, {
  detailPath: 'titanic-m7a9yt0abq6',
  outputDir: './downloads'
});

console.log(`Downloaded to: ${destination}`);
```

### Specify Quality

```typescript
// Download best available quality
const destination1 = await downloadMovie(session, {
  detailPath: 'movie-id',
  quality: 'best'
});

// Download worst quality (smallest file)
const destination2 = await downloadMovie(session, {
  detailPath: 'movie-id',
  quality: 'worst'
});

// Download specific resolution
const destination3 = await downloadMovie(session, {
  detailPath: 'movie-id',
  quality: 1080  // Will download 1080p if available
});
```

### Get Available Qualities First

```typescript
import { getMovieDetails } from 'moviebox-js-sdk';

const details = await getMovieDetails(session, {
  detailPath: 'movie-id'
});

console.log('Available qualities:');
for (const download of details.downloads) {
  const sizeMB = (download.sizeBytes / 1024 / 1024).toFixed(2);
  console.log(`  ${download.quality} - ${sizeMB} MB`);
}

// Download using best quality
const destination = await downloadMovie(session, {
  detailPath: 'movie-id',
  quality: 'best'
});
```

---

## Downloading Episodes

### Basic Episode Download

```typescript
import { downloadEpisode } from 'moviebox-js-sdk';

const destination = await downloadEpisode(session, {
  detailPath: 'merlin-b8z92m3k5w1',
  season: 1,
  episode: 1,
  outputDir: './downloads/merlin'
});

console.log(`Downloaded: ${destination}`);
```

### Download Multiple Episodes

```typescript
async function downloadSeason(detailPath: string, season: number, episodeCount: number) {
  const results = [];
  
  for (let episode = 1; episode <= episodeCount; episode++) {
    try {
      const destination = await downloadEpisode(session, {
        detailPath,
        season,
        episode,
        outputDir: `./downloads/season-${season}`
      });
      results.push({ episode, success: true, path: destination });
    } catch (error) {
      results.push({ episode, success: false, error: error.message });
    }
  }
  
  return results;
}

// Download all episodes of season 1
const results = await downloadSeason('series-id', 1, 10);
console.log(results);
```

---

## Progress Tracking

### Basic Progress Callback

```typescript
import { downloadMovie } from 'moviebox-js-sdk';

await downloadMovie(session, {
  detailPath: 'movie-id',
  quality: 'best',
  onProgress: (progress) => {
    if (progress.percentage !== null) {
      console.log(`Downloaded: ${progress.percentage}%`);
    } else {
      console.log(`Downloaded: ${progress.downloadedBytes} bytes`);
    }
  }
});
```

### Detailed Progress Display

```typescript
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

await downloadMovie(session, {
  detailPath: 'movie-id',
  onProgress: (progress) => {
    const downloaded = formatBytes(progress.downloadedBytes);
    const total = progress.totalBytes ? formatBytes(progress.totalBytes) : 'Unknown';
    const percent = progress.percentage?.toFixed(1) ?? '...';
    
    console.log(`${percent}% (${downloaded} / ${total})`);
  }
});
```

### Progress with Speed Calculation

```typescript
let lastBytes = 0;
let lastTime = Date.now();

await downloadMovie(session, {
  detailPath: 'movie-id',
  onProgress: (progress) => {
    const now = Date.now();
    const timeDiff = (now - lastTime) / 1000; // seconds
    
    if (timeDiff >= 1) {
      const bytesDiff = progress.downloadedBytes - lastBytes;
      const speed = bytesDiff / timeDiff; // bytes per second
      
      console.log(`${progress.percentage?.toFixed(1)}% - ${formatBytes(speed)}/s`);
      
      lastBytes = progress.downloadedBytes;
      lastTime = now;
    }
  }
});
```

---

## Resume Support

### Auto Resume

The default `'auto'` mode automatically resumes partial downloads:

```typescript
await downloadMovie(session, {
  detailPath: 'movie-id',
  mode: 'auto'  // Default: skips if complete, resumes if partial
});
```

### Manual Resume

Use `'resume'` mode to explicitly resume:

```typescript
await downloadMovie(session, {
  detailPath: 'movie-id',
  mode: 'resume'  // Requires existing partial file
});
```

### Force Overwrite

Use `'overwrite'` to always download fresh:

```typescript
await downloadMovie(session, {
  detailPath: 'movie-id',
  mode: 'over  // Always downloadwrite' from scratch
});
```

---

## File Naming

### Default Naming

The SDK generates filenames automatically:

**Movies:**
```
Titanic 1997 1080p.mp4
```

**Episodes:**
```
Merlin S01E01 1080p.mp4
```

### Custom Filename

```typescript
await downloadMovie(session, {
  detailPath: 'movie-id',
  filename: 'my-custom-name.mp4'
});

await downloadEpisode(session, {
  detailPath: 'series-id',
  season: 1,
  episode: 1,
  filename: 'S01E01.mp4'
});
```

### Custom Output Directory

```typescript
await downloadMovie(session, {
  detailPath: 'movie-id',
  outputDir: '/path/to/downloads'
});
```

---

## Advanced Options

### Parallel Downloads

Speed up downloads by using multiple parallel connections:

```typescript
await downloadMovie(session, {
  detailPath: 'movie-id',
  parallel: 8,        // Number of parallel connections (default: 4)
  chunkSize: 1024 * 1024  // 1 MB chunks (default: 4 MB)
});
```

### Custom Headers

Add custom headers for CDN requests:

```typescript
await downloadMovie(session, {
  detailPath: 'movie-id',
  headers: {
    'X-Custom-Header': 'value',
    'Referer': 'https://example.com/'
  }
});
```

### Keep Partial Files

Keep partial downloads for manual resume later:

```typescript
await downloadMovie(session, {
  detailPath: 'movie-id',
  keepTempParts: true  // Keep .part files
});
```

### Complete Advanced Example

```typescript
import { downloadMovie } from 'moviebox-js-sdk';

const destination = await downloadMovie(session, {
  // Source
  detailPath: 'movie-id',
  subjectId: 'optional-subject-id',
  
  // Quality
  quality: 'best',  // 'best', 'worst', or 1080/720/480
  
  // Output
  outputDir: './downloads',
  filename: 'custom-name.mp4',
  
  // Download behavior
  mode: 'auto',        // 'auto', 'resume', 'overwrite'
  parallel: 4,         // Parallel connections
  chunkSize: 4 * 1024 * 1024,  // 4 MB chunks
  
  // Advanced
  keepTempParts: false,
  headers: {},
  
  // Progress
  onProgress: (progress) => {
    console.log(`${progress.percentage}%`);
  }
});

console.log(`Saved to: ${destination}`);
```

---

## Error Handling

### Handle No Downloads Available

```typescript
import { getMovieDetails, MovieboxApiError } from 'moviebox-js-sdk';

const details = await getMovieDetails(session, { detailPath: 'movie-id' });

if (details.downloads.length === 0) {
  console.log('No downloads available for this content');
  return;
}

const destination = await downloadMovie(session, {
  detailPath: 'movie-id'
});
```

### Handle Specific Quality Not Available

```typescript
import { MovieboxApiError } from 'moviebox-js-sdk';

try {
  await downloadMovie(session, {
    detailPath: 'movie-id',
    quality: 2160  // 4K may not be available
  });
} catch (error) {
  if (error instanceof MovieboxApiError && 
      error.message.includes('No download option found')) {
    // Fall back to best available
    await downloadMovie(session, {
      detailPath: 'movie-id',
      quality: 'best'
    });
  }
}
```

---

## See Also

- [Getting Started](./getting-started.md)
- [Session Management](./session-management.md)
- [Streaming](./streaming.md)
- [API Reference](../api-reference.md)
- [Types Reference](../types.md)
