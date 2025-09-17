'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Starting COD Summary population...');
    
    try {
      // Check if order_id column exists, if not add it
      const tableDescription = await queryInterface.describeTable('tbl_cod_summary');
      if (!tableDescription.order_id) {
        console.log('order_id column does not exist, adding it...');
        await queryInterface.addColumn('tbl_cod_summary', 'order_id', {
          type: Sequelize.STRING,
          allowNull: true,
          comment: "Link to original order table"
        });
        console.log('Added order_id column to tbl_cod_summary');
      } else {
        console.log('order_id column already exists');
      }
      
      // First, clear existing data
      await queryInterface.bulkDelete('tbl_cod_summary', null, {});
      console.log('Cleared existing COD summary data');

      // Get all COD orders from ecom orders
      const ecomCodOrders = await queryInterface.sequelize.query(`
        SELECT 
          eo.id,
          eo.orderid as order_id,
          eo.client_id,
          COALESCE(a.company_name, CONCAT(a.first_name, ' ', a.last_name), 'Client ID: ' + CAST(eo.client_id AS CHAR)) as client_name,
          el.lr_no,
          eo.box_qty as total_box,
          el.tagged_api,
          NULL as dispatch_mode,
          el.created_at as delivery_date,
          el.status,
          eo.payment_mode,
          eo.collectable_amount as cod_amount
        FROM tbl_ecom_orders eo
        LEFT JOIN tbl_ecom_lr el ON eo.id = el.order_id
        LEFT JOIN tbl_admin a ON eo.client_id = a.id
        WHERE eo.payment_mode = 'cod' AND eo.collectable_amount > 0
        ORDER BY eo.id DESC
      `, {
        type: Sequelize.QueryTypes.SELECT
      });

      console.log(`Found ${ecomCodOrders.length} COD orders from ecom table`);
      
      // Debug: Log sample data to see what we're getting
      if (ecomCodOrders.length > 0) {
        console.log('Sample ecom order data:', JSON.stringify(ecomCodOrders[0], null, 2));
      }

      // Get all COD orders from exp orders
      const expCodOrders = await queryInterface.sequelize.query(`
        SELECT 
          eo.id,
          eo.orderid as order_id,
          eo.client_id,
          COALESCE(a.company_name, CONCAT(a.first_name, ' ', a.last_name), 'Client ID: ' + CAST(eo.client_id AS CHAR)) as client_name,
          el.lr_no,
          eo.box_qty as total_box,
          el.tagged_api,
          NULL as dispatch_mode,
          el.created_at as delivery_date,
          el.status,
          eo.payment_mode,
          eo.collectable_amount as cod_amount
        FROM tbl_exp_orders eo
        LEFT JOIN tbl_exp_lr el ON eo.id = el.order_id
        LEFT JOIN tbl_admin a ON eo.client_id = a.id
        WHERE eo.payment_mode = 'cod' AND eo.collectable_amount > 0
        ORDER BY eo.id DESC
      `, {
        type: Sequelize.QueryTypes.SELECT
      });

      console.log(`Found ${expCodOrders.length} COD orders from exp table`);
      
      // Debug: Log sample data to see what we're getting
      if (expCodOrders.length > 0) {
        console.log('Sample exp order data:', JSON.stringify(expCodOrders[0], null, 2));
      }

      // Combine and prepare data for insertion
      const allCodOrders = [...ecomCodOrders, ...expCodOrders];
      
      // Transform data to match tbl_cod_summary structure
      const codSummaryData = allCodOrders.map(order => ({
        order_id: order.order_id,
        client_id: order.client_id,
        client_name: order.client_name || 'Unknown Client',
        lr_no: order.lr_no || '',
        total_box: order.total_box || 1,
        tagged_api: order.tagged_api || '',
        dispatch_mode: order.dispatch_mode || '',
        delivery_date: order.delivery_date || new Date(),
        status: order.status || 0,
        payment_mode: order.payment_mode || 'cod',
        cod_amount: parseFloat(order.cod_amount) || 0.00
      }));

      console.log(`Prepared ${codSummaryData.length} records for insertion`);
      
      // Debug: Log sample transformed data
      if (codSummaryData.length > 0) {
        console.log('Sample transformed data:', JSON.stringify(codSummaryData[0], null, 2));
      }

      // Insert data in batches to avoid memory issues
      const batchSize = 1000;
      for (let i = 0; i < codSummaryData.length; i += batchSize) {
        const batch = codSummaryData.slice(i, i + batchSize);
        await queryInterface.bulkInsert('tbl_cod_summary', batch);
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(codSummaryData.length / batchSize)}`);
      }

      console.log(`Successfully populated tbl_cod_summary with ${codSummaryData.length} records`);

    } catch (error) {
      console.error('Error populating COD summary:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Clear the populated data
    await queryInterface.bulkDelete('tbl_cod_summary', null, {});
    console.log('Cleared COD summary data');
  }
};
