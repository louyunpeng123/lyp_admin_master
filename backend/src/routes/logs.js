const express = require('express');
const OperationLog = require('../models/OperationLog');
const { auth, checkPermission } = require('../middleware/auth');
const { success } = require('../utils/response');

const router = express.Router();

function formatLog(log) {
  return {
    id: log._id,
    operatorId: log.operatorId,
    operatorName: log.operatorName,
    module: log.module,
    action: log.action,
    targetId: log.targetId,
    targetName: log.targetName,
    method: log.method,
    path: log.path,
    ip: log.ip,
    status: log.status,
    detail: log.detail,
    createdAt: log.createdAt,
  };
}

router.get('/', auth, checkPermission('log:read'), async (req, res) => {
  const {
    keyword = '',
    module,
    action,
    status,
    startDate,
    endDate,
    page = 1,
    pageSize = 10,
  } = req.query;

  const filter = {};
  if (module) filter.module = module;
  if (action) filter.action = action;
  if (status) filter.status = status;
  if (keyword) {
    filter.$or = [
      { operatorName: new RegExp(keyword, 'i') },
      { targetName: new RegExp(keyword, 'i') },
      { path: new RegExp(keyword, 'i') },
    ];
  }
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const skip = (Number(page) - 1) * Number(pageSize);
  const [list, total] = await Promise.all([
    OperationLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)),
    OperationLog.countDocuments(filter),
  ]);

  success(res, {
    list: list.map(formatLog),
    total,
    page: Number(page),
    pageSize: Number(pageSize),
  });
});

module.exports = router;
