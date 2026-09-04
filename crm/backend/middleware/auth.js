const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {

  let token;

  // TOKEN FROM COOKIE
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // TOKEN FROM AUTH HEADER
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // NO TOKEN
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not logged in'
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });

  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };