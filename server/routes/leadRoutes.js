const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validation');
const { createLeadSchema, updateLeadSchema } = require('../middleware/leadValidation');
const {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadsByStatus,
  getLeadsBySource,
  getLeadStats,
  searchLeads,
  updateLeadStatus,
  bulkUpdateLeadStatus,
  convertLeadToContact,
} = require('../controllers/leadController');

// Apply auth middleware to all lead routes
router.use(authMiddleware);

// Search leads by name or email
router.get('/search/query', searchLeads);

// Get lead statistics
router.get('/stats', getLeadStats);

// Get leads by status
router.get('/status/:status', getLeadsByStatus);

// Get leads by source
router.get('/source/:source', getLeadsBySource);

// Get all leads
router.get('/', getAllLeads);

// Get lead by ID
router.get('/:id', getLeadById);

// Convert lead to contact
router.post('/:id/convert', convertLeadToContact);

// Update lead status (dedicated endpoint)
router.patch('/:id/status', updateLeadStatus);

// Bulk update lead status
router.patch('/bulk/status', bulkUpdateLeadStatus);

// Create lead with validation
router.post('/', validateRequest(createLeadSchema), createLead);

// Update lead with validation
router.put('/:id', validateRequest(updateLeadSchema), updateLead);

// Delete lead
router.delete('/:id', deleteLead);

module.exports = router;
