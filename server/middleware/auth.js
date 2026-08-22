import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/index.js';

export const requireAuth = async (req, res, next) => {
  // Read token from header or cookie
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Session expired or token invalid. Please re-authenticate.' });
  }

  try {
    const dbUser = await User.findById(decoded.id);
    if (dbUser) {
      req.user = {
        id: dbUser._id,
        _id: dbUser._id,
        role: dbUser.role || 'user',
        email: dbUser.email,
        name: dbUser.name
      };
    } else {
      req.user = decoded;
      if (!req.user.role) req.user.role = 'user';
    }
  } catch (err) {
    req.user = decoded;
    if (!req.user.role) req.user.role = 'user';
  }

  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }

  next();
};

export const optionalAuth = (req, res, next) => {
  let token = req.cookies.accessToken;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};
