// routes/reports.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/preview', protect, restrictTo('Super Admin', 'Admin'), reportController.getReportPreview);
router.post('/download/pdf', protect, restrictTo('Super Admin', 'Admin'), reportController.generatePDFReport);
router.post('/download/excel', protect, restrictTo('Super Admin', 'Admin'), reportController.generateExcelReport);

module.exports = router;
