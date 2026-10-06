const mongoose = require('mongoose');

const emailEventSchema = new mongoose.Schema(
  {
    campaignRecipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignRecipient',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['SENT', 'DELIVERED', 'FAILED'],
      required: true,
    },
    providerMessageId: {
      type: String,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmailEvent', emailEventSchema);
