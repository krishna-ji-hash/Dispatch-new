const axios = require("axios");
const { mySqlQury } = require("../middleware/db");
// Helper function to process delivery response
const processDeliveryResponse = async (response, lrNo, statusTable, lrTable) => {
  const shipmentData = response.data.ShipmentData;
  if (shipmentData && shipmentData.length > 0) {
    for (const shipment of shipmentData) {
      const scans = shipment.Shipment.Scans;

      for (const scan of scans) {
        const {
          ScanDateTime,
          ScanType,
          Scan,
          StatusDateTime,
          ScannedLocation,
          StatusCode,
          Instructions
        } = scan.ScanDetail;

        // Check if the StatusCode already exists for this lrNo
        const checkScanSql = `
          SELECT COUNT(*) AS count 
          FROM ${statusTable} 
          WHERE lrnum = ? AND status_code = ?`;
        const scanCheckResult = await mySqlQury(checkScanSql, [lrNo, StatusCode]);
        const statusCodeExists = scanCheckResult[0].count > 0;

        // Insert a new record only if the StatusCode does not exist
        if (!statusCodeExists) {
          const insertSql = `
            INSERT INTO ${statusTable} 
            (lrnum, scan_datetime, scan_type, scan, status_datetime, scanned_location, status_code, instructions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          const insertValues = [
            lrNo,
            ScanDateTime,
            ScanType,
            Scan,
            StatusDateTime,
            ScannedLocation,
            StatusCode,
            Instructions
          ];

          await mySqlQury(insertSql, insertValues);
          console.log(`Scan inserted for lrnum: ${lrNo} - StatusCode: ${StatusCode}`);
        } else {
          console.log(`StatusCode '${StatusCode}' already exists for lrnum: ${lrNo}`);
        }

        // Update status in lr table based on the Scan and ScanType values
        let newStatus = null;
        if (Scan === "In Transit" && ScanType === "UD") {
          newStatus = 3; // Set status to 3 if Scan is "In Transit" and ScanType is "UD"
        } else if (Scan === "In Transit" && ScanType === "RT" && StatusCode === "X-ILL1F") {
          newStatus = 7; // Set status to 7 for return to origin (consistent for both functions)
        } else if (Scan === "Delivered") {
          newStatus = 4;
        } else if (Scan === "Not Picked") {
          newStatus = 0; // Handle the "Not Picked" scan case
        } else if (StatusCode === "ST-108" || StatusCode === "ST-144" || StatusCode === "EOD-11" || StatusCode === "EOD-6") {
          newStatus = 9; // NDR cases
        } else if (StatusCode === "X-DDD3FD") {
          newStatus = 8; // out for delivery
        } else if (StatusCode === "RD-AC") {
          newStatus = 5; // return accepted
        }

        if (newStatus !== null) {
          const updateStatusSql = `
            UPDATE ${lrTable} 
            SET status = ? 
            WHERE lr_No = ? AND status != ?`;
          await mySqlQury(updateStatusSql, [newStatus, lrNo, newStatus]);
          console.log(`Updated status to ${newStatus} for lrnum: ${lrNo} (Scan: ${Scan})`);
        }
      }
    }
  } else {
    console.log(`No valid delivery data for lrnum: ${lrNo}. Response: `, response.data);
  }
};

const fetchAndUpdateDeliveryStandardStatus = async () => {
  try {
    const selectSql = `
    SELECT lr_No 
    FROM tbl_exp_lr 
    WHERE tagged_api IN ('DELHIVERY')
    AND status NOT IN (0, 4)`;

    const selectResults = await mySqlQury(selectSql);
    console.log("Selected results for the delivery: ", selectResults);

    for (const row of selectResults) {
      const lrNo = row.lr_No;
      console.log("Loading ", lrNo);
              try {
          // Route based on LR number starting digit
          let token, apiUrl;
          if (lrNo.startsWith('4')) {
            token = process.env.QUICKFLY;
            console.log(`LR ${lrNo} starts with 4, using QUICKFLY token`);
          } else if (lrNo.startsWith('3')) {
            token = process.env.DELHIVERY_STD;
            console.log(`LR ${lrNo} starts with 3, using DELHIVERY_STD token`);
          } else {
            // Default fallback for other numbers
            token = process.env.DELHIVERY_STD;
            console.log(`LR ${lrNo} doesn't start with 3 or 4, using DELHIVERY_STD token`);
          }
          
          apiUrl = `https://track.delhivery.com/api/v1/packages/json?waybill=${lrNo}&token=${token}`;
          const response = await axios.get(apiUrl);
          console.log(`Response from ${token === process.env.QUICKFLY ? 'QUICKFLY' : 'DELHIVERY_STD'} for ${lrNo}`);
          await processDeliveryResponse(response, lrNo, 'tbl_exp_delhivery_status', 'tbl_exp_lr');
      } catch (apiError) {
        console.error(`API error for lrnum ${lrNo}:`, apiError.response ? apiError.response.data : apiError.message);
      }
    }
  } catch (error) {
    console.error('Error fetching lr_No:', error);
  }
};

