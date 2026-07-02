const mongoose = require('mongoose');

const DB_NAME = process.env.MONGO_DB_NAME || 'lyp_admin';
const CONNECT_OPTIONS = {
  dbName: DB_NAME,
  serverSelectionTimeoutMS: 18000, // 18秒，国内网络握手足够
  socketTimeoutMS: 60000,
  connectTimeoutMS: 15000,
  maxPoolSize: 10
};

let memoryServer = null;

function hasExplicitUri() {
  return Boolean(process.env.MONGO_URI?.trim());
}

async function connectMemoryDB() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri(), { dbName: DB_NAME });
  console.warn('已回退到内存 MongoDB（开发模式，重启后数据丢失）');
}

async function connectDB() {
  if (hasExplicitUri()) {
    const uri = process.env.MONGO_URI.trim();
    const options = { ...CONNECT_OPTIONS };

    // mongodb+srv 在部分网络下 DNS 解析不稳定，可强制走 IPv4
    if (uri.startsWith('mongodb+srv://')) {
      options.family = 4;
    }

    try {
      await mongoose.connect(uri, options);
      console.log(`MongoDB 已连接 (database: ${DB_NAME})`);
      return;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`MongoDB 连接失败: ${err.message}`);
      }
      console.warn(`MONGO_URI 连接失败 (${err.message})，尝试内存数据库…`);
    }
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('生产环境必须配置 MONGO_URI');
  } else {
    console.warn('未配置 MONGO_URI，使用内存 MongoDB（开发模式）');
  }

  await connectMemoryDB();
}

module.exports = connectDB;
