const { Contact, Company } = require('../models');

// Get all contacts
const getAllContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, companyId, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    const Op = require('sequelize').Op;
    const sequelize = Contact.sequelize;

    if (search != null && String(search).trim() !== '') {
      const q = String(search).trim().slice(0, 200);
      const escapeLike = (s) => s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
      const likePattern = `%${escapeLike(q)}%`;

      whereClause[Op.or] = [
        { firstName: { [Op.like]: likePattern } },
        { lastName: { [Op.like]: likePattern } },
        { email: { [Op.like]: likePattern } },
        sequelize.literal(
          `CONCAT(COALESCE(\`contacts\`.\`firstName\`,''), ' ', COALESCE(\`contacts\`.\`lastName\`,'')) LIKE ${sequelize.escape(
            likePattern
          )}`
        ),
      ];
    }

    if (companyId) {
      whereClause.companyId = parseInt(companyId);
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Contact.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'email'],
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

// Get contact by ID
const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findByPk(req.params.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// Create contact
const createContact = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, jobTitle, companyId, status, notes } = req.body;

    // Check if contact already exists
    const existingContact = await Contact.findOne({ where: { email } });
    if (existingContact) {
      return res.status(409).json({
        status: 'error',
        message: 'Contact with this email already exists',
      });
    }

    // Verify company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found',
      });
    }

    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      companyId,
      status,
      notes,
    });

    const contactWithCompany = await Contact.findByPk(contact.id, {
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
      message: 'Contact created successfully',
      data: contactWithCompany,
    });
  } catch (error) {
    next(error);
  }
};

// Update contact
const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found',
      });
    }

    // Check if new email is already taken
    if (req.body.email && req.body.email !== contact.email) {
      const existingContact = await Contact.findOne({
        where: { email: req.body.email },
      });
      if (existingContact) {
        return res.status(409).json({
          status: 'error',
          message: 'Contact with this email already exists',
        });
      }
    }

    // If companyId is being updated, verify it exists
    if (req.body.companyId && req.body.companyId !== contact.companyId) {
      const company = await Company.findByPk(req.body.companyId);
      if (!company) {
        return res.status(404).json({
          status: 'error',
          message: 'Company not found',
        });
      }
    }

    const updatedContact = await contact.update(req.body);

    const contactWithCompany = await Contact.findByPk(updatedContact.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      message: 'Contact updated successfully',
      data: contactWithCompany,
    });
  } catch (error) {
    next(error);
  }
};

// Delete contact
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found',
      });
    }

    await contact.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get contacts by company
const getContactsByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Verify company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found',
      });
    }

    const { count, rows } = await Contact.findAndCountAll({
      where: { companyId: parseInt(companyId) },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name'],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['firstName', 'ASC']],
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

// Search contacts by firstName, lastName, or email
const searchContacts = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required',
      });
    }

    const Op = require('sequelize').Op;
    const sequelize = Contact.sequelize;
    const searchTerm = `%${query.trim()}%`;

    const { count, rows } = await Contact.findAndCountAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: searchTerm } },
          { lastName: { [Op.like]: searchTerm } },
          sequelize.literal(
            `CONCAT(COALESCE(\`contacts\`.\`firstName\`,''), ' ', COALESCE(\`contacts\`.\`lastName\`,'')) LIKE ${sequelize.escape(
              searchTerm
            )}`
          ),
          { email: { [Op.like]: searchTerm } },
        ],
      },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['firstName', 'ASC'], ['lastName', 'ASC']],
    });

    if (count === 0) {
      return res.status(404).json({
        status: 'success',
        message: `No contacts found matching "${query}"`,
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
      message: `Found ${count} contact(s) matching "${query}"`,
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

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactsByCompany,
  searchContacts,
};
