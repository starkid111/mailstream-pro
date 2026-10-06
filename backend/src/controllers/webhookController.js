const CampaignRecipient = require('../models/CampaignRecipient');
const EmailEvent = require('../models/EmailEvent');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Receive webhook event from email service provider
// @route   POST /api/webhooks/email
// @access  Public (Provider endpoint)
const handleEmailWebhook = async (req, res) => {
  try {
    const { providerMessageId, event, timestamp, reason } = req.body;

    if (!providerMessageId || !event) {
      return sendError(res, 400, 'Webhook payload requires providerMessageId and event type.');
    }

    const eventType = event.toUpperCase();
    if (!['DELIVERED', 'FAILED'].includes(eventType)) {
      return sendError(res, 400, `Unsupported webhook event type: ${event}`);
    }

    const campaignRecipient = await CampaignRecipient.findOne({ providerMessageId });
    if (!campaignRecipient) {
      return sendError(res, 404, `No matching recipient found for message ID: ${providerMessageId}`);
    }

    const eventDate = timestamp ? new Date(timestamp) : new Date();

    if (eventType === 'DELIVERED') {
      campaignRecipient.status = 'DELIVERED';
      campaignRecipient.deliveredAt = eventDate;
    } else if (eventType === 'FAILED') {
      campaignRecipient.status = 'FAILED';
      campaignRecipient.failedAt = eventDate;
      campaignRecipient.failureReason = reason || 'Provider delivery failure notification';
    }

    await campaignRecipient.save();

    // Log event in EmailEvent history
    await EmailEvent.create({
      campaignRecipientId: campaignRecipient._id,
      eventType,
      providerMessageId,
      details: { reason, timestamp },
    });

    return sendSuccess(res, 200, `Webhook event ${eventType} processed for message ${providerMessageId}`, {
      campaignRecipientId: campaignRecipient._id,
      status: campaignRecipient.status,
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error processing email webhook');
  }
};

// @desc    Simulate delivery updates for testing/demo
// @route   POST /api/webhooks/simulate
// @access  Public/Protected (Demo helper)
const simulateDeliveryWebhook = async (req, res) => {
  try {
    const { campaignId, status, targetRecipientId } = req.body;

    if (!campaignId) {
      return sendError(res, 400, 'Please provide campaignId');
    }

    const targetStatus = status ? status.toUpperCase() : 'DELIVERED';
    if (!['DELIVERED', 'FAILED'].includes(targetStatus)) {
      return sendError(res, 400, 'Status must be DELIVERED or FAILED');
    }

    const query = { campaignId };
    if (targetRecipientId) {
      query.$or = [{ _id: targetRecipientId }, { recipientId: targetRecipientId }];
    }

    const recipientsToUpdate = await CampaignRecipient.find(query);
    if (recipientsToUpdate.length === 0) {
      return sendError(res, 404, 'No matching campaign recipients found for delivery simulation.');
    }

    const updated = [];
    for (const cr of recipientsToUpdate) {
      cr.status = targetStatus;
      if (targetStatus === 'DELIVERED') {
        cr.deliveredAt = new Date();
        cr.failedAt = null;
        cr.failureReason = null;
      } else {
        cr.failedAt = new Date();
        cr.failureReason = 'Simulated bounce / inbox full';
      }
      await cr.save();

      await EmailEvent.create({
        campaignRecipientId: cr._id,
        eventType: targetStatus,
        providerMessageId: cr.providerMessageId || `sim_${Date.now()}`,
        details: { note: 'Simulated via provider webhook trigger' },
      });

      updated.push(cr._id);
    }

    return sendSuccess(res, 200, `Simulated ${targetStatus} status for ${updated.length} recipients`, {
      updatedCount: updated.length,
      status: targetStatus,
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error running delivery simulation');
  }
};

module.exports = {
  handleEmailWebhook,
  simulateDeliveryWebhook,
};
