const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const Menu = require('../models/Menu');
const { auth, checkPermission } = require('../middleware/auth');
const { success } = require('../utils/response');

const router = express.Router();

router.get('/stats', auth, checkPermission('dashboard:view'), async (_req, res) => {
  const [userCount, roleCount, menuCount, activeUsers] = await Promise.all([
    User.countDocuments(),
    Role.countDocuments(),
    Menu.countDocuments({ type: 'menu', hidden: false }),
    User.countDocuments({ status: 'active' }),
  ]);

  success(res, {
    userCount,
    roleCount,
    menuCount,
    activeUsers,
    todayVisits: Math.floor(Math.random() * 200) + 50,
  });
});

module.exports = router;
