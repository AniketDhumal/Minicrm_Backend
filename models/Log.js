const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  message: String,
  status: { type: String, enum: ['sent', 'delivered', 'failed'] },
  error: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);