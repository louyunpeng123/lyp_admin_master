const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    path: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    component: { type: String, default: '' },
    icon: { type: String, default: 'Menu' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', default: null },
    sort: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
    permission: { type: String, default: '' },
    type: { type: String, enum: ['menu', 'button'], default: 'menu' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
