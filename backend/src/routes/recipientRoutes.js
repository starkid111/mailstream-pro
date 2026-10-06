const express = require('express');
const router = express.Router();
const {
  getRecipients,
  getRecipientById,
  createRecipient,
  updateRecipient,
  deleteRecipient,
} = require('../controllers/recipientController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getRecipients)
  .post(createRecipient);

router.route('/:id')
  .get(getRecipientById)
  .patch(updateRecipient)
  .delete(deleteRecipient);

module.exports = router;
