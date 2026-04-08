const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'crm_app';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '123456789';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT) || 3306;

// Dev convenience: always keep one known login in users table.
const seedUserEmail = process.env.SEED_USER_EMAIL || 'admin@catalyst.local';
const seedUserPassword = process.env.SEED_USER_PASSWORD || 'Admin@123';
const seedUserName = process.env.SEED_USER_NAME || 'Catalyst Admin';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/** Ensure schema exists (MySQL returns ER_BAD_DB_ERROR if database was never created). */
async function ensureDatabaseExists() {
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error(`Invalid DB_NAME "${dbName}" (use letters, numbers, underscores only)`);
  }
  const conn = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
  });
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database "${dbName}" ready`);
  } finally {
    await conn.end();
  }
}

async function ensureSeedUser() {
  const User = require('../models/User');
  const email = String(seedUserEmail).toLowerCase().trim();
  const existing = await User.findOne({ where: { email } });

  if (!existing) {
    await User.create({
      name: seedUserName,
      email,
      password: seedUserPassword,
      role: 'admin',
    });
    console.log(`✅ Seed user created: ${email}`);
    return;
  }

  // Keep credentials deterministic for local login.
  existing.name = seedUserName;
  existing.password = seedUserPassword;
  existing.role = 'admin';
  await existing.save();
  console.log(`✅ Seed user password refreshed: ${email}`);
}

const connectDB = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log('✅ MySQL Database Connected Successfully');

    // Create/update tables when not in production. (NODE_ENV is often unset locally — still sync.)
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      await sequelize.sync({ alter: process.env.DB_FORCE_SYNC === 'true' });
      console.log('✅ Database tables synchronized (non-production)');
      await ensureSeedUser();
    }
    
    return sequelize;
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

