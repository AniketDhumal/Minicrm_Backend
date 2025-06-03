const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: { type: String, required: true, unique: true },
  phone: String,
  totalSpent: { type: Number, default: 0 },
  ordersCount: { type: Number, default: 0 },
  lastPurchaseDate: Date,
  segment: {
    type: String,
    enum: ['new', 'regular', 'loyal', 'churned'],
    default: 'new'
  },
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);