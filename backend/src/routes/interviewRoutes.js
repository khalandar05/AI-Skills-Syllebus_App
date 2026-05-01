const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

router.post('/start', interviewController.startInterview);
router.post('/answer', interviewController.submitAnswer);
router.post('/complete', interviewController.completeInterview);
router.post('/explain', interviewController.explainQuestion);

module.exports = router;
