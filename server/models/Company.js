const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define(
  'Company',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'prospect'),
      defaultValue: 'prospect',
    },
  },
  {
    timestamps: true,
    tableName: 'companies',
  }
);

// Define reverse associations with Contact and Lead
// This will be set up in the associations file to avoid circular dependencies
Company.associate = function(models) {
  Company.hasMany(models.Contact, {
    foreignKey: 'companyId',
    as: 'contacts',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
  
  Company.hasMany(models.Lead, {
    foreignKey: 'companyId',
    as: 'leads',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  });
};

module.exports = Company;
