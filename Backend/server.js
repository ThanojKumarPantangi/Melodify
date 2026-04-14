require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const axios = require('axios');
const { promisify } = require('util');
const { default: PQueue } = require('p-queue');
const util = require('util');
const execPromise = util.promisify(exec); 
require('./db');
const fetch = require('node-fetch'); 
const Audio = require('./models/Audio');
const User = require('./models/User');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
app.use(cors());
app.use(bodyParser.json());

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI);
let audioCacheCollection;
let usersCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db('melodify');
    audioCacheCollection = db.collection('audio_cache');
    usersCollection = db.collection('users');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

connectDB();

app.get('/',async(req,res)=>{
  res.status(200).send("Server Running");
})

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).send("Missing search query");

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${process.env.YT_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).send("Search failed");
  }
});

// User Signup
const generateAuthKey = () => Math.floor(100000 + Math.random() * 900000).toString();
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const authKey = generateAuthKey(); // 🔐 Generate a random key

    await usersCollection.insertOne({
      username,
      password,
      authKey,
      playlists: [],
      recentlyPlayed: []
    });

    res.status(201).json({ message: 'User created successfully' }); // ✅ No key shown
  } catch (err) {
    console.error('❌ Error in /signup:', err);
    res.status(500).send('Internal Server Error');
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password, authKey } = req.body;

  if (!username || !password || !authKey) {
    return res.status(400).send('Missing username, password, or authKey');
  }

  try {
    const user = await usersCollection.findOne({ username });

    if (!user || user.password !== password || user.authKey !== authKey) {
      return res.status(401).send('Invalid credentials or authKey');
    }

    res.status(200).json({
      message: 'Login successful',
      username: user.username,
      id: user._id
    });
  } catch (err) {
    console.error('❌ Error in /login:', err);
    res.status(500).send('Internal Server Error');
  }
});

// used to get the username
app.get('/user/:username', async (req, res) => {
  const { username } = req.params;
  if (!username) return res.status(400).send('Missing username');

  try {
    const user = await usersCollection.findOne({ username }, { projection: { password: 0 } }); // exclude password
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    console.error('❌ Error in GET /user/:username:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Save song to recently played
app.post('/recent', async (req, res) => {
  const { username, videoId, title, thumbnail, audioUrl } = req.body;
  if (!username || !videoId || !title || !thumbnail || !audioUrl) {
    return res.status(400).send('Missing song info');
  }

  try {
    // Step 1: Remove existing entry if it's already there
    await usersCollection.updateOne(
      { username },
      { $pull: { recentlyPlayed: { videoId } } }
    );

    // Step 2: Add to beginning of list and keep only 30 most recent
    await usersCollection.updateOne(
      { username },
      {
        $push: {
          recentlyPlayed: {
            $each: [{ videoId, title, thumbnail, audioUrl }],
            $position: 0,
            $slice: 20   // 👈 Limit the array to max 30 items
          }
        }
      }
    );

    res.send('Recently played updated');
  } catch (err) {
    console.error('❌ Error in /recent:', err);
    res.status(500).send('Internal Server Error');
  }
});

// get the song from recently played  
app.get('/recent/:username', async (req, res) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ 
      error: 'Missing username parameter',
      status: 400
    });
  }

  try {
    const user = await usersCollection.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        status: 404 
      });
    }

    if (!user.recentlyPlayed || user.recentlyPlayed.length === 0) {
      return res.status(200).json({ 
        songs: [],
        message: 'No recently played songs found'
      });
    }

    // Get audio cache info for all recently played songs
    const songs = await Audio.find({ 
      videoId: { $in: user.recentlyPlayed.map(song => song.videoId) }
    });

    // Combine recently played data with audio URLs
    const result = user.recentlyPlayed.map(song => {
      const audioInfo = songs.find(s => s.videoId === song.videoId);
      return {
        ...song,
        audioUrl: audioInfo?.audioUrl || null
      };
    });

    res.status(200).json({ songs: result });
  } catch (err) {
    console.error('❌ Error in GET /recent/:username:', err);
    res.status(500).json({ 
      error: 'Failed to fetch recently played songs',
      details: err.message,
      status: 500
    });
  }
});

