/**
 * Sequelize Model Associations
 * 
 * This file documents all relationships between CRM models
 */

/**
 * COMPANY <-> CONTACT (One-to-Many)
 * 
 * A Company has many Contacts
 * A Contact belongs to one Company
 * 
 * Relationship:
 * - Company.hasMany(Contact, { foreignKey: 'companyId', as: 'contacts' })
 * - Contact.belongsTo(Company, { foreignKey: 'companyId', as: 'company' })
 * 
 * On Delete: CASCADE - When a company is deleted, all its contacts are deleted
 * On Update: CASCADE - When company ID changes, contact company IDs are updated
 * 
 * Usage Examples:
 * 
 * // Get company with all its contacts
 * const company = await Company.findByPk(1, {
 *   include: [
 *     {
 *       model: Contact,
 *       as: 'contacts'
 *     }
 *   ]
 * });
 * 
 * // Get contact with its company details
 * const contact = await Contact.findByPk(1, {
 *   include: [
 *     {
 *       model: Company,
 *       as: 'company'
 *     }
 *   ]
 * });
 * 
 * // Create a contact for a company
 * const contact = await Contact.create({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com',
 *   companyId: 1
 * });
 * 
 * // Get contacts for a specific company
 * const contacts = await Contact.findAll({
 *   where: { companyId: 1 }
 * });
 */

/**
 * COMPANY <-> LEAD (One-to-Many)
 * 
 * A Company has many Leads
 * A Lead belongs to one Company (or none)
 * 
 * Relationship:
 * - Company.hasMany(Lead, { foreignKey: 'companyId', as: 'leads' })
 * - Lead.belongsTo(Company, { foreignKey: 'companyId', as: 'company' })
 * 
 * On Delete: SET NULL - When a company is deleted, lead company IDs are set to null
 * On Update: CASCADE - When company ID changes, lead company IDs are updated
 * 
 * Usage Examples:
 * 
 * // Get lead with its company details
 * const lead = await Lead.findByPk(1, {
 *   include: [
 *     {
 *       model: Company,
 *       as: 'company'
 *     }
 *   ]
 * });
 * 
 * // Create a lead for a company
 * const lead = await Lead.create({
 *   name: 'John Prospect',
 *   email: 'john@prospect.com',
 *   source: 'website',
 *   status: 'new',
 *   companyId: 1
 * });
 * 
 * // Get leads for a specific company
 * const leads = await Lead.findAll({
 *   where: { companyId: 1 }
 * });
 */

module.exports = {
  description: 'Model Associations Documentation',
  relationships: [
    {
      from: 'Company',
      to: 'Contact',
      type: 'One-to-Many',
      foreignKey: 'companyId',
      cascadeDelete: true,
      cascadeUpdate: true,
      companyAlias: 'contacts',
      contactAlias: 'company',
    },
    {
      from: 'Company',
      to: 'Lead',
      type: 'One-to-Many',
      foreignKey: 'companyId',
      cascadeDelete: false,
      cascadeUpdate: true,
      onDelete: 'SET NULL',
      companyAlias: 'leads',
      leadAlias: 'company',
    },
  ],
};
