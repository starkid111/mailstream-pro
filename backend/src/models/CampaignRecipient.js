const mongoose = require('mongoose');

const campaignRecipientSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipient',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED'],
      default: 'PENDING',
    },
    providerMessageId: {
      type: String,
      index: true,
      default: null,
    },
    previewUrl: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

campaignRecipientSchema.index({ campaignId: 1, recipientId: 1 }, { unique: true });

module.exports = mongoose.model('CampaignRecipient', campaignRecipientSchema);
