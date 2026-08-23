import jwt from 'jsonwebtoken';
import { RefreshToken } from '../models/index.js';

// Strict fallback values if process.env variables are missing or empty
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'devstore_default_access_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'devstore_default_refresh_secret_key_2026';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: '1d' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

export const setTokenCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15 mins
  };

  const refreshOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshOptions);
};

export const clearTokenCookies = (res) => {
  res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (error) {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (e) {
      return null;
    }
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
