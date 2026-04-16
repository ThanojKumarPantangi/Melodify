import { execFile } from 'child_process';
import { promisify } from 'util';
import { buildYoutubeUrl } from '../utils/helpers.js';
import { YT_DLP_TIMEOUT_MS } from '../config/constants.js';

const execFilePromise = promisify(execFile);

export async function runYtDlp(videoId) {
  const url = buildYoutubeUrl(videoId);

  async function run(args) {
    const { stdout } = await execFilePromise('yt-dlp', args, {
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
      timeout: 20000, // increase timeout
    });

    const lines = String(stdout || '')
      .trim()
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    const audioUrl = lines[lines.length - 1]; // 🔥 FIX

    if (!audioUrl) throw new Error('No audio URL');

    return audioUrl;
  }

  const baseArgs = [
    '-g',
    '-f', 'bestaudio[ext=m4a][acodec!=none]/bestaudio[acodec!=none]', // 🔥 FIX
    '--no-playlist',
    '--no-download',
    '--user-agent', 'com.google.android.youtube/17.31.35 (Linux; Android 11)',
    '--extractor-args', 'youtube:player_client=android',
    '--js-runtimes', 'node',   // 🔥 CRITICAL FIX
    '--force-ipv4',            // 🔥 helps with blocking
    url,
  ];

  try {
    return await run(baseArgs);
  } catch (err1) {
    console.warn('Primary failed:', err1.message);

    // 🔁 Retry with simpler args
    try {
      return await run([
        '-g',
        '--no-playlist',
        '--no-download',
        '--js-runtimes', 'node',
        '--force-ipv4',
        url,
      ]);
    } catch (err2) {
      throw new Error(`yt-dlp failed: ${err2.message}`);
    }
  }
}