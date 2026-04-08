const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: String,
    company: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'lead'],
      default: 'lead',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Customer', customerSchema);
