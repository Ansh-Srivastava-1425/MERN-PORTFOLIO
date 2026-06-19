import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if any user already exists in the collection
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      res.status(403).json({ message: 'Registration forbidden. Admin account already exists.' });
      return;
    }

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please provide name, email, and password.' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    // Find user by email and select password field
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // expire immediately
  });
  res.status(200).json({ message: 'Logged out successfully' });
};


export const getMe = (req, res) => {
  // req.user has already been set by the protect middleware
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
};
