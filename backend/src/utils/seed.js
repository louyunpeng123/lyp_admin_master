const Role = require('../models/Role');
const Menu = require('../models/Menu');
const Config = require('../models/Config');
const User = require('../models/User');

const ALL_PERMISSIONS = [
  'dashboard:view',
  'user:read',
  'user:write',
  'role:read',
  'role:write',
  'menu:read',
  'menu:write',
  'settings:read',
  'settings:write',
  'log:read',
];

const DEFAULT_MENUS = [
  {
    title: '仪表盘',
    path: '/dashboard',
    name: 'Dashboard',
    component: 'dashboard/index.vue',
    icon: 'DataAnalysis',
    sort: 1,
    permission: 'dashboard:view',
  },
  {
    title: '用户管理',
    path: '/users',
    name: 'Users',
    component: 'user/index.vue',
    icon: 'User',
    sort: 2,
    permission: 'user:read',
  },
  {
    title: '角色管理',
    path: '/roles',
    name: 'Roles',
    component: 'role/index.vue',
    icon: 'UserFilled',
    sort: 3,
    permission: 'role:read',
  },
  {
    title: '菜单管理',
    path: '/menus',
    name: 'Menus',
    component: 'menu/index.vue',
    icon: 'Menu',
    sort: 4,
    permission: 'menu:read',
  },
  {
    title: '系统设置',
    path: '/settings',
    name: 'Settings',
    component: 'settings/index.vue',
    icon: 'Setting',
    sort: 5,
    permission: 'settings:read',
  },
  {
    title: '操作日志',
    path: '/logs',
    name: 'Logs',
    component: 'log/index.vue',
    icon: 'Document',
    sort: 6,
    permission: 'log:read',
  },
  {
    title: '个人中心',
    path: '/profile',
    name: 'Profile',
    component: 'profile/index.vue',
    icon: 'Avatar',
    sort: 99,
    hidden: true,
    permission: '',
  },
];

const DEFAULT_CONFIG = {
  siteName: '后台管理系统',
  adminEmail: 'admin@example.com',
  enableNotify: true,
  allowRegister: true,
};

async function seed() {
  let adminRole = await Role.findOne({ code: 'admin' });
  if (!adminRole) {
    adminRole = await Role.create({
      name: '超级管理员',
      code: 'admin',
      description: '拥有全部权限',
      permissions: ALL_PERMISSIONS,
      isSystem: true,
    });
  } else {
    const merged = [...new Set([...adminRole.permissions, ...ALL_PERMISSIONS])];
    if (merged.length !== adminRole.permissions.length) {
      adminRole.permissions = merged;
      await adminRole.save();
    }
  }

  if (!(await Role.findOne({ code: 'editor' }))) {
    await Role.create({
      name: '编辑',
      code: 'editor',
      description: '可查看仪表盘和管理用户',
      permissions: ['dashboard:view', 'user:read'],
      isSystem: true,
    });
  }

  if (!(await Role.findOne({ code: 'viewer' }))) {
    await Role.create({
      name: '访客',
      code: 'viewer',
      description: '仅可查看仪表盘',
      permissions: ['dashboard:view'],
      isSystem: true,
    });
  }

  for (const menu of DEFAULT_MENUS) {
    await Menu.findOneAndUpdate({ name: menu.name }, menu, { upsert: true, returnDocument: 'after' });
  }

  for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
    await Config.findOneAndUpdate({ key }, { value }, { upsert: true, returnDocument: 'after' });
  }

  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      nickname: '管理员',
      role: adminRole._id,
    });
    console.log('默认管理员已创建: admin / admin123');
  }
}

module.exports = { seed, ALL_PERMISSIONS };
