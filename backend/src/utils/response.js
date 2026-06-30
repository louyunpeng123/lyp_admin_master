function success(res, data = null, message = 'ok') {
  res.json({ code: 0, message, data });
}

function fail(res, message = '请求失败', code = 400, status = 400) {
  res.status(status).json({ code, message, data: null });
}

module.exports = { success, fail };
