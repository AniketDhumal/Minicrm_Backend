const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
  generateSegmentRules, 
  generateMessageSuggestions 
} = require('../controllers/aiController');

router.use(passport.authenticate('jwt', { session: false }));

router.post('/generate-rules', generateSegmentRules);
router.post('/generate-messages', generateMessageSuggestions);

module.exports = router;