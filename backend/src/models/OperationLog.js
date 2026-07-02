const mongoose = require('mongoose');

const operationLogSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    operatorName: { type: String, required: true, trim: true },
    module: {
      type: String,
      required: true,
      enum: ['auth', 'user', 'role', 'menu', 'config'],
    },
    action: {
      type: String,
      required: true,
      enum: ['login', 'create', 'update', 'delete'],
    },
    targetId: { type: String, default: '' },
    targetName: { type: String, default: '', trim: true },
    method: { type: String, default: '', trim: true },
    path: { type: String, default: '', trim: true },
    ip: { type: String, default: '', trim: true },
    status: { type: String, required: true, enum: ['success', 'fail'] },
    detail: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('OperationLog', operationLogSchema);
