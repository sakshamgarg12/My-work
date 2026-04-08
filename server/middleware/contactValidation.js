const Joi = require('joi');

// Create contact validation schema
const createContactSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  phone: Joi.string().max(40).optional().allow(null, ''),
  jobTitle: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Job title cannot exceed 100 characters',
    }),
  companyId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Company ID must be a number',
      'number.positive': 'Company ID must be a positive number',
      'any.required': 'Company ID is required',
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'prospect')
    .optional()
    .default('prospect')
    .messages({
      'any.only': 'Status must be one of: active, inactive, prospect',
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
});

// Update contact validation schema (all fields optional except validation rules)
const updateContactSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Email must be a valid email address',
    }),
  phone: Joi.string().max(40).optional().allow(null, ''),
  jobTitle: Joi.string()
    .max(100)
    .optional(),
  companyId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Company ID must be a number',
      'number.positive': 'Company ID must be a positive number',
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'prospect')
    .optional()
    .messages({
      'any.only': 'Status must be one of: active, inactive, prospect',
    }),
  notes: Joi.string()
    .max(1000)
    .optional(),
});

module.exports = {
  createContactSchema,
  updateContactSchema,
};
