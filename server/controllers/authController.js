import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, RefreshToken, Notification } from '../models/index.js';
import { generateTokens, setTokenCookies, clearTokenCookies, verifyRefreshToken } from '../utils/jwt.js';

// Mail Simulation Helper
const sendSimulatedEmail = (to, subject, html) => {
  console.log(`\n==================================================`);
  console.log(`📨 SIMULATING EMAIL SENT TO: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${html.replace(/<[^>]*>/g, '')}`); // Strip HTML tags for clean console output
  console.log(`==================================================\n`);
};

export const register = async (req, res, next) => {
  try {
    const { name, username, email, phone, password, role } = req.body;

    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanUsername = username ? username.trim() : '';

    if (!cleanEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Check if user already exists
    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    if (cleanUsername) {
      const usernameExists = await User.findOne({ username: cleanUsername });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6 digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Determine initial role
    const assignedRole = (role === 'admin' || cleanEmail.includes('admin')) ? 'admin' : (role || 'user');

    // Create user in jsonDb.js / Mongo
    const newUser = await User.create({
      name: name || cleanUsername || 'Dev User',
      username: cleanUsername || cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: phone || '',
      password: hashedPassword,
      role: assignedRole,
      otp,
      otpExpiry,
      verified: true
    });

    // Generate initial tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Save refresh token to DB
    await RefreshToken.create({
      userId: newUser._id.toString(),
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Set Cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Add first notification
    await Notification.create({
      userId: newUser._id.toString(),
      title: 'Welcome to DevStore!',
      message: 'Thank you for signing up. Your account is active.',
      type: 'system'
    });

    // Remove password from local user object before sending response
    const userResponse = { ...newUser };
    delete userResponse.password;
    if (!userResponse.role) userResponse.role = assignedRole;

    res.status(201).json({
      message: 'Account created successfully.',
      token: accessToken,
      accessToken,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message || 'Registration failed.' });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check user by email or username
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = await User.findOne({ username: email.trim() });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Verify Password
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.role || (cleanEmail.includes('admin') && user.role !== 'admin')) {
      user.role = cleanEmail.includes('admin') ? 'admin' : (user.role || 'user');
    }

    // Track login history details
    const device = req.headers['user-agent'] || 'Unknown Device';
    const ip = req.ip || 'Unknown IP';
    
    const history = [...(user.loginHistory || [])];
    history.push({ device, ip, loginAt: new Date() });
    if (history.length > 10) history.shift();

    await User.findByIdAndUpdate(user._id, { loginHistory: history });

    // Generate Tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token
    await RefreshToken.create({
      userId: user._id.toString(),
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Set Cookies
    setTokenCookies(res, accessToken, refreshToken);

    const userResponse = { ...user };
    delete userResponse.password;

    res.status(200).json({
      message: 'Logged in successfully.',
      token: accessToken,
      accessToken,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      // Delete token from database
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    clearTokenCookies(res);
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;
    if (!refreshTokenCookie) {
      return res.status(401).json({ message: 'Session expired or refresh token invalid.' });
    }

    const payload = verifyRefreshToken(refreshTokenCookie);
    if (!payload) {
      return res.status(401).json({ message: 'Session expired or refresh token invalid.' });
    }

    // Check if refresh token is in DB
    const dbToken = await RefreshToken.findOne({ token: refreshTokenCookie });
    if (!dbToken || new Date() > new Date(dbToken.expiresAt)) {
      return res.status(401).json({ message: 'Session expired or refresh token invalid.' });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update in DB (replace old with new)
    await RefreshToken.deleteOne({ token: refreshTokenCookie });
    await RefreshToken.create({
      userId: user._id.toString(),
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    setTokenCookies(res, accessToken, newRefreshToken);

    res.status(200).json({ message: 'Session refreshed.' });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Account is already verified.' });
    }

    if (user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Mark as verified
    await User.findByIdAndUpdate(userId, {
      verified: true,
      otp: null,
      otpExpiry: null
    });

    res.status(200).json({ message: 'Your account has been verified successfully.' });
  } catch (error) {
    next(error);
  }
};

// Public OTP verify — accepts email + code (no auth cookie needed)
export const publicVerifyOTP = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.verified) {
      // Already verified — just send back the user
      const { accessToken, refreshToken } = generateTokens(user);
      await RefreshToken.create({ userId: user._id.toString(), token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
      setTokenCookies(res, accessToken, refreshToken);
      const u = { ...user }; delete u.password;
      return res.status(200).json({ message: 'Already verified.', user: u });
    }

    if (user.otp !== code || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    await User.findByIdAndUpdate(user._id, { verified: true, otp: null, otpExpiry: null });

    const { accessToken, refreshToken } = generateTokens(user);
    await RefreshToken.create({ userId: user._id.toString(), token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    setTokenCookies(res, accessToken, refreshToken);

    const uRes = { ...user }; uRes.verified = true; delete uRes.password;
    res.status(200).json({ message: 'Account verified and authenticated.', user: uRes });
  } catch (error) { next(error); }
};

export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not registered.' });
    if (user.verified) return res.status(400).json({ message: 'Account already verified.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry });

    sendSimulatedEmail(email, 'Resend OTP — DevStore', `<p>Your new OTP is <strong>${otp}</strong>. Valid for 10 minutes.</p>`);
    res.status(200).json({ message: 'New OTP sent to email.' });
  } catch (error) { next(error); }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // To prevent account harvesting, return success regardless
      return res.status(200).json({ message: 'If that email exists, we have sent a discount link/token.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, { resetToken, resetExpiry });

    // Send reset instructions
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    sendSimulatedEmail(
      email,
      'Password Reset Request - DevStore',
      `<h1>Reset Your Password</h1><p>Click <a href="${resetLink}">here</a> to reset your password or copy the token: <strong>${resetToken}</strong></p>`
    );

    res.status(200).json({ message: 'Password reset link sent successfully.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetExpiry: { $gt: new Date().toISOString() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetExpiry: null
    });

    res.status(200).json({ message: 'Password reset successful. You may now login.' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userResponse = { ...user };
    delete userResponse.password;
    if (!userResponse.role) userResponse.role = 'user';

    res.status(200).json({ user: userResponse, ...userResponse, role: userResponse.role });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, phone } },
      { new: true }
    );

    const userResponse = { ...updatedUser };
    delete userResponse.password;

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};
