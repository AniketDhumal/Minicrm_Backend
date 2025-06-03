const Queue = require('bull');
const Campaign = require('../models/Campaign');
const { sendCampaignMessages } = require('../services/mailService');

const campaignQueue = new Queue('campaigns', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

campaignQueue.process(async (job) => {
  const { campaignId } = job.data;
  
  try {
    // Update campaign status to processing
    await Campaign.findByIdAndUpdate(campaignId, { 
      status: 'processing',
      startedAt: new Date()
    });

    // Get campaign with segment rules
    const campaign = await Campaign.findById(campaignId);
    
    // Process campaign (send messages)
    const result = await sendCampaignMessages(campaign);
    
    // Update campaign status and stats
    await Campaign.findByIdAndUpdate(campaignId, {
      status: 'sent',
      completedAt: new Date(),
      stats: result.stats
    });

    return { success: true, campaignId };
  } catch (error) {
    await Campaign.findByIdAndUpdate(campaignId, { 
      status: 'failed',
      error: error.message 
    });
    throw error;
  }
});

campaignQueue.on('completed', (job, result) => {
  console.log(`Campaign ${result.campaignId} completed successfully`);
});

campaignQueue.on('failed', (job, error) => {
  console.error(`Campaign ${job.data.campaignId} failed:`, error);
});

module.exports = campaignQueue;