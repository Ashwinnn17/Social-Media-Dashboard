const User = require('../models/User');

// GET /api/user/me
const getMe = async (req, res) => {
  res.json({
    id:       req.user._id,
    name:     req.user.name,
    email:    req.user.email,
    accounts: req.user.accounts,
  });
};

// PUT /api/user/accounts
// Body: { github, reddit, lastfm }
const updateAccounts = async (req, res) => {
  const { github, reddit, lastfm } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { accounts: { github: github || '', reddit: reddit || '', lastfm: lastfm || '' } },
      { new: true }
    ).select('-password');

    res.json({
      id:       user._id,
      name:     user.name,
      email:    user.email,
      accounts: user.accounts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMe, updateAccounts };