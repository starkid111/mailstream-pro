const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Composite index to enforce unique recipient email per user
recipientSchema.index({ userId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Recipient', recipientSchema);
