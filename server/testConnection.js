require('dotenv').config();
const { sequelize } = require('./config/database');

const testDatabaseConnection = async () => {
  console.log('\n🔄 Testing Database Connection...\n');
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log('-----------------------------------\n');

  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ SUCCESS: MySQL Database Connected Successfully!');
    console.log('✅ Connection is working properly.\n');

    // Get connection info
    const queryInterface = sequelize.getQueryInterface();
    console.log('📊 Connection Details:');
    console.log(`   - Dialect: MySQL`);
    console.log(`   - Pool Size: 5 connections`);
    console.log(`   - Idle Timeout: 10 seconds\n`);

    // Close connection
    await sequelize.close();
    console.log('🔌 Connection closed successfully.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ FAILED: Unable to connect to MySQL Database');
    console.error(`\n❌ Error Message: ${error.message}\n`);

    console.error('🔍 Troubleshooting Tips:');
    console.error('   1. Ensure MySQL server is running');
    console.error('   2. Check database credentials in .env file:');
    console.error(`      - DB_HOST: ${process.env.DB_HOST}`);
    console.error(`      - DB_PORT: ${process.env.DB_PORT}`);
    console.error(`      - DB_USER: ${process.env.DB_USER}`);
    console.error(`      - DB_NAME: ${process.env.DB_NAME}`);
    console.error('   3. Verify MySQL is listening on the correct port');
    console.error('   4. Check network connectivity\n');

    process.exit(1);
  }
};

// Run test
testDatabaseConnection();
