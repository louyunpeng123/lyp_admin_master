const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Config = require('../models/Config');
const { auth } = require('../middleware/auth');
const { success, fail } = require('../utils/response');
const { createLog } = require('../utils/auditLog');

const router = express.Router();

function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function formatUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    nickname: user.nickname || user.username,
    avatar: user.avatar,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    role: user.role
      ? {
          id: user.role._id,
          name: user.role.name,
          code: user.role.code,
          permissions: user.role.permissions,
        }
      : null,
  };
}

router.get('/register-config', async (_req, res) => {
  const config = await Config.findOne({ key: 'allowRegister' });
  success(res, { allowRegister: config?.value !== false });
});

router.post('/register', async (req, res) => {
  const allowConfig = await Config.findOne({ key: 'allowRegister' });
  if (allowConfig?.value === false) {
    return fail(res, '系统已关闭注册');
  }

  const { username, email, password, nickname } = req.body;
  if (!username || !email || !password) {
    return fail(res, '用户名、邮箱和密码不能为空');
  }
  if (password.length < 6) {
    return fail(res, '密码至少 6 位');
  }

  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) {
    return fail(res, '用户名或邮箱已存在');
  }

  const viewerRole = await Role.findOne({ code: 'viewer' });
  if (!viewerRole) {
    return fail(res, '系统未初始化，请联系管理员');
  }

  const user = await User.create({
    username,
    email,
    password,
    nickname: nickname || username,
    role: viewerRole._id,
  });

  await user.populate('role');
  const token = signToken(user._id);
  await createLog(req, {
    module: 'auth',
    action: 'create',
    operatorId: user._id,
    operatorName: user.username,
    targetId: user._id,
    targetName: user.username,
    detail: { after: formatUser(user) },
  });
  success(res, { token, user: formatUser(user) }, '注册成功');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return fail(res, '用户名和密码不能为空');
  }

  const user = await User.findOne({ username }).select('+password').populate('role');
  if (!user || !(await user.comparePassword(password))) {
    await createLog(req, {
      module: 'auth',
      action: 'login',
      operatorId: user?._id,
      operatorName: user?.username || username,
      targetName: username,
      status: 'fail',
      detail: user ? '密码错误' : '用户不存在',
    });
    return fail(res, '用户名或密码错误', 401, 401);
  }
  if (user.status !== 'active') {
    await createLog(req, {
      module: 'auth',
      action: 'login',
      operatorId: user._id,
      operatorName: user.username,
      targetId: user._id,
      targetName: user.username,
      status: 'fail',
      detail: '账号已被禁用',
    });
    return fail(res, '账号已被禁用', 403, 403);
  }

  user.lastLoginAt = new Date();
  user.lastLoginIp = req.ip || '';
  await user.save();

  const token = signToken(user._id);
  await createLog(req, {
    module: 'auth',
    action: 'login',
    operatorId: user._id,
    operatorName: user.username,
    targetId: user._id,
    targetName: user.username,
  });
  success(res, { token, user: formatUser(user) }, '登录成功');
});

router.get('/me', auth, async (req, res) => {
  success(res, formatUser(req.user));
});

router.put('/profile', auth, async (req, res) => {
  const { nickname, email, avatar } = req.body;
  const user = req.user;
  const before = { nickname: user.nickname, email: user.email, avatar: user.avatar };

  if (email && email !== user.email) {
    const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailTaken) {
      return fail(res, '邮箱已被使用');
    }
    user.email = email;
  }

  if (nickname !== undefined) user.nickname = nickname;
  if (avatar !== undefined) user.avatar = avatar;
  await user.save();
  await user.populate('role');
  await createLog(req, {
    module: 'auth',
    action: 'update',
    targetId: user._id,
    targetName: user.username,
    detail: {
      before,
      after: { nickname: user.nickname, email: user.email, avatar: user.avatar },
    },
  });
  success(res, formatUser(user), '资料已更新');
});

router.put('/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return fail(res, '请填写原密码和新密码');
  }
  if (newPassword.length < 6) {
    return fail(res, '新密码至少 6 位');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(oldPassword))) {
    return fail(res, '原密码错误');
  }

  user.password = newPassword;
  await user.save();
  await createLog(req, {
    module: 'auth',
    action: 'update',
    targetId: user._id,
    targetName: user.username,
    detail: '修改密码',
  });
  success(res, null, '密码修改成功');
});

module.exports = router;
