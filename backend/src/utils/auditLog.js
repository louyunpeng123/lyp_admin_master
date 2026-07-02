const OperationLog = require('../models/OperationLog');

/**
 * 写入操作日志。优先从 req.user 取操作人，登录等场景可在 payload 中传入 operatorId / operatorName。
 * @param {import('express').Request} req
 * @param {object} payload
 * @param {string} payload.module auth | user | role | menu | config
 * @param {string} payload.action login | create | update | delete
 * @param {string} [payload.status='success'] success | fail
 * @param {string} [payload.targetId]
 * @param {string} [payload.targetName]
 * @param {*} [payload.detail]
 * @param {import('mongoose').Types.ObjectId} [payload.operatorId]
 * @param {string} [payload.operatorName]
 */
async function createLog(req, payload) {
  const {
    module,
    action,
    status = 'success',
    targetId = '',
    targetName = '',
    detail = null,
    operatorId,
    operatorName,
  } = payload;

  const operator = req?.user;
  const log = {
    operatorId: operatorId ?? operator?._id,
    operatorName: operatorName ?? operator?.username ?? '',
    module,
    action,
    targetId: targetId ? String(targetId) : '',
    targetName,
    method: req?.method ?? '',
    path: req?.originalUrl ?? req?.url ?? '',
    ip: req?.ip ?? '',
    status,
    detail,
  };

  if (!log.operatorName || !module || !action) {
    return null;
  }

  try {
    return await OperationLog.create(log);
  } catch (err) {
    console.error('[auditLog] create failed:', err.message);
    return null;
  }
}

module.exports = { createLog };
