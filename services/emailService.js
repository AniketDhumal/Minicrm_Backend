const axios = require('axios');
const Log = require('../models/Log');

const simulateVendorAPI = async (message, customer) => {
  try {
    // Simulate API call with 90% success rate
    const success = Math.random() < 0.9;
    
    if (success) {
      // Simulate delivery
      setTimeout(() => {
        Log.create({
          customer: customer._id,
          message,
          status: 'delivered'
        });
      }, 1000 + Math.random() * 5000);
      
      return { status: 'sent' };
    } else {
      throw new Error('Failed to send message');
    }
  } catch (err) {
    await Log.create({
      customer: customer._id,
      message,
      status: 'failed',
      error: err.message
    });
    return { status: 'failed', error: err.message };
  }
};

module.exports = { simulateVendorAPI };