const fetchAndUpdateDeliveryStandardStatusEcom = async () => {
  try {
    const selectSql = `
    SELECT lr_No 
    FROM tbl_ecom_lr 
    WHERE tagged_api IN ('DELHIVERY')
    AND status NOT IN (0, 4)`;

    const selectResults = await mySqlQury(selectSql);
    console.log("Selected results for the delivery: ", selectResults);

    for (const row of selectResults) {
      const lrNo = row.lr_No;
      console.log("Loading ", lrNo);
              try {
          // Route based on LR number starting digit
          let token, apiUrl;
          if (lrNo.startsWith('4')) {
            token = process.env.QUICKFLY;
            console.log(`LR ${lrNo} starts with 4, using QUICKFLY token`);
          } else if (lrNo.startsWith('3')) {
            token = process.env.DELHIVERY_STD;
            console.log(`LR ${lrNo} starts with 3, using DELHIVERY_STD token`);
          } else {
            // Default fallback for other numbers
            token = process.env.DELHIVERY_STD;
            console.log(`LR ${lrNo} doesn't start with 3 or 4, using DELHIVERY_STD token`);
          }
          
          apiUrl = `https://track.delhivery.com/api/v1/packages/json?waybill=${lrNo}&token=${token}`;
          const response = await axios.get(apiUrl);
          console.log(`Response from ${token === process.env.QUICKFLY ? 'QUICKFLY' : 'DELHIVERY_STD'} for ${lrNo}`);
          await processDeliveryResponse(response, lrNo, 'tbl_ecom_delhivery_status', 'tbl_ecom_lr');
      } catch (apiError) {
        console.error(`API error for lrnum ${lrNo}:`, apiError.response ? apiError.response.data : apiError.message);
      }
    }
  } catch (error) {
    console.error('Error fetching lr_No:', error);
  }
};

