const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validation');
const { createContactSchema, updateContactSchema } = require('../middleware/contactValidation');
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactsByCompany,
  searchContacts,
} = require('../controllers/contactController');

// Apply auth middleware to all contact routes
router.use(authMiddleware);

// Search contacts by firstName, lastName, or email
router.get('/search/query', searchContacts);

// Get all contacts
router.get('/', getAllContacts);

// Get contacts by company
router.get('/company/:companyId', getContactsByCompany);

// Get contact by ID
router.get('/:id', getContactById);

// Create contact with validation
router.post('/', validateRequest(createContactSchema), createContact);

// Update contact with validation
router.put('/:id', validateRequest(updateContactSchema), updateContact);

// Delete contact
router.delete('/:id', deleteContact);

module.exports = router;
