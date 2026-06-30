const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { fail } = require('../utils/response');

async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return fail(res, '未登录或登录已过期', 401, 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(payload.userId).populate('role');
    if (!user || user.status !== 'active') {
      return fail(res, '账号不存在或已被禁用', 401, 401);
    }
    req.user = user;
    next();
  } catch {
    return fail(res, '未登录或登录已过期', 401, 401);
  }
}

function checkPermission(...required) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return fail(res, '无权限访问', 403, 403);
    }
    if (role.code === 'admin') {
      return next();
    }
    const hasPermission = required.some((p) => role.permissions.includes(p));
    if (!hasPermission) {
      return fail(res, '无权限访问', 403, 403);
    }
    next();
  };
}

module.exports = { auth, checkPermission };