async function syncShopifyOrders(req, res) {
  try {
    const integrations = await mySqlQury(
      "SELECT clientId, shopyfy_url, accessToken FROM tbl_shopify_integration"
    );

    for (const integration of integrations) {
      const { clientId, shopyfy_url, accessToken } = integration;

      // const { clientId, shopyfy_url, accessToken } = req.body;

      let origin_pincode;
      let origin_state;
      let origin_city;

      // --- Fetch data from Shopify
      const [orderResponse, locationResponse] = await Promise.all([
        axios.get(`https://${shopyfy_url}/admin/api/2023-10/orders.json`, {
          headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': accessToken }
        }),
        axios.get(`https://${shopyfy_url}/admin/api/2025-07/locations.json`, {
          headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': accessToken }
        })
      ]);
      if (orderResponse.status !== 200 || locationResponse.status !== 200) {
        console.log(`❌ API Error for ${shopyfy_url}:`, {
          orders: orderResponse.status,
          locations: locationResponse.status
        });
        continue; // Skip this integration and continue with next
      }

      const locations = locationResponse.data.locations || [];
      const orders = orderResponse.data.orders || [];
      console.log("orders", orders);

      // env sanity (कौन से DB/port पर हो)
   

      for (const order of orders) {
        const shopifyOrderNumber = Number(order.order_number);
        if (!Number.isFinite(shopifyOrderNumber)) continue;

        const paymentMode = (order.financial_status === 'paid')
          ? 'prepaid'
          : (order.gateway && String(order.gateway).toLowerCase().includes('cod')) ? 'cod' : 'prepaid';

        const loc = locations.find(l => String(l.id) === String(order.location_id));
        origin_pincode = loc?.zip || '';
        origin_state   = loc?.province || '';
        origin_city    = loc?.city || '';

        let height = 0, width = 0, length = 0, unit = '';
        try {
          const metaResponse = await axios.get(
            `https://${shopyfy_url}/admin/api/2025-07/orders/${order.id}/metafields.json`,
            { headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': accessToken } }
          );
          const metafields = metaResponse.data.metafields || [];
          for (const mf of metafields) {
            if (mf.namespace !== 'shipping') continue;
            if (!mf?.value) continue;
            try {
              const parsed = JSON.parse(mf.value);
              if (mf.key === 'height') { height = Number(parsed.value) || 0; unit = parsed.unit || unit; }
              if (mf.key === 'width')  { width  = Number(parsed.value) || 0; unit = parsed.unit || unit; }
              if (mf.key === 'length') { length = Number(parsed.value) || 0; unit = parsed.unit || unit; }
            } catch {}
          }
        } catch {}

        let taxTitle = '';
        for (const t of (order.tax_lines || [])) taxTitle = t?.title || taxTitle;

        const whRows = await mySqlQury(
          'SELECT warehouse_id FROM dsnew12.tbl_add_warehouse WHERE client_id = ? ',
          [clientId]
        );
        const whId = whRows?.[0]?.warehouse_id ?? null;

        const safeUnit = 'gm';
        const totalQty = (order.line_items || []).reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);

        // ------------------------------
        // 1) Parent insert with "upsert-id" trick
        // ------------------------------
        const orderInsert = await mySqlQury(
          `INSERT INTO dsnew12.tbl_ecom_orders (
             channel, ref_number, orderid, invoice_no, client_id, payment_mode, collectable_amount, warehouse_id,
             total_weight, weight_unit, grand_total, total_qty, box_qty, total_tax, total_discount, is_unprocessed
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
          [
            // <<< आपकी दी हुई test values — बिना बदले >>>
            'shopify',
            String(order.reference || ''),
             Number(shopifyOrderNumber),
             String(shopifyOrderNumber),
             Number(clientId),
             paymentMode,
            8.9,
             whId,
            Number(order.total_weight || 0),
             safeUnit,
             Number(order.current_total_price || 0),
             Number(totalQty),
            1,
             Number(order.current_total_tax || 0),
           Number(order.total_discounts || 0),
            0
          ]
        );

        // अब चाहे insert हुआ हो या duplicate, parentId हमेशा मिलेगा
        const parentId = orderInsert.insertId;

        // same-session visibility check (debug)
        const check = await mySqlQury(
          `SELECT id FROM dsnew12.tbl_ecom_orders WHERE id = ? LIMIT 1`,
          [parentId]
        );
        console.log('parent visible now?', check.length > 0, 'parentId=', parentId);

        // ------------------------------
        // 2) Child inserts (parentId use)
        // ------------------------------
        const consigneeInsert = await mySqlQury(
          `INSERT IGNORE INTO dsnew12.tbl_ecom_consignee_details (
             order_id, first_name, last_name, email, phone, alternate_phone, address_line1, address_line2, landmark,
             country, state, city, pincode, billing_same_as_shipping, billing_first_name, billing_last_name, billing_email,
             billing_phone, billing_alternate_phone, billing_address_line1, billing_address_line2, billing_landmark,
             billing_country, billing_state, billing_city, billing_pincode
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            parentId,
            (order.shipping_address?.first_name || '').trim(),
            (order.shipping_address?.last_name || '').trim(),
            String(order?.contact_email || ''),
            String(order?.phone || ''),
            String(order?.phone || ''),
            order.shipping_address?.address1 || '',
            order.shipping_address?.address2 || '',
            order.shipping_address?.address1 || '',
            order.shipping_address?.country || '',
            order.shipping_address?.province || '',
            order.shipping_address?.city || '',
            order.shipping_address?.zip || '',
            1,
            (order.billing_address?.first_name || '').trim(),
            (order.billing_address?.last_name || '').trim(),
            String(order?.contact_email || ''),
            String(order.billing_address?.phone || '').trim(),
            String(order.billing_address?.phone || '').trim(),
            order.billing_address?.address1 || '',
            order.billing_address?.address2 || '',
            order.billing_address?.address1 || '',
            order.billing_address?.country || '',
            order.billing_address?.province || '',
            order.billing_address?.city || '',
            order.billing_address?.zip || ''
          ]
        );
        console.log("consigneeInsert", consigneeInsert);

        await mySqlQury(
          `INSERT IGNORE INTO dsnew12.tbl_ecom_boxes_details (
             order_id, package_type, length, breadth, height, dimension_unit, weight, weight_unit
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            parentId,
            'standard',
            Number(length || 0),
            Number(width || 0),
            Number(height || 0),
            String(unit || ''),
            Number(order.line_items?.[0]?.grams || 0),
            safeUnit
          ]
        );

        for (const li of (order.line_items || [])) {
          await mySqlQury(
            `INSERT IGNORE INTO dsnew12.tbl_ecom_product_details (
               order_id, category, name, price, sku, quantity, discount_value, discount_type, tax_type
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              parentId,
              'shopify',
              li?.title || `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim(),
              Number(li?.price || order.current_subtotal_price || 0),
              String(li?.sku || ''),
              Number(li?.quantity || 0),
              0,
              'Percent',
              taxTitle
            ]
          );
        }
      } // ← Close the orders loop
    } // ← Close the integrations loop
    
    // res.json({ success: true, message: '✅ Orders Imported Successfully' });
  } catch (apiError) {
    console.log(`❌ Shopify API Error for `, apiError.message);
  if (apiError.response?.status === 404) {
    console.log(`❌ 404 Error: API endpoint not found for `);
  }
  }
}


module.exports= {fetchAndUpdateDeliveryStandardStatus,fetchAndUpdateDeliveryStandardStatusEcom,syncShopifyOrders}