// Add song to playlist
app.post('/playlist', async (req, res) => {
  const { username, videoId, title, thumbnail, audioUrl } = req.body;

  if (!username || !videoId || !title || !thumbnail) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if the song already exists
    const exists = user.playlists?.some(song => song.videoId === videoId);
    if (exists) {
      return res.status(409).json({ success: false, error: 'Song already in playlist' });
    }

    // ✅ Check playlist length
    if (user.playlists?.length >= 30) {
      return res.status(400).json({
        success: false,
        error: 'Playlist is full. Please delete a song to add a new one.'
      });
    }

    // Add song to playlist
    await usersCollection.updateOne(
      { username },
      {
        $push: {
          playlists: {
            videoId,
            title,
            thumbnail,
            audioUrl: audioUrl || null,
            addedAt: new Date()
          }
        }
      }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error in POST /playlist:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// get the song from playlist
app.get('/playlist/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ 
        error: 'Username is required',
        status: 400
      });
    }

    const user = await usersCollection.findOne(
      { username },
      { projection: { playlists: 1 } }
    );

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found', 
        status: 404 
      });
    }

    if (!user.playlists || user.playlists.length === 0) {
      return res.status(200).json({ 
        songs: [], 
        message: 'Playlist is empty' 
      });
    }

    // Extract just the videoIds from playlist items
    const videoIds = user.playlists.map(song => song.videoId);

    // Get audio URLs for these videoIds
    const audioItems = await Audio.find(
      { videoId: { $in: videoIds } },
      { videoId: 1, audioUrl: 1 }
    );

    // Combine data
    const songs = user.playlists.map(item => ({
      ...item,
      audioUrl: audioItems.find(a => a.videoId === item.videoId)?.audioUrl || null
    }));

    res.status(200).json({ songs });

  } catch (err) {
    console.error('Playlist fetch error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch playlist',
      details: err.message,
      status: 500
    });
  }
});

// Delete the song from playlist
app.delete('/playlist', async (req, res) => {
  const { username, videoId } = req.body;
  if (!username || !videoId)
    return res.status(400).send('Missing username or videoId');

  try {
    await usersCollection.updateOne(
      { username },
      { $pull: { playlists: { videoId } } }
    );
    res.send('Song removed from playlist');
  } catch (err) {
    console.error('❌ Error in DELETE /playlist:', err);
    res.status(500).send('Internal Server Error');
  }
});

