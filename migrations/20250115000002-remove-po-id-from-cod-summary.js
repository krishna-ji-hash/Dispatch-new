'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the po_id column from tbl_cod_summary
    await queryInterface.removeColumn('tbl_cod_summary', 'po_id');
    console.log('Removed po_id column from tbl_cod_summary');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the po_id column if rollback is needed
    await queryInterface.addColumn('tbl_cod_summary', 'po_id', {
      type: Sequelize.STRING,
      allowNull: true
    });
    console.log('Added back po_id column to tbl_cod_summary');
  }
};

