'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tbl_cod_summary', 'company_name', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'client_name', // optional: places column after client_name if DB supports it
      comment: 'Company name from Admin table'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tbl_cod_summary', 'company_name');
  }
};
