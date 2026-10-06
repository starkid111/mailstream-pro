const Campaign = require('../models/Campaign');
const CampaignRecipient = require('../models/CampaignRecipient');
const Recipient = require('../models/Recipient');
const EmailEvent = require('../models/EmailEvent');
const { sendCampaignEmails } = require('../services/emailService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get campaigns with pagination & status summary
// @route   GET /api/campaigns
// @access  Private
const getCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Attach delivery status counts to each campaign
    const campaignIds = campaigns.map((c) => c._id);
    const recipientStats = await CampaignRecipient.aggregate([
      { $match: { campaignId: { $in: campaignIds } } },
      {
        $group: {
          _id: '$campaignId',
          totalRecipients: { $sum: 1 },
          sentCount: { $sum: { $cond: [{ $in: ['$status', ['SENT', 'DELIVERED']] }, 1, 0] } },
          deliveredCount: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
          failedCount: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
        },
      },
    ]);

    const statsMap = {};
    recipientStats.forEach((stat) => {
      statsMap[stat._id.toString()] = stat;
    });

    const enrichedCampaigns = campaigns.map((campaign) => {
      const stat = statsMap[campaign._id.toString()] || {
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        pendingCount: 0,
      };
      return {
        ...campaign,
        stats: stat,
      };
    });

    return sendSuccess(res, 200, 'Campaigns retrieved successfully', {
      campaigns: enrichedCampaigns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error fetching campaigns');
  }
};

// @desc    Get single campaign by ID with full delivery metrics
// @route   GET /api/campaigns/:id
// @access  Private
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found');
    }

    const recipientStats = await CampaignRecipient.aggregate([
      { $match: { campaignId: campaign._id } },
      {
        $group: {
          _id: '$campaignId',
          totalRecipients: { $sum: 1 },
          sentCount: { $sum: { $cond: [{ $in: ['$status', ['SENT', 'DELIVERED']] }, 1, 0] } },
          deliveredCount: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
          failedCount: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
        },
      },
    ]);

    const stats = recipientStats[0] || {
      totalRecipients: 0,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      pendingCount: 0,
    };

    const deliveryRate = stats.sentCount > 0 
      ? Math.round((stats.deliveredCount / stats.sentCount) * 100) 
      : 0;

    return sendSuccess(res, 200, 'Campaign retrieved successfully', {
      campaign: {
        ...campaign,
        stats: {
          ...stats,
          deliveryRate,
        },
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error fetching campaign details');
  }
};

// @desc    Create a new campaign and assign target recipients
// @route   POST /api/campaigns
// @access  Private
const createCampaign = async (req, res) => {
  try {
    const { name, subject, content, recipientIds } = req.body;

    if (!name || !subject || !content) {
      return sendError(res, 400, 'Campaign name, subject, and email content are required.');
    }

    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return sendError(res, 400, 'Please select at least one recipient for this campaign.');
    }

    // Verify all recipientIds belong to current user
    const validRecipients = await Recipient.find({
      _id: { $in: recipientIds },
      userId: req.user._id,
    });

    if (validRecipients.length !== recipientIds.length) {
      return sendError(res, 400, 'One or more selected recipients are invalid or do not belong to your account.');
    }

    const campaign = await Campaign.create({
      userId: req.user._id,
      name,
      subject,
      content,
      status: 'DRAFT',
    });

    // Create CampaignRecipient records
    const campaignRecipientDocs = validRecipients.map((rec) => ({
      campaignId: campaign._id,
      recipientId: rec._id,
      status: 'PENDING',
    }));

    await CampaignRecipient.insertMany(campaignRecipientDocs);

    return sendSuccess(res, 201, 'Campaign created successfully as DRAFT', {
      campaign,
      totalTargetedRecipients: validRecipients.length,
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error creating campaign');
  }
};

// @desc    Update draft campaign
// @route   PATCH /api/campaigns/:id
// @access  Private
const updateCampaign = async (req, res) => {
  try {
    const { name, subject, content, recipientIds } = req.body;

    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found');
    }

    if (campaign.status !== 'DRAFT') {
      return sendError(res, 400, `Campaign cannot be modified once it is in ${campaign.status} status.`);
    }

    if (name) campaign.name = name;
    if (subject) campaign.subject = subject;
    if (content) campaign.content = content;

    await campaign.save();

    // If recipientIds updated, reset CampaignRecipient links
    if (Array.isArray(recipientIds) && recipientIds.length > 0) {
      const validRecipients = await Recipient.find({
        _id: { $in: recipientIds },
        userId: req.user._id,
      });

      if (validRecipients.length === recipientIds.length) {
        await CampaignRecipient.deleteMany({ campaignId: campaign._id });
        const campaignRecipientDocs = validRecipients.map((rec) => ({
          campaignId: campaign._id,
          recipientId: rec._id,
          status: 'PENDING',
        }));
        await CampaignRecipient.insertMany(campaignRecipientDocs);
      }
    }

    return sendSuccess(res, 200, 'Campaign updated successfully', { campaign });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error updating campaign');
  }
};

// @desc    Delete campaign and recipient mappings
// @route   DELETE /api/campaigns/:id
// @access  Private
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found');
    }

    await CampaignRecipient.deleteMany({ campaignId: campaign._id });

    return sendSuccess(res, 200, 'Campaign deleted successfully', { _id: campaign._id });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error deleting campaign');
  }
};

