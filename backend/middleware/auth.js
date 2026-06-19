const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Read the token cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, token cookie missing' });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the database, excluding the password
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ message: 'Not authorized, user not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Auth middleware error: ${error.message}`);
    res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

module.exports = { protect };
