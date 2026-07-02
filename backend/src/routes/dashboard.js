const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const Menu = require('../models/Menu');
const OperationLog = require('../models/OperationLog');
const { auth, checkPermission } = require('../middleware/auth');
const { success } = require('../utils/response');

const router = express.Router();

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatRecentLog(log) {
  return {
    id: log._id,
    operatorName: log.operatorName,
    module: log.module,
    action: log.action,
    targetName: log.targetName,
    status: log.status,
    createdAt: log.createdAt,
  };
}

router.get('/stats', auth, checkPermission('dashboard:view'), async (_req, res) => {
  const today = startOfToday();

  const [
    userCount,
    roleCount,
    menuCount,
    activeUsers,
    operationLogCount,
    todayOperations,
    todayLoginFails,
    recentLogs,
  ] = await Promise.all([
    User.countDocuments(),
    Role.countDocuments(),
    Menu.countDocuments({ type: 'menu', hidden: false }),
    User.countDocuments({ status: 'active' }),
    OperationLog.countDocuments(),
    OperationLog.countDocuments({ createdAt: { $gte: today } }),
    OperationLog.countDocuments({
      module: 'auth',
      action: 'login',
      status: 'fail',
      createdAt: { $gte: today },
    }),
    OperationLog.find().sort({ createdAt: -1 }).limit(5),
  ]);

  success(res, {
    userCount,
    roleCount,
    menuCount,
    activeUsers,
    operationLogCount,
    todayOperations,
    todayLoginFails,
    recentLogs: recentLogs.map(formatRecentLog),
  });
});

module.exports = router;
