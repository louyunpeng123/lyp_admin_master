const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
// mongoose.connect(process.env.MONGO_URI)
// .then(() => { console.log('MongoDB已连接'); })
// .catch((err) => { console.log('MongoDB连接失败', err); });

// 测试接口
app.get('/api/test', (req, res) => {
    res.json({ message: 'API测试成功111' });
});

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});