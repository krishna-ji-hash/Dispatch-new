const cron = require('node-cron');
const {fetchAndUpdateDeliveryStandardStatus,fetchAndUpdateDeliveryStandardStatusEcom,syncShopifyOrders} = require("../services/fetchAndUpdateDeliveryStandardStatus");
const {fetchAndUpdateDeliveryStatus} = require("../services/fetchAndUpdateDeliveryStatus");
const  fetchAndUpdateDTDCStandardStatus = require("../services/fetchAndUpdateDTDCStandardStatus");
const fetchAndUpdateDTDCStatus = require("../services/fetchAndUpdateDTDCStatus");
const {fetchAndUpdateExpressBeesStatus,fetchAndUpdateExpressBeesStatusEcom} = require("../services/fetchAndUpdateExpressBeesStatus");
// const importXLSXData = require("../services/importXLSXData");

// // Schedule the cron job to run every 2 hours
cron.schedule('0 */2 * * *', fetchAndUpdateDTDCStandardStatus);
// cron.schedule('* * * * *', fetchAndUpdateDTDCStandardStatus);    


cron.schedule('0 */2 * * *', fetchAndUpdateDeliveryStandardStatus);
cron.schedule('0 */2 * * *', fetchAndUpdateDeliveryStandardStatusEcom);
// cron.schedule('* * * * *', fetchAndUpdateDeliveryStandardStatus);
// cron.schedule('* * * * *', fetchAndUpdateDeliveryStandardStatusEcom);


// Schedule the cron job to run every 2 hours
cron.schedule('0 */2 * * *', fetchAndUpdateExpressBeesStatus);
cron.schedule('0 */2 * * *', fetchAndUpdateExpressBeesStatusEcom);
// cron.schedule('* * * * *', fetchAndUpdateExpressBeesStatusEcom);

// cron.schedule('* * * * *', fetchAndUpdateExpressBeesStatus);

// Schedule the cron job to run every 2 hours
// cron.schedule('0 */2 * * *', fetchAndUpdateDTDCStatus);
// cron.schedule('* * * * *', fetchAndUpdateDTDCStatus);


// cron.schedule('*/5 * * * *', fetchAndUpdateDeliveryStatus);
// cron.schedule('* * * * *', syncShopifyOrders);

// Schedule XLSX import cron job to run daily at midnight
// cron.schedule('0 0 * * *', importXLSXData);
// cron.schedule('* * * * *', fetchAndUpdateDeliveryStatus);

