import User from '../models/User.js';
import { generateAuthKey } from '../utils/helpers.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export async function findUserByUsername(username) {
  return User.findOne({ username });
}

export async function findUserByUsernamePublic(username) {
  return User.findOne({ username }).select('-password');
}

export async function createUser({ username, password }) {
  const authKey = generateAuthKey();
  console.log(authKey)
  const hashedPassword = await bcrypt.hash(password, 12);
  const hashedAuthKey= await bcrypt.hash(authKey, 12);

  const user=await User.create({
    username,
    password: hashedPassword,
    authKey:hashedAuthKey,
    playlists: [],
    recentlyPlayed: [],
  });

  return { username, id: user._id };
}

export async function verifyLogin({ username, password, authKey }) {
  const user = await findUserByUsername(username);

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  const isAuthKeyValid = await bcrypt.compare(authKey, user.authKey);

  if (!isPasswordValid || !isAuthKeyValid) {
    return null;
  }

  
  const payload = {
    id: user._id,
    username: user.username,
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET, 
    { expiresIn: "7d" }     
  );

  return {
    token,
    user: {
      _id: user._id,
      username: user.username,
    },
  };
}