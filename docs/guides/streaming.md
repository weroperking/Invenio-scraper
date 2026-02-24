# Streaming

This guide covers getting stream URLs for movies and episodes, quality selection, and integration with media players.

> **Note:** Use `tsx` to run TypeScript files directly. For example: `npx tsx your-script.ts`

---

## Table of Contents

- [Overview](#overview)
- [Getting Stream URLs](#getting-stream-urls)
- [Quality Selection](#quality-selection)
- [Working with Stream Metadata](#working-with-stream-metadata)
- [Integration with Media Players](#integration-with-media-players)

---

## Overview

The SDK provides functions to get streaming URLs for movies and episodes. These URLs can be used with any HTTP-based streaming player.

### Stream Functions

- `getMovieStreamUrl` - Get streaming URL for a movie
- `getEpisodeStreamUrl` - Get streaming URL for a TV episode

---

## Getting Stream URLs

### Movie Streams

```typescript
import { MovieboxSession, getMovieStreamUrl, createLogger } from '@weroperking/invenio-scraper';

const session = new MovieboxSession({
  logger: createLogger({ level: 'info' })
});

async function main(): Promise<void> {
  const result = await getMovieStreamUrl(session, {
    detailPath: 'titanic-m7a9yt0abq6'
  });

  console.log('Stream URL:', result.stream?.url);
  console.log('Quality:', result.stream?.quality);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Episode Streams

```typescript
import { getEpisodeStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const result = await getEpisodeStreamUrl(session, {
    detailPath: 'merlin-b8z92m3k5w1',
    season: 1,
    episode: 1
  });

  console.log('Stream URL:', result.stream?.url);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Response Structure

```typescript
interface StreamResult {
  stream: StreamOption | null;       // Selected stream
  options: StreamOption[];           // All available options
  captions: MovieSubtitleOption[];  // Available subtitles
  hasResource: boolean;             // Whether stream is available
  freeStreamsRemaining: number;      // Free streams remaining
  isLimited: boolean;               // Limited access status
}
```

---

## Quality Selection

### Automatic Best Quality

```typescript
import { getMovieStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  // Default - gets best quality
  const result = await getMovieStreamUrl(session, {
    detailPath: 'movie-id',
    // quality defaults to 'best'
  });

  console.log(result.stream?.quality); // e.g., "1080p"
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Explicit Quality Selection

```typescript
import { getMovieStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  // Best quality
  const best = await getMovieStreamUrl(session, {
    detailPath: 'movie-id',
    quality: 'best'
  });

  // Worst quality (lowest bandwidth)
  const worst = await getMovieStreamUrl(session, {
    detailPath: 'movie-id',
    quality: 'worst'
  });

  // Specific resolution
  const hd = await getMovieStreamUrl(session, {
    detailPath: 'movie-id',
    quality: 1080  // 1080p
  });

  const sd = await getMovieStreamUrl(session, {
    detailPath: 'movie-id',
    quality: 480  // 480p
  });
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### List Available Qualities

```typescript
import { getMovieStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const result = await getMovieStreamUrl(session, {
    detailPath: 'movie-id'
  });

  console.log('Available qualities:');
  for (const option of result.options) {
    const sizeGB = (option.sizeBytes / 1024 / 1024 / 1024).toFixed(2);
    console.log(`  ${option.quality} - ${sizeGB} GB - ${option.format}`);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Fallback Quality Logic

If the requested quality is not available, the SDK automatically selects the next best option:

```typescript
import { getMovieStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  // Request 4K but only 1080p available
  const result = await getMovieStreamUrl(session, {
    detailPath: 'movie-id',
    quality: 2160  // Requesting 4K
  });

  console.log(result.stream?.quality); // "1080p" (best available)
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## Working with Stream Metadata

### Access Stream Information

```typescript
import { getMovieStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const result = await getMovieStreamUrl(session, {
    detailPath: 'movie-id'
  });

  const stream = result.stream;

  if (stream) {
    console.log('Stream Details:');
    console.log(`  ID: ${stream.id}`);
    console.log(`  Resolution: ${stream.resolution}p`);
    console.log(`  Quality: ${stream.quality}`);
    console.log(`  Size: ${(stream.sizeBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Duration: ${Math.floor(stream.durationSeconds / 60)} minutes`);
    console.log(`  Format: ${stream.format}`);
    console.log(`  Codec: ${stream.codec}`);
    console.log(`  URL: ${stream.url}`);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Check Availability

```typescript
import { getMovieStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const result = await getMovieStreamUrl(session, {
    detailPath: 'movie-id'
  });

  if (!result.hasResource) {
    console.log('No stream available for this content');
    return;
  }

  if (result.isLimited) {
    console.log(`Limited access: ${result.freeStreamsRemaining} free streams remaining`);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

### Get Subtitles/Captions

```typescript
import { getMovieStreamUrl } from '@weroperking/invenio-scraper';

async function main(): Promise<void> {
  const result = await getMovieStreamUrl(session, {
    detailPath: 'movie-id'
  });

  console.log('Available subtitles:');
  for (const caption of result.captions) {
    console.log(`  ${caption.language} (${caption.languageCode})`);
    console.log(`    URL: ${caption.url}`);
    console.log(`    Size: ${caption.sizeBytes} bytes`);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## Integration with Media Players

### HTML5 Video Player

```html
<video id="player" controls>
  Your browser does not support video.
</video>

<script>
async function loadStream() {
  const response = await fetch('/api/stream-url', {
    params: { detailPath: 'movie-id' }
  });
  const { url } = await response.json();
  
  const video = document.getElementById('player');
  video.src = url;
  video.play();
}
</script>
```

### Video.js Integration

```javascript
import videojs from 'video.js';

async function playWithVideoJS(videoElement, detailPath) {
  // Get stream URL from SDK
  const result = await getMovieStreamUrl(session, { detailPath });
  
  const player = videojs(videoElement, {
    controls: true,
    autoplay: false,
    preload: 'auto'
  });
  
  player.src({
    src: result.stream.url,
    type: 'video/mp4'
  });
  
  return player;
}
```

### HLS.js (for HLS Streams)

```javascript
import Hls from 'hls.js';

async function playHLS(videoElement, detailPath) {
  const result = await getMovieStreamUrl(session, { detailPath });
  
  // Check if HLS stream
  if (result.options[0]?.format === 'hls') {
    const hls = new Hls();
    hls.loadSource(result.stream.url);
    hls.attachMedia(videoElement);
  } else {
    // Direct MP4 playback
    videoElement.src = result.stream.url;
  }
}
```

### Node.js Media Server

```typescript
import http from 'http';

async function createStreamProxy(req: http.IncomingMessage, res: http.ServerResponse) {
  const detailPath = req.url.split('/')[2];
  
  const result = await getMovieStreamUrl(session, { detailPath });
  
  if (!result.stream) {
    res.writeHead(404);
    res.end('Stream not found');
    return;
  }
  
  // Proxy the stream
  const streamResponse = await fetch(result.stream.url);
  
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes'
  });
  
  // Stream to client
  // Note: In production, handle range requests properly
  for await (const chunk of streamResponse.body) {
    res.write(chunk);
  }
  
  res.end();
}
```

### React Component Example

```tsx
import { useState, useEffect } from 'react';
import { getMovieStreamUrl } from 'moviebox-js-sdk';

interface VideoPlayerProps {
  detailPath: string;
  session: MovieboxSession;
}

export function VideoPlayer({ detailPath, session }: VideoPlayerProps) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStream() {
      try {
        const result = await getMovieStreamUrl(session, { detailPath });
        if (result.stream) {
          setStreamUrl(result.stream.url);
        } else {
          setError('No stream available');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadStream();
  }, [detailPath, session]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <video 
      src={streamUrl} 
      controls 
      autoPlay 
      style={{ width: '100%' }}
    />
  );
}
```

### Quality Selector Component

```tsx
import { useState } from 'react';
import { getMovieStreamUrl } from 'moviebox-js-sdk';

export function QualitySelector({ detailPath, session }) {
  const [selectedQuality, setSelectedQuality] = useState<'best' | 'worst' | number>('best');
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    async function loadStream() {
      const result = await getMovieStreamUrl(session, { 
        detailPath, 
        quality: selectedQuality 
      });
      setStreamUrl(result.stream?.url ?? null);
      setOptions(result.options);
    }
    
    loadStream();
  }, [detailPath, selectedQuality, session]);

  return (
    <div>
      <select 
        value={selectedQuality} 
        onChange={(e) => setSelectedQuality(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.resolution} value={opt.resolution}>
            {opt.quality}
          </option>
        ))}
      </select>
      
      {streamUrl && (
        <video src={streamUrl} controls />
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Check Availability First

```typescript
const result = await getMovieStreamUrl(session, { detailPath: 'movie-id' });

if (!result.hasResource) {
  // Suggest download instead
  console.log('Streaming not available, try downloading');
  return;
}
```

### 2. Handle Quality Not Available

```typescript
async function getBestAvailableStream(detailPath: string) {
  // Try 4K first
  let result = await getMovieStreamUrl(session, { detailPath, quality: 2160 });
  
  // If not available, fall back to best
  if (!result.stream) {
    result = await getMovieStreamUrl(session, { detailPath, quality: 'best' });
  }
  
  return result;
}
```

### 3. Cache Stream URLs

Stream URLs may expire. Don't cache them for long periods:

```typescript
// Don't do this:
// localStorage.setItem('streamUrl', url);

// Do this instead:
// Fetch fresh URL when needed
const result = await getMovieStreamUrl(session, { detailPath });
```

---

## See Also

- [Getting Started](./getting-started.md)
- [Session Management](./session-management.md)
- [Downloading](./downloading.md)
- [API Reference](../api-reference.md)
- [Types Reference](../types.md)
