/**
 * MovieBox SDK Download Demo
 *
 * This script demonstrates using the MovieBox JS SDK to:
 * 1. Search for "Avatar" movie
 * 2. Download the first result
 *
 * Run with: npx tsx test/download.ts
 */

import {
  MovieboxSession,
  search,
  downloadMovie,
  type DownloadProgress
} from '../src/index.js';

async function main(): Promise<void> {
  console.log('🎬 MovieBox SDK - Download Demo\n');

  // Create a session
  const session = new MovieboxSession();

  try {
    // Step 1: Search for "Avatar" movie
    console.log('🔍 Searching for "Avatar"...\n');

    const searchResults = await search(session, {
      query: 'Tag',
      type: 'movie' // Filter to movies only
    });

    console.log(`   Found ${searchResults.totalCount} results`);
    console.log(`   Page ${searchResults.page} of ${searchResults.hasMore ? 'many' : '1'}\n`);

    if (searchResults.results.length === 0) {
      console.log('❌ No results found for "Avatar"');
      return;
    }

    // Display search results
    console.log('📋 Top results:');
    searchResults.results.slice(0, 5).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.title} (${result.releaseYear ?? 'N/A'})`);
      console.log(`      Type: ${result.type}, Rating: ${result.rating ?? 'N/A'}`);
    });
    console.log('');

    // Step 2: Download the first result
    const firstResult = searchResults.results[0];

    if (!firstResult) {
      console.log('❌ No first result available');
      return;
    }

    console.log(`⬇️  Downloading: ${firstResult.title}\n`);

    const filePath = await downloadMovie(session, {
      detailPath: firstResult.raw.detailPath,
      subjectId: firstResult.id,
      quality: 'best', // Download best quality available
      outputDir: './downloads',
      onProgress: (progress: DownloadProgress) => {
        const downloadedMB = (progress.downloadedBytes / 1024 / 1024).toFixed(1);
        const totalMB = progress.totalBytes
          ? (progress.totalBytes / 1024 / 1024).toFixed(1)
          : 'unknown';
        const percent = progress.percentage?.toFixed(1) ?? 'unknown';

        // Update progress on same line
        process.stdout.write(
          `\r   Progress: ${downloadedMB}MB / ${totalMB}MB (${percent}%)   `
        );
      }
    });

    console.log('\n\n✅ Download complete!');
    console.log(`   Saved to: ${filePath}`);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
