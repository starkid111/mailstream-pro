const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Email content is required'],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SENDING', 'SENT', 'DELIVERED', 'FAILED'],
      default: 'DRAFT',
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Campaign', campaignSchema);
