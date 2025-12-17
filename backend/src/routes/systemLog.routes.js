const express = require('express');
const router = express.Router();
const SystemLogController = require('../controllers/systemLog.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

router.get('/', [authenticateToken, requireAdmin], SystemLogController.getRecent);

module.exports = router;