//audio route with MongoDB caching
app.get('/audio', async (req, res) => {
  const videoId = req.query.videoId;
  const username = req.query.username; // Optional, for checking user's stored audio

  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId parameter' });
  }

  try {
    let userAudioUrl = null;
    let userSongSource = null;

    // ✅ STEP 1: Check audioUrl in user's recent or playlist
    if (username) {
      const user = await usersCollection.findOne({ username });

      const fromRecent = user?.recentlyPlayed?.find(song => song.videoId === videoId);
      const fromPlaylist = user?.playlists?.find(song => song.videoId === videoId);

      userAudioUrl = fromRecent?.audioUrl || fromPlaylist?.audioUrl || null;
      userSongSource = fromRecent ? 'recent' : (fromPlaylist ? 'playlist' : null);

      if (userAudioUrl) {
        const r1 = await fetch(userAudioUrl, { method: 'HEAD' });
        if (r1.ok && r1.headers.get('Content-Type')?.startsWith('audio')) {
          return res.json({ audioUrl: userAudioUrl, source: userSongSource });
        }
      }
    }

    // ✅ STEP 2: Check cached audioUrl in Audio collection
    const cached = await Audio.findOne({ videoId });

    if (cached?.audioUrl) {
      const r2 = await fetch(cached.audioUrl, { method: 'HEAD' });
      if (r2.ok && r2.headers.get('Content-Type')?.startsWith('audio')) {
        return res.json({ audioUrl: cached.audioUrl, source: 'cache' });
      } else {
        console.log('⚠️ Cached audio expired or invalid.');
      }
    }

    // ✅ STEP 3: Fetch fresh audio URL using yt-dlp
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const command = `yt-dlp -g -f "bestaudio[ext=m4a]" --no-download --quiet --no-warnings "${url}"`;
    const { stdout } = await execPromise(command);
    const audioUrl = stdout.trim();

    if (!audioUrl) {
      throw new Error('No audio URL received from yt-dlp');
    }

    // ✅ STEP 4: Save to Audio cache
    await Audio.updateOne(
      { videoId },
      { $set: { audioUrl, updatedAt: new Date() } },
      { upsert: true }
    );

    // ✅ STEP 5: (Optional) Update user's song audioUrl with fresh one
    if (username && userSongSource) {
      const updateField = userSongSource === 'recent' ? 'recentlyPlayed' : 'playlists';
      await usersCollection.updateOne(
        { username, [`${updateField}.videoId`]: videoId },
        { $set: { [`${updateField}.$.audioUrl`]: audioUrl } }
      );
    }

    // ✅ STEP 6: Enforce max 100 document cache
    const count = await Audio.countDocuments();
    if (count > 100) {
      const oldest = await Audio.find().sort({ updatedAt: 1 }).limit(count - 100);
      await Audio.deleteMany({ _id: { $in: oldest.map(doc => doc._id) } });
    }

    res.json({ audioUrl, source: 'fresh' });

  } catch (err) {
    console.error('❌ /audio error:', err);
    res.status(500).json({
      error: 'Failed to get audio URL',
      details: err.message,
    });
  }
});

// CRON job to refresh expired audio URLs
const audioRefreshQueue = new PQueue({ concurrency: 3 });

cron.schedule('0 * * * *', async () => {
  console.log('🔄 CRON: Checking for expired audio URLs From the Audios...');
  
  try {
    // Only select documents with valid videoIds
    const expiredAudios = await Audio.find({
      videoId: { $exists: true, $ne: null, $ne: '' }
    });

    await audioRefreshQueue.addAll(
      expiredAudios.map(audio => async () => {
        try {
          if (!audio.videoId || typeof audio.videoId !== 'string') {
            console.log(`⚠️ Invalid videoId: ${audio.videoId} - Skipping`);
            return;
          }

          // Check if URL still works
          const response = await axios.head(audio.audioUrl, { timeout: 5000 });
          if (response.status !== 200) throw new Error('URL expired');
          
          console.log(`✅ Valid: ${audio.videoId}`);
        } catch (err) {
          console.log(`⚠️ Expired: ${audio.videoId} → Refreshing...`);
          const url = `https://www.youtube.com/watch?v=${audio.videoId}`;
          const command = `yt-dlp -g -f "bestaudio[ext=m4a]" --no-download "${url}"`;

          const { stdout, stderr } = await promisify(exec)(command);
          if (stderr) console.warn(`yt-dlp stderr: ${stderr}`);

          const newUrl = stdout.trim();
          if (!newUrl) throw new Error('yt-dlp returned no URL');

          await Audio.updateOne(
            { videoId: audio.videoId },
            { audioUrl: newUrl, updatedAt: new Date() }
          );
          console.log(`✅ Updated: ${audio.videoId}`);
        }
      })
    );
  } catch (err) {
    console.error('❌ Audio refresh cron failed:', err);
  }
});

const YT_DLP_COMMAND = 'yt-dlp -g -f "bestaudio[ext=m4a]" --no-download';
const CONCURRENCY = 3;
const URL_VALIDATION_TIMEOUT = 5000;

const songCacheQueue = new PQueue({
  concurrency: CONCURRENCY,
  timeout: 300000,
  throwOnTimeout: true
});

