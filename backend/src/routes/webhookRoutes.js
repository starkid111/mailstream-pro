const express = require('express');
const router = express.Router();
const { handleEmailWebhook, simulateDeliveryWebhook } = require('../controllers/webhookController');

router.post('/email', handleEmailWebhook);
router.post('/simulate', simulateDeliveryWebhook);

module.exports = router;
