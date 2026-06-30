const express = require('express');
const Config = require('../models/Config');
const { auth, checkPermission } = require('../middleware/auth');
const { success } = require('../utils/response');

const router = express.Router();

const PUBLIC_KEYS = ['allowRegister'];

async function getSettingsMap() {
  const configs = await Config.find();
  const map = {};
  for (const item of configs) {
    map[item.key] = item.value;
  }
  return map;
}

router.get('/public', async (_req, res) => {
  const configs = await Config.find({ key: { $in: PUBLIC_KEYS } });
  const data = {};
  for (const item of configs) {
    data[item.key] = item.value;
  }
  success(res, data);
});

router.get('/', auth, checkPermission('settings:read'), async (_req, res) => {
  success(res, await getSettingsMap());
});

router.put('/', auth, checkPermission('settings:write'), async (req, res) => {
  const allowed = ['siteName', 'adminEmail', 'enableNotify', 'allowRegister'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      await Config.findOneAndUpdate({ key }, { value: req.body[key] }, { upsert: true });
    }
  }
  success(res, await getSettingsMap(), '设置已保存');
});

module.exports = router;
