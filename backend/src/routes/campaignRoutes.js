const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  getCampaignRecipients,
  getDashboardSummary,
} = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard/summary', getDashboardSummary);

router.route('/')
  .get(getCampaigns)
  .post(createCampaign);

router.route('/:id')
  .get(getCampaignById)
  .patch(updateCampaign)
  .delete(deleteCampaign);

router.post('/:id/send', sendCampaign);
router.get('/:id/recipients', getCampaignRecipients);

module.exports = router;
