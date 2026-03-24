const express = require('express');
const { getMe, updateAccounts } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me',       protect, getMe);
router.put('/accounts', protect, updateAccounts);

module.exports = router;