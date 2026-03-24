const express = require('express');
const { getGitHub, getReddit, getLastfm } = require('../controllers/feedController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/github',  protect, getGitHub);
router.get('/reddit',  protect, getReddit);
router.get('/lastfm',  protect, getLastfm);

module.exports = router;