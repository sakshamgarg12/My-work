const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validation');
const { createCompanySchema, updateCompanySchema } = require('../middleware/companyValidation');
const {
  getDistinctIndustries,
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompaniesByStatus,
  getCompaniesByIndustry,
  getCompanyStats,
} = require('../controllers/companyController');

// Apply auth middleware to all company routes
router.use(authMiddleware);

// Get company statistics
router.get('/stats', getCompanyStats);

// Distinct industry values (list filters)
router.get('/industries', getDistinctIndustries);

// Get companies by status
router.get('/status/:status', getCompaniesByStatus);

// Get companies by industry
router.get('/industry/:industry', getCompaniesByIndustry);

// Get all companies
router.get('/', getAllCompanies);

// Get company by ID
router.get('/:id', getCompanyById);

// Create company with validation
router.post('/', validateRequest(createCompanySchema), createCompany);

// Update company with validation
router.put('/:id', validateRequest(updateCompanySchema), updateCompany);

// Delete company
router.delete('/:id', deleteCompany);

module.exports = router;
