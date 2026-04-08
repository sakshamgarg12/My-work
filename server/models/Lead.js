const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lead = sequelize.define(
  'Lead',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty',
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
          msg: 'Invalid phone format',
        },
      },
    },
    source: {
      type: DataTypes.ENUM('website', 'referral', 'email', 'advertisement', 'social_media', 'other'),
      allowNull: false,
      defaultValue: 'website',
      validate: {
        isIn: {
          args: [['website', 'referral', 'email', 'advertisement', 'social_media', 'other']],
          msg: 'Source must be one of: website, referral, email, advertisement, social_media, other',
        },
      },
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'converted', 'lost'),
      allowNull: false,
      defaultValue: 'new',
      validate: {
        isIn: {
          args: [['new', 'contacted', 'qualified', 'converted', 'lost']],
          msg: 'Status must be one of: new, contacted, qualified, converted, lost',
        },
      },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Assigned to must be between 2 and 100 characters',
        },
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'Notes cannot exceed 2000 characters',
        },
      },
    },
  },
  {
    timestamps: true,
    tableName: 'leads',
  }
);

// Define association with Company
Lead.associate = function(models) {
  Lead.belongsTo(models.Company, {
    foreignKey: 'companyId',
    as: 'company',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  });
};

module.exports = Lead;
