const Joi = require('joi');

// Create lead validation schema
const createLeadSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Lead name is required',
      'string.min': 'Lead name must be at least 2 characters',
      'string.max': 'Lead name cannot exceed 100 characters',
      'any.required': 'Lead name is required',
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
  source: Joi.string()
    .valid('website', 'referral', 'email', 'advertisement', 'social_media', 'other')
    .optional()
    .default('website')
    .messages({
      'any.only': 'Source must be one of: website, referral, email, advertisement, social_media, other',
    }),
  status: Joi.string()
    .valid('new', 'contacted', 'qualified', 'converted', 'lost')
    .optional()
    .default('new')
    .messages({
      'any.only': 'Status must be one of: new, contacted, qualified, converted, lost',
    }),
  companyId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Company ID must be a number',
      'number.positive': 'Company ID must be a positive number',
    }),
  assignedTo: Joi.string().max(100).optional().allow(null, ''),
  notes: Joi.string()
    .max(2000)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 2000 characters',
    }),
});

// Update lead validation schema (all fields optional)
const updateLeadSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Lead name must be at least 2 characters',
      'string.max': 'Lead name cannot exceed 100 characters',
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Email must be a valid email address',
    }),
  phone: Joi.string().max(40).optional().allow(null, ''),
  source: Joi.string()
    .valid('website', 'referral', 'email', 'advertisement', 'social_media', 'other')
    .optional()
    .messages({
      'any.only': 'Source must be one of: website, referral, email, advertisement, social_media, other',
    }),
  status: Joi.string()
    .valid('new', 'contacted', 'qualified', 'converted', 'lost')
    .optional()
    .messages({
      'any.only': 'Status must be one of: new, contacted, qualified, converted, lost',
    }),
  companyId: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Company ID must be a number',
      'number.positive': 'Company ID must be a positive number',
    }),
  assignedTo: Joi.string().max(100).optional().allow(null, ''),
  notes: Joi.string()
    .max(2000)
    .optional()
    .allow(null, ''),
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
};
