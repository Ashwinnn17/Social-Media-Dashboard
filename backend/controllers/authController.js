const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  console.log('Register hit', req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Please fill all fields' });

  try {
    console.log('Checking if user exists...');
    const exists = await User.findOne({ email });
    console.log('Exists check done:', exists);
    
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    console.log('Creating user...');
    const user = await User.create({ name, email, password });
    console.log('User created:', user._id);

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        accounts: user.accounts,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Please fill all fields' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      token: generateToken(user._id),
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        accounts: user.accounts,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login };