const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  createCampaign,
  getCampaigns,
  getCampaignStats,
  previewAudience
} = require('../controllers/campaignController');

// Protect all routes with JWT authentication
router.use(passport.authenticate('jwt', { session: false }));

router.post('/', createCampaign);
router.get('/', getCampaigns);
router.get('/stats', getCampaignStats);
router.post('/preview', previewAudience);

module.exports = router;