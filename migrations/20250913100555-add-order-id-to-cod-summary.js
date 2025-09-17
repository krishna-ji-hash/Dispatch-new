"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new column `order_id` to tbl_cod_summary
    await queryInterface.addColumn("tbl_cod_summary", "order_id", {
      type: Sequelize.STRING, // or Sequelize.INTEGER if it's numeric
      allowNull: true,
      comment: "Link to original order table"
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: remove the column
    await queryInterface.removeColumn("tbl_cod_summary", "order_id");
  }
};
