const Campaign = require('../models/Campaign');
const { getCustomersByRules } = require('../services/segmentService');
const { queueCampaign } = require('../queues/campaign.queue');

exports.createCampaign = async (req, res) => {
  try {
    const { name, message, segmentRules } = req.body;
    
    const campaign = await Campaign.create({
      name,
      message,
      segmentRules,
      createdBy: req.user.id,
      stats: { total: 0, sent: 0, delivered: 0 }
    });

    // Queue for processing
    await queueCampaign(campaign._id);

    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.getUserCampaigns(req.user.id);
    res.json(campaigns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getCampaignStats = async (req, res) => {
  try {
    const stats = await Campaign.getStats(req.user.id);
    res.json(stats[0] || { total: 0, sent: 0, failed: 0, totalMessages: 0 });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.previewAudience = async (req, res) => {
  try {
    const { rules } = req.body;
    const customers = await getCustomersByRules(rules);
    res.json({ size: customers.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};