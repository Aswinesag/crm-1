const express = require('express');
const { protect } = require('../middleware/auth');
const { getLogs , markAllLogsAsRead } = require('../controllers/logController');
const router = express.Router();

router.use(protect);
router.get('/', getLogs);
router.put('/mark-all-read', markAllLogsAsRead);

module.exports = router;
