const { mySqlQury } = require("../middleware/db");

// ====================== BASIC INFO ======================

const getLoginDetails = async (role, clientId, roleData) => {
  if (role === 1 || clientId === 1) {
    const [admin] = await mySqlQury('SELECT first_name, role_name, company_name, logo_path FROM tbl_admin WHERE id = ?', [roleData.id]);
    return admin;
  } 
};

const getWalletBalance = async (userId) => {
  const [wallet] = await mySqlQury('SELECT total_amount FROM tbl_wallet WHERE user_id = ?', [userId]);
  return wallet?.total_amount || 0;
};

const getProfile = async (id) => {
  const [profile] = await mySqlQury('SELECT first_name, role_name, company_name, logo_path FROM tbl_admin WHERE id = ?', [id]);
  return profile;
};

const getActiveTopics = async (role) => {
  const topics = await mySqlQury('SELECT topic_id FROM tbl_permissions WHERE role_id = ? AND is_active = 1', [role]);
  return topics.map(t => Number(t.topic_id));
};

// ====================== ORDER SUMMARY ======================

const getOrderSummary = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      (lr.po_no_count + uo.po_no_count) AS po_no_count,
      (lr.payment_cod_count + uo.payment_cod_count) AS payment_cod_count,
      (lr.payment_prepaid_count + uo.payment_prepaid_count) AS payment_prepaid_count,
      (lr.payment_payByCheck_count + uo.payment_payByCheck_count) AS payment_payByCheck_count
    FROM
    (
      SELECT
        COUNT(DISTINCT order_id) AS po_no_count,
        COUNT(DISTINCT CASE WHEN billing_status = 'cod' THEN CONCAT(order_id, '-', billing_status) END) AS payment_cod_count,
        COUNT(DISTINCT CASE WHEN billing_status = 'pre-paid' THEN CONCAT(order_id, '-', billing_status) END) AS payment_prepaid_count,
        COUNT(DISTINCT CASE WHEN billing_status = 'payByCheck' THEN CONCAT(order_id, '-', billing_status) END) AS payment_payByCheck_count
      FROM tbl_exp_lr
      WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) AND status IN (0,1,2,3,4,5)
      ${clientId > 0 ? "AND client_id = ?" : ""}
    ) AS lr,
    (
      SELECT
        COUNT(DISTINCT orderid) AS po_no_count,
        COUNT(DISTINCT CASE WHEN payment_mode = 'cod' THEN CONCAT(orderid, '-', payment_mode) END) AS payment_cod_count,
        COUNT(DISTINCT CASE WHEN payment_mode = 'pre-paid' THEN CONCAT(orderid, '-', payment_mode) END) AS payment_prepaid_count,
        COUNT(DISTINCT CASE WHEN payment_mode = 'payByCheck' THEN CONCAT(orderid, '-', payment_mode) END) AS payment_payByCheck_count
      FROM tbl_exp_orders
      WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) AND is_unprocessed = 1
      ${clientId > 0 ? "AND client_id = ?" : ""}
    ) AS uo
  `;

  const result = await mySqlQury(query, values);
  return result[0];
};

// ====================== RTO TREND ======================

const getRTOTrend = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      DATE(lr.created_at) AS date,
      COUNT(DISTINCT lr.order_id) AS lr_count,
      COUNT(DISTINCT uo.orderid) AS order_count
    FROM
    (
      SELECT order_id, created_at, client_id
      FROM tbl_exp_lr
      WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
      ${clientId > 0 ? "AND client_id = ?" : ""}
    ) AS lr
    FULL OUTER JOIN
    (
      SELECT orderid, created_at, client_id
      FROM tbl_exp_orders
      WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
      ${clientId > 0 ? "AND client_id = ?" : ""}
    ) AS uo ON DATE(lr.created_at) = DATE(uo.created_at)
    GROUP BY DATE(lr.created_at)
    ORDER BY date DESC
    LIMIT 7
  `;

  return await mySqlQury(query, values);
};

// ====================== ORDER STATUS CHART ======================

const getOrderStatusChart = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      status,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY status
    
    UNION ALL
    
    SELECT
      'order' AS type,
      CASE 
        WHEN is_unprocessed = 1 THEN 'unprocessed'
        ELSE 'processed'
      END AS status,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY is_unprocessed
  `;

  return await mySqlQury(query, values);
};

// ====================== AGING DATA ======================

const getAgingData = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      CASE
        WHEN DATEDIFF(CURDATE(), created_at) <= 1 THEN '0-1 days'
        WHEN DATEDIFF(CURDATE(), created_at) <= 3 THEN '2-3 days'
        WHEN DATEDIFF(CURDATE(), created_at) <= 7 THEN '4-7 days'
        WHEN DATEDIFF(CURDATE(), created_at) <= 15 THEN '8-15 days'
        ELSE '15+ days'
      END AS age_range,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY age_range
    
    UNION ALL
    
    SELECT
      'order' AS type,
      CASE
        WHEN DATEDIFF(CURDATE(), created_at) <= 1 THEN '0-1 days'
        WHEN DATEDIFF(CURDATE(), created_at) <= 3 THEN '2-3 days'
        WHEN DATEDIFF(CURDATE(), created_at) <= 7 THEN '4-7 days'
        WHEN DATEDIFF(CURDATE(), created_at) <= 15 THEN '8-15 days'
        ELSE '15+ days'
      END AS age_range,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY age_range
  `;

  return await mySqlQury(query, values);
};

