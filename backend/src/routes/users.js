const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const { auth, checkPermission } = require('../middleware/auth');
const { success, fail } = require('../utils/response');

const router = express.Router();

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
      ? { id: user.role._id, name: user.role.name, code: user.role.code }
      : null,
    createdAt: user.createdAt,
  };
}

router.get('/', auth, checkPermission('user:read'), async (req, res) => {
  const { keyword = '', page = 1, pageSize = 10 } = req.query;
  const filter = keyword
    ? {
        $or: [
          { username: new RegExp(keyword, 'i') },
          { email: new RegExp(keyword, 'i') },
          { nickname: new RegExp(keyword, 'i') },
        ],
      }
    : {};

  const skip = (Number(page) - 1) * Number(pageSize);
  const [list, total] = await Promise.all([
    User.find(filter).populate('role').sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)),
    User.countDocuments(filter),
  ]);

  success(res, {
    list: list.map(formatUser),
    total,
    page: Number(page),
    pageSize: Number(pageSize),
  });
});

router.post('/', auth, checkPermission('user:write'), async (req, res) => {
  const { username, email, password, nickname, roleId, status } = req.body;
  if (!username || !email || !password || !roleId) {
    return fail(res, '请填写完整信息');
  }

  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) {
    return fail(res, '用户名或邮箱已存在');
  }

  const role = await Role.findById(roleId);
  if (!role) {
    return fail(res, '角色不存在');
  }

  const user = await User.create({
    username,
    email,
    password,
    nickname: nickname || username,
    role: roleId,
    status: status || 'active',
  });
  await user.populate('role');
  success(res, formatUser(user), '用户创建成功');
});

router.put('/:id', auth, checkPermission('user:write'), async (req, res) => {
  const { nickname, email, roleId, status, password } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return fail(res, '用户不存在', 404, 404);
  }

  if (email && email !== user.email) {
    const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailTaken) {
      return fail(res, '邮箱已被使用');
    }
    user.email = email;
  }

  if (nickname !== undefined) user.nickname = nickname;
  if (roleId) user.role = roleId;
  if (status) user.status = status;
  if (password) user.password = password;

  await user.save();
  await user.populate('role');
  success(res, formatUser(user), '用户更新成功');
});

router.delete('/:id', auth, checkPermission('user:write'), async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return fail(res, '不能删除当前登录用户');
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return fail(res, '用户不存在', 404, 404);
  }
  success(res, null, '用户已删除');
});

router.patch('/:id/status', auth, checkPermission('user:write'), async (req, res) => {
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status)) {
    return fail(res, '无效的状态值');
  }
  if (req.params.id === String(req.user._id)) {
    return fail(res, '不能禁用当前登录用户');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('role');
  if (!user) {
    return fail(res, '用户不存在', 404, 404);
  }
  success(res, formatUser(user), status === 'active' ? '已启用' : '已禁用');
});

module.exports = router;
