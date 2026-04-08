const Company = require('./Company');
const Contact = require('./Contact');
const Customer = require('./Customer');
const User = require('./User');
const Lead = require('./Lead');

// Initialize associations
const models = {
  Company,
  Contact,
  Customer,
  User,
  Lead,
};

// Call associate methods on all models
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export all models
module.exports = {
  Company,
  Contact,
  Customer,
  User,
  Lead,
  models,
};