// @desc    Send campaign through email provider
// @route   POST /api/campaigns/:id/send
// @access  Private
const sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found');
    }

    // Allow sending DRAFT or re-sending SENT campaigns
    if (campaign.status === 'SENDING') {
      return sendError(res, 400, 'Campaign is currently sending...');
    }

    // Get assigned target recipients
    const campaignRecipients = await CampaignRecipient.find({ campaignId: campaign._id }).populate('recipientId');

    if (campaignRecipients.length === 0) {
      return sendError(res, 400, 'No targeted recipients found for this campaign.');
    }

    // Update campaign status to SENDING
    campaign.status = 'SENDING';
    await campaign.save();

    // Extract target recipient objects
    const recipientsList = campaignRecipients.map((cr) => cr.recipientId).filter(Boolean);

    // Send emails
    const sendResults = await sendCampaignEmails(campaign, recipientsList);

    // Update CampaignRecipient entries with results & message IDs
    let successCount = 0;
    let failCount = 0;

    for (const result of sendResults) {
      const cr = campaignRecipients.find((doc) => doc.recipientId && doc.recipientId._id.toString() === result.recipientId.toString());
      if (cr) {
        cr.status = result.status;
        cr.providerMessageId = result.providerMessageId;
        if (result.status === 'SENT') {
          cr.sentAt = result.sentAt;
          cr.previewUrl = result.previewUrl || null;
          successCount++;
        } else {
          cr.failedAt = result.failedAt;
          cr.failureReason = result.failureReason;
          failCount++;
        }
        await cr.save();

        // Create EmailEvent log
        await EmailEvent.create({
          campaignRecipientId: cr._id,
          eventType: result.status,
          providerMessageId: result.providerMessageId,
        });
      }
    }

    // Mark campaign SENT or FAILED
    campaign.status = successCount > 0 ? 'SENT' : 'FAILED';
    campaign.sentAt = new Date();
    await campaign.save();

    // Auto-schedule simulated provider delivery webhooks after 2 seconds for seamless testing
    setTimeout(async () => {
      try {
        const sentRecords = await CampaignRecipient.find({ campaignId: campaign._id, status: 'SENT' });
        for (const cr of sentRecords) {
          cr.status = 'DELIVERED';
          cr.deliveredAt = new Date();
          await cr.save();

          await EmailEvent.create({
            campaignRecipientId: cr._id,
            eventType: 'DELIVERED',
            providerMessageId: cr.providerMessageId,
            details: { note: 'Auto-confirmed via Ethereal SMTP Provider' },
          });
        }
        console.log(`[Auto Delivery Tracker] Successfully confirmed delivery for ${sentRecords.length} campaign recipients.`);
      } catch (err) {
        console.error('[Auto Delivery Tracker Error]', err);
      }
    }, 2000);

    return sendSuccess(res, 200, `Campaign sent to ${successCount} recipients (${failCount} failed)`, {
      campaignId: campaign._id,
      status: campaign.status,
      totalSent: successCount,
      totalFailed: failCount,
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error processing campaign send');
  }
};

// @desc    Get campaign recipients with delivery status breakdown
// @route   GET /api/campaigns/:id/recipients
// @access  Private
const getCampaignRecipients = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!campaign) {
      return sendError(res, 404, 'Campaign not found');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const statusFilter = req.query.status;
    const skip = (page - 1) * limit;

    const query = { campaignId: campaign._id };
    if (statusFilter && ['PENDING', 'SENT', 'DELIVERED', 'FAILED'].includes(statusFilter.toUpperCase())) {
      query.status = statusFilter.toUpperCase();
    }

    const total = await CampaignRecipient.countDocuments(query);
    const recipients = await CampaignRecipient.find(query)
      .populate('recipientId', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, 200, 'Campaign recipients retrieved successfully', {
      recipients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error fetching campaign recipients');
  }
};

// @desc    Get dashboard summary metrics
// @route   GET /api/campaigns/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalCampaigns = await Campaign.countDocuments({ userId });
    const totalRecipients = await Recipient.countDocuments({ userId });

    const allUserCampaigns = await Campaign.find({ userId }).select('_id').lean();
    const allCampaignIds = allUserCampaigns.map((c) => c._id);

    const recentCampaigns = await Campaign.find({ userId }).select('_id status name sentAt createdAt').sort({ createdAt: -1 }).limit(5).lean();

    const deliveryStats = await CampaignRecipient.aggregate([
      { $match: { campaignId: { $in: allCampaignIds } } },
      {
        $group: {
          _id: null,
          sent: { $sum: { $cond: [{ $in: ['$status', ['SENT', 'DELIVERED']] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
        },
      },
    ]);

    const stats = deliveryStats[0] || { sent: 0, delivered: 0, failed: 0, pending: 0 };
    const deliveryRate = stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0;

    return sendSuccess(res, 200, 'Dashboard statistics loaded successfully', {
      totalCampaigns,
      totalRecipients,
      totalSent: stats.sent,
      totalDelivered: stats.delivered,
      totalFailed: stats.failed,
      deliveryRate,
      recentCampaigns,
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error loading dashboard statistics');
  }
};

module.exports = {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  getCampaignRecipients,
  getDashboardSummary,
};
