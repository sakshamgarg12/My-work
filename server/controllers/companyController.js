const Company = require('../models/Company');

// Distinct industries (for filter dropdowns) — must stay before /:id routes
const getDistinctIndustries = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const rows = await Company.findAll({
      attributes: ['industry'],
      where: {
        [Op.and]: [{ industry: { [Op.ne]: null } }, { industry: { [Op.ne]: '' } }],
      },
      group: ['industry'],
      order: [['industry', 'ASC']],
      raw: true,
    });
    const data = rows.map((r) => r.industry).filter(Boolean);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Get all companies
const getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, name, industry } = req.query;
    const offset = (page - 1) * limit;
    const Op = require('sequelize').Op;
    const sequelize = Company.sequelize;

    const nameTrimmed = name != null && String(name).trim() !== '' ? String(name).trim() : '';
    const industryTrimmed =
      industry != null && String(industry).trim() !== '' ? String(industry).trim() : '';

    const parts = [];

    if (nameTrimmed) {
      parts.push({ name: { [Op.like]: `%${nameTrimmed}%` } });
    }

    if (industryTrimmed) {
      parts.push(
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('industry')),
          industryTrimmed.toLowerCase()
        )
      );
    }

    let whereClause = {};

    if (parts.length === 1) {
      whereClause = parts[0];
    } else if (parts.length > 1) {
      whereClause = { [Op.and]: parts };
    } else if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { industry: { [Op.like]: `%${search}%` } },
          { city: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await Company.findAndCountAll({
      where: whereClause,
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

// Get company by ID
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// Create company
const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      industry,
      email,
      phone,
      website,
      address,
      city,
      state,
      zipCode,
      country,
      description,
      status,
    } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ where: { name } });
    if (existingCompany) {
      return res.status(409).json({
        status: 'error',
        message: 'Company with this name already exists',
      });
    }

    const company = await Company.create({
      name,
      industry,
      email,
      phone,
      website,
      address,
      city,
      state,
      zipCode,
      country,
      description,
      status,
    });

    res.status(201).json({
      status: 'success',
      message: 'Company created successfully',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// Update company
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found',
      });
    }

    // Check if new name is already taken
    if (req.body.name && req.body.name !== company.name) {
      const existingCompany = await Company.findOne({
        where: { name: req.body.name },
      });
      if (existingCompany) {
        return res.status(409).json({
          status: 'error',
          message: 'Company with this name already exists',
        });
      }
    }

    const updatedCompany = await company.update(req.body);

    res.status(200).json({
      status: 'success',
      message: 'Company updated successfully',
      data: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};

// Delete company
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found',
      });
    }

    await company.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Company deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get companies by status
const getCompaniesByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;

    const companies = await Company.findAll({
      where: { status },
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      status: 'success',
      data: companies,
      count: companies.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get companies by industry
const getCompaniesByIndustry = async (req, res, next) => {
  try {
    const { industry } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!industry) {
      return res.status(400).json({
        status: 'error',
        message: 'Industry parameter is required',
      });
    }

    const { count, rows } = await Company.findAndCountAll({
      where: {
        industry: require('sequelize').where(
          require('sequelize').fn('LOWER', require('sequelize').col('industry')),
          'LIKE',
          `%${industry.toLowerCase()}%`
        ),
      },
      limit: parseInt(limit),
      offset: offset,
      order: [['name', 'ASC']],
    });

    if (count === 0) {
      return res.status(404).json({
        status: 'success',
        message: `No companies found in the ${industry} industry`,
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

// Get company statistics
const getCompanyStats = async (req, res, next) => {
  try {
    const totalCompanies = await Company.count();
    const activeCompanies = await Company.count({ where: { status: 'active' } });
    const inactiveCompanies = await Company.count({
      where: { status: 'inactive' },
    });
    const prospectCompanies = await Company.count({
      where: { status: 'prospect' },
    });

    res.status(200).json({
      status: 'success',
      data: {
        total: totalCompanies,
        active: activeCompanies,
        inactive: inactiveCompanies,
        prospect: prospectCompanies,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDistinctIndustries,
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompaniesByStatus,
  getCompaniesByIndustry,
  getCompanyStats,
};
