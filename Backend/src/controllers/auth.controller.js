import User from '../models/User.js';
import { createUser, findUserByUsernamePublic, verifyLogin } from '../services/user.service.js';

export async function signup(req, res) {
  const username = typeof req.body.username === 'string'
    ? req.body.username.trim().toLowerCase()
    : '';

  const password = typeof req.body.password === 'string'
    ? req.body.password
    : '';

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    
    await createUser({ username, password });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  const username = typeof req.body.username === 'string'
    ? req.body.username.trim().toLowerCase()
    : '';

  const password = typeof req.body.password === 'string'
    ? req.body.password
    : '';

  const authKey = typeof req.body.authKey === 'string'
    ? req.body.authKey.trim()
    : '';

  if (!username || !password || !authKey) {
    return res.status(400).json({
      message:'Missing username, password, or authKey'
    });
  }

  try {
    const result = await verifyLogin({ username, password, authKey });

    if (!result) {
      return res.status(401).json({
        message:'Invalid credentials or authKey'
      });
    }

    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: {
        id: result.user._id,
        username: result.user.username,
      },
    });
  } catch (err) {
    res.status(500).json({
      message:err.message
    })
  }
}

export async function getUserByUsername(req, res) {
  const username = typeof req.params.username === 'string' ? req.params.username.trim() : '';

  if (!username) {
    return res.status(400).send('Missing username');
  }

  try {
    const user = await findUserByUsernamePublic(username);
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (err) {
    console.error('❌ Error in GET /user/:username:', err.message);
    res.status(500).send('Internal Server Error');
  }
}