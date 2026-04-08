const Joi = require('joi');

// Create company validation schema
const createCompanySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Company name is required',
      'string.min': 'Company name must be at least 2 characters',
      'string.max': 'Company name cannot exceed 100 characters',
      'any.required': 'Company name is required',
    }),
  industry: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Industry cannot exceed 50 characters',
    }),
  email: Joi.string()
    .email()
    .optional()
    .allow(null, '')
    .messages({
      'string.email': 'Email must be a valid email address',
    }),
  phone: Joi.string().max(40).optional().allow(null, ''),
  website: Joi.string().max(500).optional().allow(null, ''),
  address: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Address cannot exceed 255 characters',
    }),
  city: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'City cannot exceed 50 characters',
    }),
  state: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'State cannot exceed 50 characters',
    }),
  zipCode: Joi.string()
    .max(20)
    .optional()
    .messages({
      'string.max': 'Zip code cannot exceed 20 characters',
    }),
  country: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Country cannot exceed 50 characters',
    }),
  description: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters',
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'prospect')
    .optional()
    .default('prospect')
    .messages({
      'any.only': 'Status must be one of: active, inactive, prospect',
    }),
});

// Update company validation schema (all fields optional)
const updateCompanySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Company name must be at least 2 characters',
      'string.max': 'Company name cannot exceed 100 characters',
    }),
  industry: Joi.string()
    .max(50)
    .optional(),
  email: Joi.string()
    .email()
    .optional()
    .allow(null, '')
    .messages({
      'string.email': 'Email must be a valid email address',
    }),
  phone: Joi.string().max(40).optional().allow(null, ''),
  website: Joi.string().max(500).optional().allow(null, ''),
  address: Joi.string()
    .max(255)
    .optional(),
  city: Joi.string()
    .max(50)
    .optional(),
  state: Joi.string()
    .max(50)
    .optional(),
  zipCode: Joi.string()
    .max(20)
    .optional(),
  country: Joi.string()
    .max(50)
    .optional(),
  description: Joi.string()
    .max(1000)
    .optional(),
  status: Joi.string()
    .valid('active', 'inactive', 'prospect')
    .optional()
    .messages({
      'any.only': 'Status must be one of: active, inactive, prospect',
    }),
});

module.exports = {
  createCompanySchema,
  updateCompanySchema,
};
