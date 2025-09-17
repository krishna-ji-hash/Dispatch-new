'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_address_verification_log', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      fullPhoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      customer_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      order_id: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      store_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      courier_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      awb: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      address_line1: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      address_line2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      landmark: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pincode: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      action_taken: {
        type: Sequelize.ENUM('CONFIRM_ADDRESS', 'UPDATE_ADDRESS'),
        allowNull: true,
        defaultValue: null
      },
      updated_address_line1: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      updated_address_line2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      updated_landmark: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      updated_country: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      updated_state: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      updated_city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      updated_pincode: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_address_verification_log');
  }
};
