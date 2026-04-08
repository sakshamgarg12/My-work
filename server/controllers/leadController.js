const { Lead, Company, Contact } = require('../models');

// Get all leads
const getAllLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, source, companyId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (source) {
      whereClause.source = source;
    }

    if (companyId) {
      whereClause.companyId = parseInt(companyId);
    }

    const { count, rows } = await Lead.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry'],
        },
      ],
      distinct: true,
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get lead by ID
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry', 'email'],
        },
      ],
    });

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// Create lead
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, source, status, companyId, assignedTo, notes } = req.body;

    // Check if lead already exists
    const existingLead = await Lead.findOne({ where: { email } });
    if (existingLead) {
      return res.status(409).json({
        status: 'error',
        message: 'Lead with this email already exists',
      });
    }

    // Verify company exists if provided
    if (companyId) {
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(404).json({
          status: 'error',
          message: 'Company not found',
        });
      }
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      source,
      status,
      companyId,
      assignedTo,
      notes,
    });

    const leadWithCompany = await Lead.findByPk(lead.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry'],
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      message: 'Lead created successfully',
      data: leadWithCompany,
    });
  } catch (error) {
    next(error);
  }
};

// Update lead
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found',
      });
    }

    // Check if new email is already taken
    if (req.body.email && req.body.email !== lead.email) {
      const existingLead = await Lead.findOne({
        where: { email: req.body.email },
      });
      if (existingLead) {
        return res.status(409).json({
          status: 'error',
          message: 'Lead with this email already exists',
        });
      }
    }

    // If companyId is being updated, verify it exists
    if (req.body.companyId && req.body.companyId !== lead.companyId) {
      const company = await Company.findByPk(req.body.companyId);
      if (!company) {
        return res.status(404).json({
          status: 'error',
          message: 'Company not found',
        });
      }
    }

    const updatedLead = await lead.update(req.body);

    const leadWithCompany = await Lead.findByPk(updatedLead.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry'],
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      message: 'Lead updated successfully',
      data: leadWithCompany,
    });
  } catch (error) {
    next(error);
  }
};

// Delete lead
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found',
      });
    }

    await lead.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get leads by status
const getLeadsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: new, contacted, qualified, converted, lost',
      });
    }

    const { count, rows } = await Lead.findAndCountAll({
      where: { status },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name'],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get leads by source
const getLeadsBySource = async (req, res, next) => {
  try {
    const { source } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const validSources = ['website', 'referral', 'email', 'advertisement', 'social_media', 'other'];
    if (!validSources.includes(source)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid source. Must be one of: website, referral, email, advertisement, social_media, other',
      });
    }

    const { count, rows } = await Lead.findAndCountAll({
      where: { source },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name'],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get lead statistics
const getLeadStats = async (req, res, next) => {
  try {
    const totalLeads = await Lead.count();
    const newLeads = await Lead.count({ where: { status: 'new' } });
    const contactedLeads = await Lead.count({ where: { status: 'contacted' } });
    const qualifiedLeads = await Lead.count({ where: { status: 'qualified' } });
    const convertedLeads = await Lead.count({ where: { status: 'converted' } });
    const lostLeads = await Lead.count({ where: { status: 'lost' } });

    const sourceStats = await Lead.findAll({
      attributes: [
        'source',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['source'],
      raw: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        total: totalLeads,
        byStatus: {
          new: newLeads,
          contacted: contactedLeads,
          qualified: qualifiedLeads,
          converted: convertedLeads,
          lost: lostLeads,
        },
        bySource: sourceStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Search leads by name or email
const searchLeads = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required',
      });
    }

    const searchTerm = `%${query.trim()}%`;

    const { count, rows } = await Lead.findAndCountAll({
      where: {
        [require('sequelize').Op.or]: [
          { name: { [require('sequelize').Op.like]: searchTerm } },
          { email: { [require('sequelize').Op.like]: searchTerm } },
        ],
      },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry'],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['name', 'ASC']],
    });

    if (count === 0) {
      return res.status(404).json({
        status: 'success',
        message: `No leads found matching "${query}"`,
        data: [],
        pagination: {
          total: 0,
          pages: 0,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Found ${count} lead(s) matching "${query}"`,
      data: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update lead status
const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required',
      });
    }

    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: new, contacted, qualified, converted, lost',
      });
    }

    const lead = await Lead.findByPk(id);

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found',
      });
    }

    const oldStatus = lead.status;
    
    const updatedLead = await lead.update({ status });

    const leadWithCompany = await Lead.findByPk(updatedLead.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'industry'],
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      message: `Lead status updated from "${oldStatus}" to "${status}"`,
      data: leadWithCompany,
    });
  } catch (error) {
    next(error);
  }
};

// Bulk update lead status
const bulkUpdateLeadStatus = async (req, res, next) => {
  try {
    const { leadIds, status } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Lead IDs array is required and must not be empty',
      });
    }

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required',
      });
    }

    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: new, contacted, qualified, converted, lost',
      });
    }

    const [updatedCount] = await Lead.update(
      { status },
      {
        where: {
          id: {
            [require('sequelize').Op.in]: leadIds,
          },
        },
      }
    );

    const updatedLeads = await Lead.findAll({
      where: {
        id: {
          [require('sequelize').Op.in]: leadIds,
        },
      },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name'],
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      message: `${updatedCount} lead(s) status updated to "${status}"`,
      data: updatedLeads,
    });
  } catch (error) {
    next(error);
  }
};

// Convert lead to contact
const convertLeadToContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get lead with company info
    const lead = await Lead.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found',
      });
    }

    if (lead.status === 'converted') {
      return res.status(400).json({
        status: 'error',
        message: 'This lead has already been converted',
      });
    }

    if (!lead.companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Lead must have a company assigned to be converted to a contact',
      });
    }

    // Parse name into firstName and lastName
    const nameParts = lead.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    if (!lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'Lead name must contain both first and last name for conversion (e.g., "John Doe")',
      });
    }

    // Check if contact with same email already exists
    const existingContact = await Contact.findOne({
      where: { email: lead.email },
    });

    if (existingContact) {
      return res.status(409).json({
        status: 'error',
        message: 'A contact with this email already exists',
      });
    }

    // Create contact from lead data
    const newContact = await Contact.create({
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone || null,
      jobTitle: null,
      companyId: lead.companyId,
      status: 'active',
      notes: lead.notes ? `Converted from Lead: ${lead.notes}` : 'Converted from Lead',
    });

    // Update lead status to converted
    await lead.update({ status: 'converted' });

    // Fetch complete contact with company info
    const contactWithCompany = await Contact.findByPk(newContact.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      message: `Lead "${lead.name}" successfully converted to contact`,
      data: {
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          status: 'converted',
        },
        contact: contactWithCompany,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
