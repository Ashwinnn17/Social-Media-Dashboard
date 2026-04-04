const express = require('express');
const { getGitHub, getReddit, getLastfm, getSteam } = require('../controllers/feedController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/github',  protect, getGitHub);
router.get('/reddit',  protect, getReddit);
router.get('/lastfm',  protect, getLastfm);
router.get('/steam',   protect, getSteam);

module.exports = router;