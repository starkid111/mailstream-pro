const Recipient = require('../models/Recipient');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all user recipients with search & pagination
// @route   GET /api/recipients
// @access  Private
const getRecipients = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Recipient.countDocuments(query);
    const recipients = await Recipient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit) || 1;

    return sendSuccess(res, 200, 'Recipients retrieved successfully', {
      recipients,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error retrieving recipients');
  }
};

// @desc    Get single recipient by ID
// @route   GET /api/recipients/:id
// @access  Private
const getRecipientById = async (req, res) => {
  try {
    const recipient = await Recipient.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recipient) {
      return sendError(res, 404, 'Recipient not found');
    }

    return sendSuccess(res, 200, 'Recipient retrieved successfully', { recipient });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error fetching recipient');
  }
};

// @desc    Create new recipient
// @route   POST /api/recipients
// @access  Private
const createRecipient = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return sendError(res, 400, 'First name, last name, and email are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, 'Please provide a valid recipient email address.');
    }

    const existingRecipient = await Recipient.findOne({
      userId: req.user._id,
      email: email.toLowerCase(),
    });

    if (existingRecipient) {
      return sendError(res, 400, 'A recipient with this email address already exists in your list.');
    }

    const recipient = await Recipient.create({
      userId: req.user._id,
      firstName,
      lastName,
      email: email.toLowerCase(),
    });

    return sendSuccess(res, 201, 'Recipient added successfully', { recipient });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error creating recipient');
  }
};

// @desc    Update recipient
// @route   PATCH /api/recipients/:id
// @access  Private
const updateRecipient = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const recipient = await Recipient.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recipient) {
      return sendError(res, 404, 'Recipient not found');
    }

    if (email && email.toLowerCase() !== recipient.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendError(res, 400, 'Please provide a valid recipient email address.');
      }

      const duplicate = await Recipient.findOne({
        userId: req.user._id,
        email: email.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (duplicate) {
        return sendError(res, 400, 'Another recipient with this email already exists.');
      }
      recipient.email = email.toLowerCase();
    }

    if (firstName) recipient.firstName = firstName;
    if (lastName) recipient.lastName = lastName;

    await recipient.save();

    return sendSuccess(res, 200, 'Recipient updated successfully', { recipient });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error updating recipient');
  }
};

// @desc    Delete recipient
// @route   DELETE /api/recipients/:id
// @access  Private
const deleteRecipient = async (req, res) => {
  try {
    const recipient = await Recipient.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recipient) {
      return sendError(res, 404, 'Recipient not found');
    }

    // Remove campaign recipient mappings for this recipient
    const CampaignRecipient = require('../models/CampaignRecipient');
    await CampaignRecipient.deleteMany({ recipientId: recipient._id });

    return sendSuccess(res, 200, 'Recipient deleted successfully', { _id: recipient._id });
  } catch (error) {
    return sendError(res, 500, error.message || 'Error deleting recipient');
  }
};

module.exports = {
  getRecipients,
  getRecipientById,
  createRecipient,
  updateRecipient,
  deleteRecipient,
};
