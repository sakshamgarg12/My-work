const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const companyRoutes = require('./companyRoutes');
const contactRoutes = require('./contactRoutes');
const leadRoutes = require('./leadRoutes');

router.use('/auth', authRoutes);

// Mount routes
router.use('/customers', customerRoutes);
router.use('/companies', companyRoutes);
router.use('/contacts', contactRoutes);
router.use('/leads', leadRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'API is running' });
});

module.exports = router;