// CRON job: every minute 
cron.schedule('15 * * * *', async () => {
  console.log('🔄 CRON: Starting song caching job from playlist...');
  const startTime = Date.now();

  try {
    const videoIds = await getUniqueVideoIds();
    console.log(`📦 Found ${videoIds.length} unique songs to process`);
    await processVideoIds(videoIds);
    console.log(`✅ Completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  } catch (err) {
    console.error('❌ CRON job failed:', err);
  }
});

async function getUniqueVideoIds() {
  const uniqueSongs = await User.aggregate([
    {
      $project: {
        combined: {
          $filter: {
            input: { $setUnion: ["$playlists", "$recentlyPlayed"] },
            as: "song",
            cond: {
              $and: [
                { $ne: ["$$song.videoId", null] },
                { $ne: ["$$song.videoId", ""] },
                { $ne: ["$$song.videoId", undefined] }
              ]
            }
          }
        }
      }
    },
    { $unwind: "$combined" },
    { $group: { _id: "$combined.videoId" } },
    { $match: { _id: { $exists: true, $ne: null } } }
  ]);

  return uniqueSongs.map(s => s._id).filter(isValidVideoId);
}

async function processVideoIds(videoIds) {
  const tasks = videoIds.map(videoId =>
    songCacheQueue.add(() => processSong(videoId))
  );
  await Promise.allSettled(tasks);
}

async function processSong(videoId) {
  try {
    console.log(`🔍 Processing: ${videoId}`);
    const existing = await Audio.findOne({ videoId }).lean();

    if (existing && await isUrlValid(existing.audioUrl)) {
      console.log(`✅ Valid audio in cache: ${videoId}`);
      const affectedUsers = await User.find({
        $or: [
          { "playlists.videoId": videoId },
          { "recentlyPlayed.videoId": videoId }
        ]
      });

      let needsUpdate = false;

      for (const user of affectedUsers) {
        const songs = [...(user.playlists || []), ...(user.recentlyPlayed || [])];
        for (const song of songs) {
          if (song.videoId === videoId && song.audioUrl !== existing.audioUrl) {
            needsUpdate = true;
            break;
          }
        }
        if (needsUpdate) break;
      }

      if (needsUpdate) {
        console.log(`♻️ Updating outdated audioUrl in user playlists/recent for ${videoId}`);
        await updateAudioAndUserReferences(videoId, existing.audioUrl);
      } else {
        console.log(`📌 All users already have the correct audioUrl for ${videoId}`);
      }

      return;
    }

    const audioUrl = await getFreshAudioUrl(videoId);
    await updateAudioAndUserReferences(videoId, audioUrl);
    console.log(`🆕 Cached successfully: ${videoId}`);
  } catch (err) {
    console.error(`❌ Failed ${videoId}:`, err.message);
  }
}

async function updateAudioAndUserReferences(videoId, audioUrl) {
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    await Audio.updateOne(
      { videoId },
      { $set: { audioUrl, updatedAt: new Date() } },
      { upsert: true, session }
    );

    await User.updateMany(
      {
        $or: [
          { "playlists.videoId": videoId },
          { "recentlyPlayed.videoId": videoId }
        ]
      },
      {
        $set: {
          "playlists.$[elem].audioUrl": audioUrl,
          "recentlyPlayed.$[elem].audioUrl": audioUrl
        }
      },
      {
        arrayFilters: [{ "elem.videoId": videoId }],
        session
      }
    );
  });
  session.endSession();
}

async function isUrlValid(url) {
  try {
    const res = await axios.head(url, { timeout: URL_VALIDATION_TIMEOUT });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function getFreshAudioUrl(videoId) {
  const { stdout, stderr } = await execPromise(
    `${YT_DLP_COMMAND} "https://www.youtube.com/watch?v=${videoId}"`
  );
  if (stderr) console.warn(`⚠️ yt-dlp stderr for ${videoId}:`, stderr);
  const audioUrl = stdout.trim();
  if (!audioUrl) throw new Error('yt-dlp returned no URL');
  return audioUrl;
}

function isValidVideoId(videoId) {
  return videoId && typeof videoId === 'string' && videoId.trim() !== '' && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}


app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
