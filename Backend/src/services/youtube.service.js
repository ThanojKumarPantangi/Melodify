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
      timeout: YT_DLP_TIMEOUT_MS,
    });

    const audioUrl = String(stdout || '')
      .trim()
      .split(/\r?\n/)[0]
      .trim();

    if (!audioUrl) throw new Error('No audio URL');

    return audioUrl;
  }

  try {
    return await run([
      '-g',
      '-f', 'bestaudio/best',
      '--no-playlist',
      '--no-download',
      '--user-agent', 'com.google.android.youtube/17.31.35 (Linux; Android 11)',
      '--extractor-args', 'youtube:player_client=android',
      url,
    ]);
  } catch (err1) {
    console.warn('Primary failed:', err1.message);

    try {
      return await run([
        '-g',
        '--no-playlist',
        '--no-download',
        '--user-agent', 'com.google.android.youtube/17.31.35 (Linux; Android 11)',
        url,
      ]);
    } catch (err2) {
      throw new Error(`yt-dlp failed: ${err2.message}`);
    }
  }
}