// ====================== STATUS WISE COUNTS ======================

const getStatusWiseCounts = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      status,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY status
    
    UNION ALL
    
    SELECT
      'order' AS type,
      CASE 
        WHEN is_unprocessed = 1 THEN 'unprocessed'
        ELSE 'processed'
      END AS status,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY is_unprocessed
  `;

  return await mySqlQury(query, values);
};

// ====================== UNPROCESSED COUNTS ======================

const getUnprocessedCounts = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE status IN (0, 1) AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    
    UNION ALL
    
    SELECT
      'order' AS type,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE is_unprocessed = 1 AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
  `;

  return await mySqlQury(query, values);
};

// ====================== MONTHLY ORDER TREND ======================

const getMonthlyOrderTrend = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY month
    ORDER BY month DESC
  `;

  return await mySqlQury(query, values);
};

// ====================== MONTHLY CREATED LR TREND ======================

const getMonthlyCreatedLRTrend = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY month
    ORDER BY month DESC
  `;

  return await mySqlQury(query, values);
};

// ====================== RECENT ACTIVITIES ======================

const getRecentActivities = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      order_id AS reference,
      created_at,
      status,
      'LR Created' AS action
    FROM tbl_exp_lr
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    
    UNION ALL
    
    SELECT
      'order' AS type,
      orderid AS reference,
      created_at,
      CASE 
        WHEN is_unprocessed = 1 THEN 'unprocessed'
        ELSE 'processed'
      END AS status,
      'Order Created' AS action
    FROM tbl_exp_orders
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    
    ORDER BY created_at DESC
    LIMIT 10
  `;

  return await mySqlQury(query, values);
};

// ====================== TOP PERFORMING CLIENTS ======================

const getTopPerformingClients = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      ta.company_name,
      COUNT(DISTINCT lr.order_id) AS lr_count,
      COUNT(DISTINCT uo.orderid) AS order_count,
      (COUNT(DISTINCT lr.order_id) + COUNT(DISTINCT uo.orderid)) AS total_count
    FROM tbl_admin ta
    LEFT JOIN tbl_exp_lr lr ON ta.id = lr.client_id
    LEFT JOIN tbl_exp_orders uo ON ta.id = uo.client_id
    WHERE (lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) OR uo.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY))
    ${clientId > 0 ? "AND ta.id = ?" : ""}
    GROUP BY ta.id, ta.company_name
    ORDER BY total_count DESC
    LIMIT 5
  `;

  return await mySqlQury(query, values);
};

// ====================== REVENUE SUMMARY ======================

const getRevenueSummary = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      SUM(total_lr_charges) AS total_revenue,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    
    UNION ALL
    
    SELECT
      'order' AS type,
      SUM(grand_total) AS total_revenue,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
  `;

  return await mySqlQury(query, values);
};

// ====================== WAREHOUSE PERFORMANCE ======================

const getWarehousePerformance = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      pickup_zone AS warehouse,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY pickup_zone
    
    UNION ALL
    
    SELECT
      'order' AS type,
      warehouse_id AS warehouse,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY warehouse_id
    
    ORDER BY count DESC
    LIMIT 5
  `;

  return await mySqlQury(query, values);
};

// ====================== PAYMENT MODE ANALYSIS ======================

const getPaymentModeAnalysis = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      billing_status AS payment_mode,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY billing_status
    
    UNION ALL
    
    SELECT
      'order' AS type,
      payment_mode,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    GROUP BY payment_mode
  `;

  return await mySqlQury(query, values);
};

// ====================== WEIGHT ANALYSIS ======================

const getWeightAnalysis = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      AVG(chargable_weight) AS avg_weight,
      SUM(chargable_weight) AS total_weight,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    
    UNION ALL
    
    SELECT
      'order' AS type,
      AVG(total_weight) AS avg_weight,
      SUM(total_weight) AS total_weight,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
  `;

  return await mySqlQury(query, values);
};

// ====================== TAX AND DISCOUNT SUMMARY ======================

const getTaxDiscountSummary = async (clientId) => {
  const values = clientId > 0 ? [clientId, clientId] : [];

  const query = `
    SELECT
      'lr' AS type,
      SUM(total_gst) AS total_tax,
      0 AS total_discount,
      COUNT(*) AS count
    FROM tbl_exp_lr
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
    
    UNION ALL
    
    SELECT
      'order' AS type,
      SUM(total_tax) AS total_tax,
      SUM(total_discount) AS total_discount,
      COUNT(*) AS count
    FROM tbl_exp_orders
    WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())
    ${clientId > 0 ? "AND client_id = ?" : ""}
  `;

  return await mySqlQury(query, values);
};

// ====================== EXPORT ALL FUNCTIONS ======================

module.exports = {
  getLoginDetails,
  getWalletBalance,
  getProfile,
  getActiveTopics,
  getOrderSummary,
  getRTOTrend,
  getOrderStatusChart,
  getAgingData,
  getStatusWiseCounts,
  getUnprocessedCounts,
  getMonthlyOrderTrend,
  getMonthlyCreatedLRTrend,
  getRecentActivities,
  getTopPerformingClients,
  getRevenueSummary,
  getWarehousePerformance,
  getPaymentModeAnalysis,
  getWeightAnalysis,
  getTaxDiscountSummary
};
