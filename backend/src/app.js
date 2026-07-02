require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { seed } = require('./utils/seed');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const menuRoutes = require('./routes/menus');
const configRoutes = require('./routes/config');
const dashboardRoutes = require('./routes/dashboard');
const logRoutes = require('./routes/logs');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/test', (_req, res) => {
  res.json({ message: 'API 运行正常' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/config', configRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', logRoutes);

async function start() {
  try {
    await connectDB();
    await seed();
  } catch (err) {
    console.error('启动失败:', err.message);
    process.exit(1);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start();
