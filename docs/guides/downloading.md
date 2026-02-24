# Downloading

This guide covers downloading movies and episodes using the Invenio Scraper SDK, including progress tracking, resume support, and file naming.

> **Note:** Use `tsx` to run TypeScript files directly. For example: `npx tsx your-script.ts`

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
import { MovieboxSession, getMovieDetails, downloadMovie, createLogger } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const session = new MovieboxSession({
    logger: createLogger({ level: 'info' })
  });

  const destination = await downloadMovie(session, {
    detailPath: 'titanic-m7a9yt0abq6',
    outputDir: './downloads'
  });

  console.log(`Downloaded to: ${destination}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Specify Quality

```typescript
import { downloadMovie } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
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
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Get Available Qualities First

```typescript
import { getMovieDetails } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
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
  
  console.log(`Downloaded to: ${destination}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## Downloading Episodes

### Basic Episode Download

```typescript
import { downloadEpisode } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const destination = await downloadEpisode(session, {
    detailPath: 'merlin-b8z92m3k5w1',
    season: 1,
    episode: 1,
    outputDir: './downloads/merlin'
  });

  console.log(`Downloaded: ${destination}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Download Multiple Episodes

```typescript
import { downloadEpisode } from '@weroperking/invenio-scraper';

async function downloadSeason(detailPath: string, season: number, episodeCount: number): Promise<Array<{episode: number; success: boolean; path?: string; error?: string}>> {
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

async function main(): Promise<void> {
  // Download all episodes of season 1
  const results = await downloadSeason('series-id', 1, 10);
  console.log(results);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## Progress Tracking

### Basic Progress Callback

```typescript
import { downloadMovie } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
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
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Detailed Progress Display

```typescript
import { downloadMovie } from '@weroperking/invenio-scraper';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main(): Promise<void> {
  await downloadMovie(session, {
    detailPath: 'movie-id',
    onProgress: (progress) => {
      const downloaded = formatBytes(progress.downloadedBytes);
      const total = progress.totalBytes ? formatBytes(progress.totalBytes) : 'Unknown';
      const percent = progress.percentage?.toFixed(1) ?? '...';
      
      console.log(`${percent}% (${downloaded} / ${total})`);
    }
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Progress with Speed Calculation

```typescript
import { downloadMovie } from '@weroperking/invenio-scraper';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main(): Promise<void> {
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
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## Resume Support

### Auto Resume

The default `'auto'` mode automatically resumes partial downloads:

```typescript
import { downloadMovie } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  await downloadMovie(session, {
    detailPath: 'movie-id',
    mode: 'auto'  // Default: skips if complete, resumes if partial
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Manual Resume

Use `'resume'` mode to explicitly resume:

```typescript
async function main(): Promise<void> {
  await downloadMovie(session, {
    detailPath: 'movie-id',
    mode: 'resume'  // Requires existing partial file
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Force Overwrite

Use `'overwrite'` to always download fresh:

```typescript
async function main(): Promise<void> {
  await downloadMovie(session, {
    detailPath: 'movie-id',
    mode: 'overwrite'  // Always download from scratch
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
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
import { downloadMovie, downloadEpisode } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
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
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Custom Output Directory

```typescript
async function main(): Promise<void> {
  await downloadMovie(session, {
    detailPath: 'movie-id',
    outputDir: '/path/to/downloads'
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## Advanced Options

### Parallel Downloads

Speed up downloads by using multiple parallel connections:

```typescript
import { downloadMovie } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  await downloadMovie(session, {
    detailPath: 'movie-id',
    parallel: 8,        // Number of parallel connections (default: 4)
    chunkSize: 1024 * 1024  // 1 MB chunks (default: 4 MB)
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Custom Headers

Add custom headers for CDN requests:

```typescript
async function main(): Promise<void> {
  await downloadMovie(session, {
    detailPath: 'movie-id',
    headers: {
      'X-Custom-Header': 'value',
      'Referer': 'https://example.com/'
    }
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Keep Partial Files

Keep partial downloads for manual resume later:

```typescript
async function main(): Promise<void> {
  await downloadMovie(session, {
    detailPath: 'movie-id',
    keepTempParts: true  // Keep .part files
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Complete Advanced Example

```typescript
import { downloadMovie } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
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
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## Error Handling

### Handle No Downloads Available

```typescript
import { getMovieDetails, MovieboxApiError } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const details = await getMovieDetails(session, { detailPath: 'movie-id' });

  if (details.downloads.length === 0) {
    console.log('No downloads available for this content');
    return;
  }

  const destination = await downloadMovie(session, {
    detailPath: 'movie-id'
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Handle Specific Quality Not Available

```typescript
import { downloadMovie, MovieboxApiError } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
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
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## See Also

- [Getting Started](./getting-started.md)
- [Session Management](./session-management.md)
- [Streaming](./streaming.md)
- [API Reference](../api-reference.md)
- [Types Reference](../types.md)
