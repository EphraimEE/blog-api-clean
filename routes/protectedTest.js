const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

router.get('/private', protect, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.name || req.user.username}!`,
    user: req.user
  });
});

module.exports = router;