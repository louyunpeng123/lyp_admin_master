const express = require('express');
const Menu = require('../models/Menu');
const { auth, checkPermission } = require('../middleware/auth');
const { success, fail } = require('../utils/response');

const router = express.Router();

function formatMenu(menu) {
  return {
    id: menu._id,
    title: menu.title,
    path: menu.path,
    name: menu.name,
    component: menu.component,
    icon: menu.icon,
    parentId: menu.parentId,
    sort: menu.sort,
    hidden: menu.hidden,
    permission: menu.permission,
    type: menu.type,
    createdAt: menu.createdAt,
  };
}

function hasMenuPermission(user, menu) {
  if (!menu.permission) return true;
  if (user.role?.code === 'admin') return true;
  return user.role?.permissions?.includes(menu.permission);
}

function buildTree(menus, parentId = null) {
  return menus
    .filter((m) => String(m.parentId || null) === String(parentId))
    .sort((a, b) => a.sort - b.sort)
    .map((m) => ({
      ...formatMenu(m),
      children: buildTree(menus, m._id),
    }));
}

router.get('/user', auth, async (req, res) => {
  const menus = await Menu.find({ hidden: false, type: 'menu' }).sort({ sort: 1 });
  const allowed = menus.filter((menu) => hasMenuPermission(req.user, menu));
  success(res, buildTree(allowed));
});

router.get('/routes', auth, async (req, res) => {
  const menus = await Menu.find({ type: 'menu' }).sort({ sort: 1 });
  const allowed = menus.filter((menu) => hasMenuPermission(req.user, menu));
  success(res, allowed.map(formatMenu));
});

router.get('/', auth, checkPermission('menu:read'), async (_req, res) => {
  const menus = await Menu.find().sort({ sort: 1 });
  success(res, buildTree(menus));
});

router.post('/', auth, checkPermission('menu:write'), async (req, res) => {
  const { title, path, name, component, icon, parentId, sort, hidden, permission, type } = req.body;
  if (!title || !path || !name) {
    return fail(res, '标题、路径和路由名称不能为空');
  }

  const exists = await Menu.findOne({ $or: [{ path }, { name }] });
  if (exists) {
    return fail(res, '路径或路由名称已存在');
  }

  const menu = await Menu.create({
    title,
    path,
    name,
    component: component || '',
    icon: icon || 'Menu',
    parentId: parentId || null,
    sort: sort ?? 0,
    hidden: hidden ?? false,
    permission: permission || '',
    type: type || 'menu',
  });
  success(res, formatMenu(menu), '菜单创建成功');
});

router.put('/:id', auth, checkPermission('menu:write'), async (req, res) => {
  const menu = await Menu.findById(req.params.id);
  if (!menu) {
    return fail(res, '菜单不存在', 404, 404);
  }

  const fields = ['title', 'path', 'name', 'component', 'icon', 'parentId', 'sort', 'hidden', 'permission', 'type'];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      menu[field] = req.body[field];
    }
  }

  await menu.save();
  success(res, formatMenu(menu), '菜单更新成功');
});

router.delete('/:id', auth, checkPermission('menu:write'), async (req, res) => {
  const childCount = await Menu.countDocuments({ parentId: req.params.id });
  if (childCount > 0) {
    return fail(res, '请先删除子菜单');
  }

  const menu = await Menu.findByIdAndDelete(req.params.id);
  if (!menu) {
    return fail(res, '菜单不存在', 404, 404);
  }
  success(res, null, '菜单已删除');
});

module.exports = router;
