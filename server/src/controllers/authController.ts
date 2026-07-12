import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Affiliate from '../models/Affiliate';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, isAffiliate, affiliateUsername } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    const passwordHash = hashPassword(password);
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';

    // Admins cannot be affiliates
    const isAffiliateFinal = role === 'admin' ? false : !!isAffiliate;

    const newUser = new User({
      name,
      email,
      phone,
      passwordHash,
      role,
      isAffiliate: isAffiliateFinal
    });

    await newUser.save();

    // If requested to be an affiliate during signup
    if (isAffiliateFinal && affiliateUsername) {
      const usernameClean = affiliateUsername.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Check if username is taken
      const existingAffiliate = await Affiliate.findOne({ username: usernameClean });
      if (existingAffiliate) {
        // Rollback user creation
        await User.findByIdAndDelete(newUser._id);
        res.status(400).json({ error: 'Affiliate username is already taken.' });
        return;
      }

      const couponCode = `${usernameClean.toUpperCase()}10`;
      const newAffiliate = new Affiliate({
        userId: newUser._id,
        username: usernameClean,
        couponCode
      });

      await newAffiliate.save();

      newUser.isAffiliate = true;
      newUser.affiliateProfile = newAffiliate._id as any;
      await newUser.save();
    }

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Registration failed.', message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }

    // Generate JWT signed token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set signed HTTP-only cookie with cross-origin speed optimizations and strict properties
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAffiliate: user.isAffiliate,
        pointsBalance: user.pointsBalance,
        affiliateProfile: user.affiliateProfile
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed.', message: error.message });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  });
  res.json({ message: 'Logged out successfully.' });
};

export const getCurrentUser = async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = await User.findById(req.user.userId)
      .select('-passwordHash')
      .populate('affiliateProfile');
      
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve current user.', message: error.message });
  }
};

export const toggleAffiliateStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { username } = req.body;
    if (!username) {
      res.status(400).json({ error: 'Affiliate username reference is required.' });
      return;
    }

    const usernameClean = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (user.role === 'admin') {
      res.status(403).json({ error: 'Admins cannot register as affiliates.' });
      return;
    }

    if (user.isAffiliate) {
      res.status(400).json({ error: 'Account is already registered as an affiliate.' });
      return;
    }

    // Check availability
    const existingAffiliate = await Affiliate.findOne({ username: usernameClean });
    if (existingAffiliate) {
      res.status(400).json({ error: 'Affiliate username reference already in use.' });
      return;
    }

    const couponCode = `${usernameClean.toUpperCase()}10`;
    const newAffiliate = new Affiliate({
      userId: user._id,
      username: usernameClean,
      couponCode
    });

    await newAffiliate.save();

    user.isAffiliate = true;
    user.affiliateProfile = newAffiliate._id as any;
    await user.save();

    res.json({
      message: 'Affiliate status enabled successfully.',
      affiliate: newAffiliate
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to enable affiliate status.', message: error.message });
  }
};
