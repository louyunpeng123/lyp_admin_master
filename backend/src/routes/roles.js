const express = require('express');
const Role = require('../models/Role');
const { auth, checkPermission } = require('../middleware/auth');
const { success, fail } = require('../utils/response');
const { ALL_PERMISSIONS } = require('../utils/seed');

const router = express.Router();

function formatRole(role) {
  return {
    id: role._id,
    name: role.name,
    code: role.code,
    description: role.description,
    permissions: role.permissions,
    isSystem: role.isSystem,
    createdAt: role.createdAt,
  };
}

router.get('/permissions', auth, checkPermission('role:read'), (_req, res) => {
  success(res, ALL_PERMISSIONS);
});

router.get('/', auth, checkPermission('role:read'), async (_req, res) => {
  const roles = await Role.find().sort({ createdAt: 1 });
  success(res, roles.map(formatRole));
});

router.post('/', auth, checkPermission('role:write'), async (req, res) => {
  const { name, code, description, permissions } = req.body;
  if (!name || !code) {
    return fail(res, '角色名称和编码不能为空');
  }

  const exists = await Role.findOne({ $or: [{ name }, { code }] });
  if (exists) {
    return fail(res, '角色名称或编码已存在');
  }

  const role = await Role.create({ name, code, description, permissions: permissions || [] });
  success(res, formatRole(role), '角色创建成功');
});

router.put('/:id', auth, checkPermission('role:write'), async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return fail(res, '角色不存在', 404, 404);
  }

  const { name, description, permissions } = req.body;
  if (name) role.name = name;
  if (description !== undefined) role.description = description;
  if (permissions) role.permissions = permissions;

  await role.save();
  success(res, formatRole(role), '角色更新成功');
});

router.delete('/:id', auth, checkPermission('role:write'), async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return fail(res, '角色不存在', 404, 404);
  }
  if (role.isSystem) {
    return fail(res, '系统内置角色不可删除');
  }

  await role.deleteOne();
  success(res, null, '角色已删除');
});

module.exports = router;
