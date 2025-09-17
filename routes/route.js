const express = require('express');
const route = express.Router();
const { mySqlQury } = require('../middleware/db');
const {auth,ensureKYCApproved, kycAuth} = require('../middleware/auth')
const path = require('path');
const addressController = require('../controller/addressController');
const accessControlMiddleware = require('../middleware/accessControl');
const userController = require('../controller/userController');
const nodemailer = require("nodemailer");
const { uploadcv,clientdocs, uploadLR, uploadInvoice, upload,upload2 } = require('../middleware/multer');
route.get('/api/get-oda-charges',userController.apiGetOdaCharges) 
require('../crone/crone.js')
const axios = require('axios');
const enforceCourierAccess = require('../middleware/enforceCourierAccess.js');
const { log } = require('console');
 
// ======================
// HELPDESK ROUTES
// ======================

route.get('/helpdesk-reports', auth,userController.helpDeskReports)
route.get('/helpdesk-agents', auth, userController.helpdeskAgents)
 
// ======================
// AUTHENTICATION ROUTES
// ======================
route.get('/', userController.loginPage)
route.post('/', userController.loginAuth)
route.get('/signup', userController.getSignup)
route.post('/signup', userController.postSignup)
route.get('/verify/:token', userController.getVerifyToken)
route.get('/check-verification-status', userController.postCheckVerificationStatus)
route.post('/resend-verification', userController.postResendVerification)
route.get("/logout", userController.lagout)

// ======================
// DASHBOARD ROUTES
// ======================
route.get('/index', auth, userController.index)
route.get('/api/order-summary', auth, userController.orderSummary)
route.get("/order-stats", userController.orderStats)
route.get("/order-stats", userController.getOrderStats)

// ======================
// ORDER MANAGEMENT
// ======================
// Order Creation
// route.post('/create_order', upload.none(), auth, userController.postcreateOrder)
// route.post('/create_order_single', upload.none(), auth, userController.createOrderSingle)
// route.post('/create_order_multi', upload.none(), auth, userController.createOrderMulti)
route.post('/api/create-order-express', auth,accessControlMiddleware, userController.apiCreateOrderExpress)
route.post('/api/create-order-ecom', auth,accessControlMiddleware, userController.createOrderEcom)
route.post('/api/ecom/create-bulk-order', auth, uploadcv.any(), userController.createOrderEcomBulk)
route.post('/api/express/create-bulk-order', auth, uploadcv.any(), userController.createOrderExpressBulk)
// route.get('/create-order-new', auth, userController.createOrderNew)

// Bulk Order Creation
// route.get('/ltl/create-bulk-order', auth, userController.ltlCreateBulkOrder)
route.get('/ecom/create-bulk-order', auth,accessControlMiddleware, userController.ecomCreateBulkOrder)
route.get('/express/create-bulk-order', auth,accessControlMiddleware, userController.expressCreateBulkOrder)


// Order Tracking
route.get('/api/express/shipments/tracking/:lrNo', userController.expressShipmentsLrNo)
route.get('/api/ecom/shipments/tracking/:lrNo', userController.ecomShipmentsLrNo)
// route.get('/api/track-shipment', auth, accessControlMiddleware, userController.trackShipment)
// route.get('/order_details/:orderNumber', auth, userController.orderDetailsOrderNumber)
route.get('/order-details/:order_id', auth, userController.orderDetailsOrderId)
route.get('/all_orders', auth, userController.getAllOrders)
route.get('/fetch-orders', auth, userController.fetchOrder)
route.delete('/delete-order', userController.deleteOrders)
route.post('/get-addresses/express', auth, userController.getAddressExpress)
route.post('/get-pickup-addresses/ecom', auth, userController.getPickupAddressEcom)
// Order Status Categories
route.get('/ltl/unprocessed-orders', auth, userController.LtlUnprocessedOrder)
route.get('/ecom/unprocessed-orders', auth,accessControlMiddleware, userController.ecomUnprocessedOrder)
route.get('/express/unprocessed-orders', auth,accessControlMiddleware, userController.expressunprocessedOrder)
route.get('/ltl/ready_to_dispatch_assinged_lr', auth, userController.ltlReadyToDispatchLr)
route.get('/ecom/ready_to_dispatch_assinged_lr', auth, userController.ecomReadyToDispatch)
route.get('/express/ready_to_dispatch_assinged_lr', auth, userController.expressReadyToDispatch)
route.get('/ltl/order-in-transit', auth, userController.ltlOrderInTransit)
route.get('/ecom/order-in-transit', auth, userController.ecomOrderInTransit)
route.get('/express/order-in-transit', auth, userController.expressOrderInTransit)
route.get('/ltl/out-for-delivery', auth, userController.ltlOutForDelivery)
route.get('/express/out-for-delivery', auth, userController.expressOutForDelivery)
route.get('/ecom/out-for-delivery', auth, userController.ecomOutForDelivery)
route.get('/ltl/order-delivered', auth, userController.ltlOrderDelivered)
route.get('/express/order-delivered', auth, userController.expressOrderDelivered)
route.get('/ecom/order-delivered', auth, userController.ecomOrderDelivered)
route.get('/ltl/order-return', auth, userController.ltlOrderReturn)
route.get('/express/order-return', auth, userController.expressOrderReturn)
route.get('/ecom/order-return', auth, userController.ecomOrderReturn)
route.get('/ltl/cancelled-orders', auth, userController.ltlCancelledOrder)
route.get('/express/cancelled-orders', auth, userController.expressCancelledOrder)
route.get('/ecom/cancelled-orders', auth, userController.ecomCancelledOrder)
route.get('/order-dispatched', auth, userController.orderDispatch)

// Order Cancellation
route.post('/api/cancel-delhivery-standard', userController.apiCancelDelhiverystandard)
route.post('/api/cancel-delhivery-ltl', userController.apiCancelDelhiveryLtl)
route.post('/api/cancel-dtdc-standard', userController.apiCancelDtdcStandard)
route.post('/api/cancel-expressbees-standard', userController.apiCancelExpressbeesStandard)

// ======================
// SHIPPING & LABELS
// ======================
route.get('/get-shipping-label', auth, userController.getShippingLabel)
route.get('/api/shipping-label/delhivery-ltl', auth, userController.shippingLabelDelhiveryLtl)
route.post('/api/print-bulk-labels', auth, userController.printBulkLabels)
route.get('/delivery-shipping-label-links', userController.delhiveryShipingLabelLinks)
route.get('/delhivery-standard-label', userController.delhiveryStandardLabel)

// Shipping Label Preferences API
route.get('/api/shipping-label/preferences', auth, userController.getShippingLabelPreferences)
route.post('/api/shipping-label/preferences', auth, userController.saveShippingLabelPreferences)
route.get('/api/shipping-label/preferences/default', auth, userController.getDefaultShippingLabelPreferences)

// New Shipping Label Generation API
route.get('/api/shipping-label/generate', auth, userController.generateNewShippingLabel)

// Orders List API for Shipping Label Page
route.get('/api/orders/list', auth, userController.getOrdersList)

// ======================
// LR (LOAD RECEIPT) MANAGEMENT
// ======================
// route.post('/create_lr', auth, upload.any(), userController.createLr)
// route.post('/create_lr/api', upload.any(), userController.createLrApi)
route.post('/save_bulk_lr_automatic', auth, userController.saveBulkLrAutomatic)
route.post("/create_bulk_lr_manual", auth, userController.createBulkLrManual)
route.get('/get-manual-lr', auth, userController.getManualLr)
route.get('/mannual-lr-vault', auth, userController.mannualLrVault)
// route.post('/upload-lr-data', uploadLR.single('lrDataFile'), userController.postUploadLrData)
route.get('/filter-lrs', auth, userController.getFilterLrs)

// ======================
// TRACKING ROUTES
// ======================
route.get('/delivery-status/:lrNo', auth, userController.deliveryStatusLrno)
route.get('/delivery-standard-status/:lrNo', auth, userController.deliveryStandStatusLr)
route.get('/dtdc-ltl-status/:lrNo', auth, userController.dtdcLtlStatusLr)
route.get('/dtdc-standard-status/:lrNo', auth, userController.dtdcStandardStatusLr)
route.get('/expressbees-std/:lrNo', auth, userController.expressbeesStdLrno)
route.get('/tracking-master', auth,accessControlMiddleware, userController.trackingMaster)

// ======================
// WAREHOUSE MANAGEMENT
// ======================
route.get('/warehouse', auth,accessControlMiddleware, userController.warehouse)
route.post('/add_warehouse', auth, userController.addWarehouse)
route.get('/api/warehouses/:id', userController.getapiWarehouseId)
route.put('/api/warehouses/:id', auth, userController.putapiWarehouseId)
route.get('/get_warehouse_addresses', auth, userController.getWarehouseAddress)
route.get('/get-warehouses-by-client/ecom',auth, userController.getWarehousebyClientEcom)
route.get('/get-warehouses-by-client/express',auth, userController.getWarehousebyClientExpress)
route.get('/predispatch/api/location/:id', auth, userController.preDispatchapiLocationId)
route.get('/api/location/:id', auth, userController.apiLocationId)

// ======================
// PINCODE SERVICES
// ======================
route.post('/validate-pincode', userController.validatePincode)
route.post('/validate-pincode-master', userController.validatePincodeMaster)
route.get('/delivery/pincode-check', auth, userController.delhiveryPincodeCheck)
route.get('/delivery_ltl/pincode-check', auth, userController.deliveryLtlPincodeCheck)
route.get('/expressbees/pincode-check', auth, userController.expressbeesPincodeCheck)
route.get('/dtdc/pincode-check', auth, userController.dtdcPincodeCheck)
route.get('/master-pincode', auth,accessControlMiddleware, userController.getMasterPincode)
route.post('/api/master-pincode', userController.apiMasterPincode)

// ======================
// CLIENT MANAGEMENT
// ======================
route.get('/client-management', auth, userController.clientManagement)
route.get('/client-onboarding', auth,accessControlMiddleware,  userController.getClientOnboarding)
route.get('/client-list', auth,accessControlMiddleware, userController.getClientList)
route.delete('/delete-client/:id', auth, userController.deleteClientId)
route.get('/api/client/:id', auth, userController.apiClientId)
route.delete('/api/client/:id', auth, userController.deleteapiClientId)
route.put('/api/client/:id/parental', upload.single('companyLogo'), auth, userController.apiClientIdParental)
route.put('/api/client/:id/departmental', auth, upload.single('companyLogo'), userController.apiClientIdDepartmental)
route.put('/api/clients/vas', userController.apiClientVas)
route.get('/api/client-gst-number', auth, userController.apiClientGstNumber)
route.get('/choose-user', auth, userController.chooseUser)
route.get('/choose-clientComp/:clientId', auth, userController.chooseClientCompClientId)
route.post('/new_client', auth, upload.any(), userController.newClient)
route.post('/predispatch/client_sign_in', auth, upload.any(), userController.preDispatchClientSignIn)

// Render pending users
route.get('/email-pending-users', async (req, res) => {
  try {
    const rows = await mySqlQury('SELECT * FROM users_pending ORDER BY created_at DESC');
    // rows is an array of pending users
    console.log(rows);
    res.render('pages/pendingUsers', { users: rows });
  } catch (err) {
    console.error('Error fetching pending users:', err);
    res.status(500).send('Server error');
  } 
});

route.post('/pending-user-action', async (req, res) => {
  const { id, action } = req.body;

  if (!id || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid payload.' });
  }

  try {
    await mySqlQury('START TRANSACTION');

    // Lock the pending row
    const rows = await mySqlQury(`SELECT * FROM users_pending WHERE id = ? FOR UPDATE`, [id]);
    if (!rows.length) {
      await mySqlQury('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Pending user not found.' });
    }

    const pending = rows[0];

    if (action === 'reject') {
      // Simple reject behavior: delete pending row (or you can mark status = 'rejected')
      await mySqlQury(`DELETE FROM users_pending WHERE id = ?`, [id]);
      await mySqlQury('COMMIT');
      return res.status(200).json({ success: true, message: 'User rejected successfully.' });
    }

    // ===== APPROVE FLOW =====
    const {
      name,
      email,
      password,           // assume already hashed in users_pending
      phone_no,
      monthly_parcels = 0,
      business_volume = 0,
      company_type = null,
      segment_type = null,
      organization = null
    } = pending;

    // Dup check
    const exists = await mySqlQury(
      `SELECT id FROM tbl_admin WHERE email = ? OR phone_no = ? LIMIT 1`,
      [email, phone_no]
    );
    if (exists.length > 0) {
      await mySqlQury('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Email or phone already exists.' });
    }

    // Get role_id for client role (client_id = 1 as per your code)
    const [roleRow] = await mySqlQury(
      `SELECT id FROM roles WHERE client_id = 1 AND name = 'client' LIMIT 1`
    );
    const role_id = roleRow?.id;
    if (!role_id) {
      await mySqlQury('ROLLBACK');
      return res.status(500).json({ success: false, message: 'Client role not configured.' });
    }

    // Insert into tbl_admin
    // NOTE: Following your original values: is_verified=1, is_active=0, level=2, parent_id=1
    const adminInsert = await mySqlQury(
      `INSERT INTO tbl_admin 
        (first_name, email, password, phone_no, organization, company_name, 
         is_verified, is_active, level, parent_id, role_id)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, 2, 1, ?)`,
      [name, email, password, phone_no, organization, organization, role_id]
    );

    const newUserId = adminInsert.insertId;

    // Insert into kyc_submissions
    await mySqlQury(
      `INSERT INTO kyc_submissions 
        (user_id, organization, monthly_parcels, business_volume, company_type, segment_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [newUserId, organization, monthly_parcels, business_volume, company_type, segment_type]
    );

    // Remove from pending
    await mySqlQury(`DELETE FROM users_pending WHERE id = ?`, [id]);

    await mySqlQury('COMMIT');
    return res.status(200).json({ success: true, message: 'User approved successfully.' });

  } catch (err) {
    console.error('pending-user-action error:', err);
    await mySqlQury('ROLLBACK');
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
});

 
// ======================
// KYC MANAGEMENT
// ======================
route.get('/kyc',kycAuth, userController.postKyc)
route.post('/submit-kyc',kycAuth, clientdocs, userController.postSubmitKyc)
route.post('/update-kyc-data',auth, accessControlMiddleware, clientdocs, userController.UpdateKycData)
route.post('/approve-client-kyc', userController.postApproveClientKyc)
route.get('/kyc-list', auth,accessControlMiddleware, userController.getKycList)
route.get('/api/client-data/:id', auth,accessControlMiddleware, userController.getClientDataById)
route.get('/client-data/:id', auth,accessControlMiddleware, userController.showClientData)

route.post('/kyc/verify', auth, userController.postKycVerify)
route.post('/client-kyc-verification',kycAuth, userController.postClientKycVerification)
route.post('/client-gstin-verification',kycAuth, userController.postClientGstinVerification)
// 
route.get('/api/client-detail/:id', async (req, res) => {
    try {
        const clientId = req.params.id;
        
        // Query to fetch admin data
        const adminQuery = `
            SELECT 
                id, first_name, last_name, email, country_code, phone_no, 
                role, role_name, client_name, client_id, is_active, user_type,
                reporting_user, reporting_id, logo_path, company_name, 
                is_verified, is_kyc_verified, is_kyc_submitted, organization,
                gst, payment_mode, monthly_parcels, company_type, verify_token,
                exp_volume, parent_id, level, role_id
            FROM tbl_admin 
            WHERE id = ?
        `;
        
        // Query to fetch KYC data
        const kycQuery = `
            SELECT 
                id, user_id, email, business_type, sub_type, selfie_path,
                aadhaar_number, aadhar_front_doc, pan_name, pan_number, pan_path,
                gst_number, gst_trade_name, gst_nature_of_business_activities,
                company_reg_number, company_reg_doc, cancelled_cheque_number,
                cancelled_cheque_doc, logo_path, gst_constitution_of_business,
                gst_path, created_at, submitted_at, submission_status,
                business_logo_path, registered_company_name, brand_name,
                company_email, website, company_type, organization,
                monthly_parcels, business_volume, segment_type, aadhar_back_doc
            FROM kyc_submissions 
            WHERE user_id = ?
        `;
        
        // Execute queries (adjust based on your database library)
        const [adminResults] = await mySqlQury(adminQuery, [clientId]);
        const [kycResults] = await mySqlQury(kycQuery, [clientId]);
        
        if (adminResults.length === 0) {
            return res.status(404).json({
                ok: false,
                message: 'Client not found'
            });
        }
        
        // Calculate monthly parcels bucket label
        const getMonthlyParcelsBucketLabel = (code) => {
            const buckets = {
                1: '0-500',
                2: '500-1000',
                3: '1000-5000',
                4: '5000+'
            };
            return buckets[code] || null;
        };
        
        const admin = adminResults[0];
        const kyc = kycResults.length > 0 ? kycResults[0] : null;
        
        res.json({
            ok: true,
            data: {
                admin: admin,
                kyc: kyc,
                derived: {
                    monthly_parcels_bucket_label: getMonthlyParcelsBucketLabel(admin.monthly_parcels)
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching client details:', error);
        res.status(500).json({
            ok: false,
            message: 'Internal server error'
        });
    }
});

// ============================================
// 2. UPDATE STATUS - For checkbox toggles
// ============================================
route.post('/api/admin/update-status', async (req, res) => {
    try {
        const { admin_id, field, value } = req.body;
        
        // Validate input
        if (!admin_id || !field || value === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Validate field name for security
        const allowedFields = ['is_active', 'is_verified', 'is_kyc_verified', 'is_kyc_submitted'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid field name'
            });
        }
        
        // Convert boolean to integer for database
        const dbValue = value ? 1 : 0;
        
        // Update query
        const updateQuery = `UPDATE tbl_admin SET ${field} = ? WHERE id = ?`;
        
        await mySqlQury(updateQuery, [dbValue, admin_id]);
        
        // Log the action (optional)
        console.log(`Status updated: Admin ID ${admin_id}, Field: ${field}, Value: ${value}`);
        
        res.json({
            success: true,
            message: 'Status updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status'
        });
    }
});

// ============================================
// 3. UPDATE BASIC INFO - For basic information form
// ============================================
route.post('/api/admin/update-basic-info', async (req, res) => {
    try {
        const {
            admin_id,
            first_name,
            last_name,
            email,
            country_code,
            phone_no,
            user_type
        } = req.body;
        
        // Validate required fields
        if (!admin_id || !first_name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        
        // Check if email already exists (exclude current user)
        const emailCheckQuery = 'SELECT id FROM tbl_admin WHERE email = ? AND id != ?';
        const [emailResults] = await mySqlQury(emailCheckQuery, [email, admin_id]);
        
        if (emailResults.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        
        // Update query
        const updateQuery = `
            UPDATE tbl_admin 
            SET first_name = ?, last_name = ?, email = ?, country_code = ?, 
                phone_no = ?, user_type = ?, updated_at = NOW()
            WHERE id = ?
        `;
        
        await mySqlQury(updateQuery, [
            first_name,
            last_name || '',
            email,
            country_code || '+91',
            phone_no || '',
            user_type || '',
            admin_id
        ]);
        
        res.json({
            success: true,
            message: 'Basic information updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating basic info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update basic information'
        });
    }
});

// ============================================
// 4. UPDATE COMPANY INFO - For company details form
// ============================================
route.post('/api/admin/update-company-info', async (req, res) => {
    try {
        const {
            admin_id,
            company_name,
            organization,
            gst,
            payment_mode,
            monthly_parcels,
            company_type
        } = req.body;
        
        // Validate required fields
        if (!admin_id) {
            return res.status(400).json({
                success: false,
                message: 'Admin ID is required'
            });
        }
        
        // Validate monthly_parcels if provided
        if (monthly_parcels && ![1, 2, 3, 4].includes(parseInt(monthly_parcels))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid monthly parcels value'
            });
        } 
        
        // Validate GST format if provided (basic validation)
        if (gst && gst.length > 0) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(gst)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid GST number format'
                });
            }
        }
        
        // Update query
        const updateQuery = `
            UPDATE tbl_admin 
            SET company_name = ?, organization = ?, gst = ?, payment_mode = ?, 
                monthly_parcels = ?, company_type = ?, updated_at = NOW()
            WHERE id = ?
        `;
        
        await mySqlQury(updateQuery, [
            company_name || '',
            organization || '',
            gst || '',
            payment_mode || '',
            monthly_parcels || null,
            company_type || '',
            admin_id
        ]);
        
        res.json({
            success: true,
            message: 'Company information updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating company info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update company information'
        });
    }
});

// ============================================
// 5. UPDATE KYC INFO - For KYC information form
// ============================================
route.post('/api/admin/update-kyc-info', async (req, res) => {
    try {
        const {
            kyc_id,
            business_type,
            sub_type,
            aadhaar_number,
            pan_number,
            pan_name
        } = req.body;
        
        // Validate required fields
        if (!kyc_id) {
            return res.status(400).json({
                success: false,
                message: 'KYC ID is required'
            });
        }
        
        // Validate Aadhaar number format if provided
        if (aadhaar_number && aadhaar_number.length > 0) {
            const aadhaarRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
            if (!aadhaarRegex.test(aadhaar_number.replace(/\s/g, ''))) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Aadhaar number format'
                });
            }
        }
        
        // Validate PAN number format if provided
        if (pan_number && pan_number.length > 0) {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(pan_number)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid PAN number format'
                });
            }
        }
        
        // Check if KYC record exists
        const checkQuery = 'SELECT id FROM kyc_submissions WHERE id = ?';
        const [checkResults] = await mySqlQury(checkQuery, [kyc_id]);
        
        if (checkResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'KYC record not found'
            });
        }
        
        // Update query
        const updateQuery = `
            UPDATE kyc_submissions 
            SET business_type = ?, sub_type = ?, aadhaar_number = ?, 
                pan_number = ?, pan_name = ?, updated_at = NOW()
            WHERE id = ?
        `;
        
        await mySqlQury(updateQuery, [
            business_type || '',
            sub_type || '',
            aadhaar_number || '',
            pan_number || '',
            pan_name || '',
            kyc_id
        ]);
        
        res.json({
            success: true,
            message: 'KYC information updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating KYC info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update KYC information'
        });
    }
});

// ============================================
// 6. ADDITIONAL UTILITY ROUTES
// ============================================

// Get all clients (for listing page)
route.get('/api/clients', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE 1=1';
        let queryParams = [];
        
        if (search) {
            whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company_name LIKE ?)';
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        if (status === 'active') {
            whereClause += ' AND is_active = 1';
        } else if (status === 'inactive') {
            whereClause += ' AND is_active = 0';
        }
        
        const countQuery = `SELECT COUNT(*) as total FROM tbl_admin ${whereClause}`;
        const dataQuery = `
            SELECT id, first_name, last_name, email, company_name, is_active, 
                   is_verified, is_kyc_verified, created_at
            FROM tbl_admin 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const [countResult] = await mySqlQury(countQuery, queryParams.slice(0, -2));
        const [dataResults] = await mySqlQury(dataQuery, queryParams);
        
        res.json({
            success: true,
            data: dataResults,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clients'
        });
    }
});

// Delete client (soft delete)
route.delete('/api/client/:id', async (req, res) => {
    try {
        const clientId = req.params.id;
        
        // Soft delete - update is_active to false instead of actual delete
        const updateQuery = 'UPDATE tbl_admin SET is_active = 0 WHERE id = ?';
        
        const [result] = await mySqlQury(updateQuery, [clientId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Client deactivated successfully'
        });
        
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete client'
        });
    }
});
// ----------------------------
// ======================
// FORWARDER/COURIER MANAGEMENT
// ======================
route.get('/forwarder-onboarding', auth,accessControlMiddleware, userController.getforwarderOnboarding)
route.get('/forwarder-list', auth,accessControlMiddleware, userController.getforwarderList)
route.get('/forwarder_onboarding', auth, userController.forwarderOnboarding)
route.post('/predispatch/forwarder_onboarding', auth, upload.any(), userController.predispatchForwarderOnboarding)
route.post('/api/forwarder/onboard/ltl', auth, upload.any(), userController.apiForwarderOnboardLtl)
route.post('/api/forwarder/onboard/express', auth, upload.any(), userController.apiForwarderOnboardExpress)
route.post('/api/forwarder/onboard/ecom', auth, upload.any(), userController.apiForwarderOnboardEcom)
route.post('/predispatch/forwarder_onboarding_stand', auth, upload.any(), userController.predispatchforOnboardingStand)
route.get('/get-forwarders', userController.getForwarders)
route.post('/get_forwarder_details', userController.postgetForwarderDetails)
route.post('/api/bulk-forwarding-partners', auth, userController.apiBulkForwardingPartners)
route.get('/api/forwarding-partners', auth, userController.apiForwardingPartners)
route.get('/api/courier/:id', userController.apiCourierId)
route.put('/api/courier/:id', auth, upload.any(), userController.putapiCourierId)
route.delete('/courier/delete/:id', auth, userController.postCourierDeleteId)
route.post('/forwarder_update/:forwarderId', userController.postForwarderUpdate)

// Forwarder Contacts
route.get('/api/forwarder/contacts/:id', userController.forwarderContactsId)
route.put('/api/forwarder/contacts/:id', userController.putapiforContactsId)

// Forwarder Charges
route.get('/api/forwarder/charges/:id', userController.apiforChargesId)
route.get('/api/express/add-charges/:id', userController.apiExpressAddchargeId)
route.get('/api/forwarder/unified-data/:id', userController.apiForwarderUnifiedData)
route.put('/api/courier/charges/:id', userController.apiCourierChargeId)

// ======================
// AGGREGATOR MANAGEMENT
// ======================
route.get('/aggrigator-onboarding', auth,accessControlMiddleware, userController.aggrigatorOnboarding)
route.post('/predispatch/Aggrigator_onboarding', auth, upload.any(), userController.predispatchAggrigatorOnboarding)
route.post("/predispatch/Aggrigator_onboarding_std", auth, upload.any(), userController.predispatchAggOnStd)
route.get('/aggrigator-list', auth,accessControlMiddleware, userController.getAggrigatorList)
// route.get('/aggrigator-list', auth, userController.getaggritorList)
route.get('/aggrigator-by-client/:clientId', auth, userController.getAggByClientId)
route.get('/api/aggrigator/:id', userController.getapiAggrigatorId)
route.put('/api/aggrigator/:id', auth, upload.any(), userController.putapiAggrigatorId)
route.delete('/api/aggrigator/:id', auth, userController.apiAggrigatorId)
route.post('/save-agg-to-client', auth, userController.postSaveAggToClient)
route.post('/aggrigator/update-status', auth, upload.any(), userController.postAggUpdateStatus)
route.post('/aggrigator/upload-pincode-csv', auth, upload.any(), userController.postAggUploadPincode)
route.post('/api/aggregator/toggle-recommendation', auth, userController.postAggToggleRecommendation)
route.get('/api/package/express-rate-list/:courierId', auth, userController.apiPackageExpressRateList)
route.get('/api/package/ecom-rate-list/:courierId', auth, userController.apiPackageEcomRateList)

// ======================
// RATE MANAGEMENT
// ======================
route.get('/api/calculate-express-rate', auth, userController.apiCalculateExpressRate)
route.get('/api/calculate-ecom-rate', auth, userController.apiCalculateEcomRate)
route.get('/api/standard-tat/:vendorId', userController.apiStandardTatVendorId)
route.post('/api/standard-tat/save', userController.apiStandardTatSave)
route.get('/api/standard-zone-mapping/:vendorId', userController.apiStandardZoneMapVendor)
route.post('/api/standard-zone-mapping/save', userController.apiStandardZoneMapSave)
route.get('/api/ltl-zone-mapping/:vendorId', userController.apiLtlZoneMapVendorId)
route.post('/api/ltl-zone-mapping/save', userController.apiLtlZoneMapSave)
route.get('/api/vendor-rate-list/ltl/:vendorId', userController.apiVendorRateListLtlVendorId)
route.get('/api/ltl-rate-list/:courierId', userController.apiLtlRateListCourierId)
route.get('/api/express-rate-list/:courierId', userController.apiExpressRateListCourierId)
route.put('/api/express-rate-list/:courierId', userController.apiputExpressrateCourierId)
route.get('/api/vendor-tat/ltl/:vendorId', userController.apiVendorTatLtl)
route.post('/api/vendor-tat/ltl/save', userController.apiVendorTatLtlSave)
route.post('/api/vendor-rate-list/ltl/save', userController.apiVendorRateListLtl)
route.get('/api/standard-rate-list/:vendorId', userController.getapiStandardRateList)
route.post('/api/standard-rate-list/:vendorId', userController.postapiStandardRateList)

// ======================
// BILLING & COD ROUTES
// ======================
route.get('/billing-reports', auth,accessControlMiddleware, userController.billingReport)
route.get('/billingDateFilter', userController.billingDataFilter)
route.get('/billingDateFilterForDonloadCSV', userController.billingDateFilterForDonloadCSV)
route.get('/downloadOldInvoiceCSV', userController.downloadOldInvoiceCSV)
route.get('/cod-dashboard', auth, userController.getCodDashboard)
route.get('/cod-summary', auth,accessControlMiddleware, userController.getCodSummary)
route.post("/api/ecom-cod-summary", userController.getEcomCodSummaryv2);
//order Summary Routes start here
route.post("/api/cod-summary", userController.getCodSummaryv1);
route.post("/upload-remittance", upload2.single("file"), userController.postUploadRemittance)
route.get('/get-utr-data', userController.getUtrData)
route.get('/bank-reconsilation', auth,accessControlMiddleware, userController.getBankReconsilation)
route.get('/to-be-remitted', auth,accessControlMiddleware, userController.getToBeRemitted)
route.get('/remitted', auth,accessControlMiddleware, userController.getRemitted)



route.post("/bank-remitence", auth, userController.getBankRemitence);
route.post("/bankrecovspoid", auth, userController.getBankRecovSpoid);
route.post("/api/bank-recovery/add", auth, userController.addBankRecoveryRecord);
route.post("/api/bank-recovery/upload", upload2.single('file'), auth, userController.uploadBankRecoveryExcel);

route.get('/billclientdata', auth, userController.billclientdata)

// ======================
// WALLET MANAGEMENT
// ======================
route.get("/check-wallet-amount", userController.chekWalletAmount)
route.post("/update-wallet", userController.updateWallet)
route.get('/domestic-wallet', auth,accessControlMiddleware, userController.domesticWallet)
route.post('/api/phonepay/initiate-payment', auth, userController.apiPhonepayInitiatePayment)
route.get('/api/phonepay/callback/:userId/:merchantOrderId', userController.apiPhonepayMerchantOrderId)
route.post('/api/whatsapp/initiate-payment', auth, userController.apiWhatsappInitiatePayment)
route.get('/api/whatsapp/callback/:userId/:merchantOrderId', userController.apiWhatsappUseridMerchantOrderId)

// ======================
// USER MANAGEMENT
// ======================
route.get('/user-management', auth,accessControlMiddleware,  userController.userManagement)
route.get('/admin/view/:id', userController.adminViewId)
route.post('/admin/edit', upload.any(),accessControlMiddleware, userController.adminEdit)
route.post('/admin/deactivate',auth,accessControlMiddleware, userController.adminDeactivate)
route.get('/permission-management', auth, userController.permissionManagement)
route.post('/permission_control', userController.permissionControl)
route.get('/api/getReportingUsers/:clientId', userController.apiGetReportingUsersClientId)
route.get('/api/getReportingUsers/:clientId', userController.apigetReportingUserClientid)

// ======================
// ROLE MANAGEMENT
// ======================
route.get('/role-management', auth, accessControlMiddleware, userController.getRoleManagement)
route.get('/manage-role', auth, accessControlMiddleware, userController.getManageRole)
route.post('/api/roles', auth, accessControlMiddleware, userController.postApiRoles)
route.patch('/api/roles/:id', auth, accessControlMiddleware, userController.patchApiRolesid)
route.delete('/api/roles/:id', auth, accessControlMiddleware, userController.deleteApiRolesId)

// ======================
// REPORTS
// ======================
route.get('/awb-report', auth, userController.getMasterDocket)
route.get('/custom-report', auth, userController.getCustomReport)
route.get('/master-docket', auth,accessControlMiddleware, userController.getMasterDocket2)
route.get('/cod-reports', auth, userController.codReports)
route.post('/get-orders-rto', auth, userController.getOrdersRto)
// route.post('/getOrders', auth, userController.getOrders)
route.get("/download-excel", userController.downloadExcel)
// Delete aggregator route


route.post('/api/logistic-partner/ecom', async (req, res) => {
  const { global_additional_charges, slab_inputs, volumetric_factor, courier_id, noOfShipment } = req.body;
  console.log("jdhsjdhsjreq body",req.body)
  console.log("global_additional_charges jhajd", global_additional_charges);
  const nestedSlabs = unflattenSlabInputs(slab_inputs);
  console.log("business_volume", noOfShipment);


  console.log(JSON.stringify(nestedSlabs, null, 2));
  const zoneRateAndslabAdd = nestedSlabs; // Use as object, not string
  console.log("volumetric_factorsas", volumetric_factor);
  console.log("courier_idsas", courier_id);
  

  // Start MySQL transaction
  await mySqlQury('START TRANSACTION');
  try {
    // 1. Get the courier name and tagged_api from tbl_courier_details
    const courierRows = await mySqlQury(
      'SELECT company_name, Tagged_api FROM tbl_courier_details WHERE id = ?',
      [courier_id]
    );
    if (!courierRows || courierRows.length === 0) {
      await mySqlQury('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Invalid courier_id' });
    }
    const lp_name = courierRows[0].company_name;
    const tagged_api = courierRows[0].Tagged_api;

    // 2. Insert into tbl_logistics_partner
    const result = await mySqlQury(
      `INSERT INTO tbl_logistics_partner 
        (tagged_api, courier_id, volumetric_factor, packet_shipment, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [tagged_api, courier_id, volumetric_factor, noOfShipment, lp_name]
    );
    console.log("resulty in the ecom",result)
    const lp_id = result.insertId;

    // 3. Insert global_additional_charges into tbl_exp_lp_additional_charges
    if (Array.isArray(global_additional_charges)) {
      for (const charge of global_additional_charges) {
        const {
          charge_name,
          calculation_based_on_min,
          min_value,
          calculation_based_on_max,
          max_value,
          condition_based,
          chargable_value_type
        } = charge;

        await mySqlQury(
          `INSERT INTO tbl_ecom_lp_additional_charges 
            (lp_id, charge_name, calculation_based_on_min, calculation_based_on_max, min_value, max_value, condition_based, chargable_value_type, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            lp_id,
            charge_name || null,
            calculation_based_on_min || null,
            calculation_based_on_max || null,
            min_value || null,
            max_value || null,
            condition_based || null,
            chargable_value_type || null
          ]
        );
      }
    }

    // 4. Insert zones_input into tbl_exp_lp_zones_rates
    if (zoneRateAndslabAdd && Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        if (slab && slab.zones_input) {
          for (const [zone_name, zone_value] of Object.entries(slab.zones_input)) {
            await mySqlQury(
              `INSERT INTO tbl_ecom_lp_zones_rates (lp_id, zone_name, zone_value, created_at, updated_at)
               VALUES (?, ?, ?, NOW(), NOW())`,
              [lp_id, zone_name, zone_value]
            );
          }
        }
      }
    }

    // 5. Insert slab_additional into tbl_exp_lp_slab_add_charges
    if (zoneRateAndslabAdd && Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        if (slab && Array.isArray(slab.slab_additional)) {
          for (const addObj of slab.slab_additional) {
            if (addObj && addObj.input) {
              for (const [zone_name, amount] of Object.entries(addObj.input)) {
                await mySqlQury(
                  `INSERT INTO tbl_ecom_lp_slab_add_charges (lp_id, zone_name, amount, created_at, updated_at)
                   VALUES (?, ?, ?, NOW(), NOW())`,
                  [lp_id, zone_name, amount]
                );
              }
            }
          }
        }
      }
    }

    // Commit transaction if all is well
    await mySqlQury('COMMIT');
    res.json({ success: true, message: "Express onboarding saved!", id: lp_id });
  } catch (err) {
    console.error(err);

    // Rollback transaction on error
    await mySqlQury('ROLLBACK');

    // Send error message to UI if available, else generic
    let errorMessage = "Server error";
    if (err && err.message) {
      errorMessage = err.message;
    }
    res.status(500).json({ success: false, message: errorMessage });
  }
});
function unflattenSlabInputs(flat) {
  const result = { slabs: [] };
  for (const key in flat) {
    const value = flat[key];
    // slabs[0][zones_input][A]
    let match = key.match(/^slabs\[(\d+)\]\[([^\]]+)\]\[([^\]]+)\]$/);
    if (match) {
      const [_, slabIdx, group, subkey] = match;
      if (!result.slabs[slabIdx]) result.slabs[slabIdx] = {};
      if (!result.slabs[slabIdx][group]) result.slabs[slabIdx][group] = {};
      // Convert value to number if possible
      const num = Number(value);
      result.slabs[slabIdx][group][subkey] = isNaN(num) ? value : num;
      continue;
    }
    // slabs[0][slab_additional][0][input][A]
    match = key.match(/^slabs\[(\d+)\]\[slab_additional\]\[(\d+)\]\[([^\]]+)\]\[([^\]]+)\]$/);
    if (match) {
      const [_, slabIdx, addIdx, inputType, subkey] = match;
      if (!result.slabs[slabIdx]) result.slabs[slabIdx] = {};
      if (!result.slabs[slabIdx].slab_additional) result.slabs[slabIdx].slab_additional = [];
      if (!result.slabs[slabIdx].slab_additional[addIdx]) result.slabs[slabIdx].slab_additional[addIdx] = {};
      if (!result.slabs[slabIdx].slab_additional[addIdx][inputType]) result.slabs[slabIdx].slab_additional[addIdx][inputType] = {};
      const num = Number(value);
      result.slabs[slabIdx].slab_additional[addIdx][inputType][subkey] = isNaN(num) ? value : num;
    }
  }
  return result;
}


// ======================
// API INTEGRATIONS
// ======================
route.get('/api-integration', auth, userController.apiIntegration)
route.get('/api-token-for-expressbees', auth, userController.apiTokenForExpressbees)
route.get('/api-token-for-delhivery', userController.apiTokenForDelhivery)
route.get('/get-api-token', auth, userController.getApiToken)
route.post('/call-delhivery-api', auth, uploadInvoice.any(), userController.callDeliveryapi)
route.post('/woocommerce-data', userController.postWoocommereData)
route.post('/api/logistic-partner/express', userController.apiLogisticPartnerExpress)
route.post('/api/onboarding/ecom', userController.apiOnboardingEcom)
route.post('/api/delhivery-create-order', userController.apiDelhiveryCreateOrder)
route.post('/api/expressbees-create-order', auth, userController.expressCreateOrder)
route.post('/api/dtdc-create-order', auth, userController.dtdcCreateOrder)
route.post('/api/expressbees-create-order-ecom', auth, userController.expressBeesCreateOrderEcom)
route.post('/api/delhivery-create-order-ecom', auth, userController.delhiveryCreateOrderEcom)
route.get('/ecom/shop-integration', auth,accessControlMiddleware, userController.eshopIntegration)
route.post('/api/shopify/connect',auth,userController.eshopIntegrationDataSave)

// ======================
// CHAT & WHATSAPP
// ======================
route.get('/chat-ui', auth, userController.getchatUi)
route.get('/chat-ui-setting', auth, userController.getChatUiSetting)
route.post('/api/whatsapp/subscribe', auth, userController.postapiWhatsappSubs)
route.post('/api/whatsapp/update-status', auth, userController.postapiUpdateStatus)
route.post('/api/whatsapp/toggle-activation', auth, userController.postapiWhatsappToggleActvation)
route.get('/api/customers/:customer_phone/:clientId/orders', userController.getapiCustomerPhoneOrders)
route.get('/api/orders/:orderId/:clientId/messages', userController.apiOrdersClientMassage)
route.post('/api/messages', userController.postapiMassages)

// ======================
// MISC ROUTES
// ======================
route.get('/test-route', (req, res) => {
  res.json({ message: 'Route is working!' })
})
route.get('/get-po/:poNo', auth, userController.getPo)
route.get('/getTaggedApi', userController.getTaggedApi)
route.get('/sellerDetails/:client_id',auth, userController.sellerDetailsClientId)
route.post('/api/update-order-status', userController.apiUpdateOrderStatus)
route.get('/helpdesk-tickets', auth, userController.helpdeskTickets)
route.get('/get-pickhub-code', userController.getPickupCode)
route.get('/api/box-dimensions/:ref_number', userController.apiBoxDimensionREfNumber)
route.get('/api/box-dimensions-ecom/:ref_number', userController.apiBoxDimensionREfNumberEcom)
route.get('/fetch-volumetric-data', userController.fetchVloumetricData)
route.get('/get_aggrigator_details', auth, userController.getAggrigatorDetails)
route.get('/get-aggregators/:clientId', auth, userController.getAggrigatorClientId)
route.get('/api/aggrigator-partners/pincode', auth, userController.apiAggrigatorPartnersPincode)
route.get('/api/clients', auth, userController.apiClients)
route.post('/api/client-products', auth, userController.postapiClientOrder)
route.post('/get-addresses/ecom', auth, userController.getAddressesEcom)

route.post('/api/get-forwarder-options', auth, userController.apigetForwarderOptions)
route.get('/predispatch/edit/:id', auth, userController.predispatchEditId)
route.post('/update-return-status', auth, userController.postUpdateReturnStatus)
route.post('/update-pickup-status', auth, userController.updatePickupStatus)
route.post('/predispatch/getCitiesAndUpdateStates', userController.postpredispatchGetcitiesAndUpdateStatus)
route.post('/predispatch/getStatesBasedOnCities', userController.postpreStateBasedOnClients)
route.get("/getCities", auth, userController.getCities)
route.post('/upload-excel', uploadLR.any(), userController.postUploadExcel)

// ======================
// SERVICE TYPE ROUTES
// ======================
route.get('/ltl', userController.getLtl)
route.get('/express', auth,enforceCourierAccess, userController.getExpress)
route.get('/ecom', auth, enforceCourierAccess, userController.getEcom)
route.get('/ltl/create-order', userController.getLtlCreateOrder)
route.get('/express/create-order', auth,accessControlMiddleware, userController.getExpressCreateOrder)
route.get('/ecom/create-order', auth,accessControlMiddleware, userController.getEcomCreateOrder)

// /api/clients
route.get('/api/all-clients', auth, async (req, res) => {
  const { id: currentUserId, level, parent_id } = req.user || {};

  try {
    // If this is a level-4 user, pivot to their parent (client) id
    const rootId = Number(level) === 4 ? Number(parent_id) : Number(currentUserId);

    if (!rootId) {
      return res.status(400).json({ error: 'Client linkage is missing for this user.' });
    }

    // Recursive CTE to fetch the root (self/client) + nested children (levels 2,3)
    const query = `
      WITH RECURSIVE nested_users AS (
        -- 1) Seed with the root (self or parent client)
        SELECT 
          id, parent_id, level,
          TRIM(CONCAT_WS(' ', first_name, NULLIF(last_name, ''))) AS full_name,
          company_name
        FROM tbl_admin
        WHERE id = ?

        UNION ALL

        -- 2) Bring in nested children (only client/sub-client levels)
        SELECT 
          a.id, a.parent_id, a.level,
          TRIM(CONCAT_WS(' ', a.first_name, NULLIF(a.last_name, ''))) AS full_name,
          a.company_name
        FROM tbl_admin a
        INNER JOIN nested_users nu ON a.parent_id = nu.id
        WHERE a.level IN (2, 3)
      )
      -- 3) Final selection (optionally dedupe/ordering)
      SELECT id, parent_id, level, full_name, company_name
      FROM nested_users
      ORDER BY level, full_name;
    `;

    const clients = await mySqlQury(query, [rootId]);
    return res.json({ clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ error: 'Failed to fetch clients' });
  }
});
 
// /api/clients/:clientId/users
route.get('/api/clients/:clientId/users', auth, async (req, res) => {
  const { clientId } = req.params;

  try {
    const query = `
      SELECT id, parent_id, level,
             CONCAT(first_name, ' ', last_name) AS full_name
      FROM tbl_admin
      WHERE parent_id = ? 
        AND level = 4
    `;

    const users = await mySqlQury(query, [clientId]);
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


route.get('/express/calculator', async (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  const role = req.user?.role || req.session?.role || null;
  const clientid = req.user?.selectedClientId || null;

  let walletBalance = 0;
  const wallet = await mySqlQury(`SELECT total_amount FROM tbl_wallet WHERE user_id = ?`, [clientid]);
  walletBalance = (wallet.length > 0) ? wallet[0].total_amount : 0;

  res.render('pages/express/calculator', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
    role: role,
    walletBalance: walletBalance
  });
});

route.get('/express/package', auth,accessControlMiddleware, async (req, res) => {
  try {
  
    const clientid = req.user?.selectedClientId || null;
    console.log("clientidexpresspackage",req.user)
    let walletBalance = 0;
    const wallet = await mySqlQury(`SELECT total_amount FROM tbl_wallet WHERE user_id = ?`, [clientid]);
    walletBalance = (wallet.length > 0) ? wallet[0].total_amount : 0;
    res.render('pages/express/package', {
      title: 'Client Package Manager',
      bodyClass: 'profile-page',
      activePage: 'client-package',
      role: req.user.role,
      level: req.user.level,
     
      walletBalance: walletBalance
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading packages');
  }
});
route.get('/ecom/package', auth,accessControlMiddleware, async (req, res) => {
  try {

    const clientid = req.user?.selectedClientId || null;
    console.log("clientidecompackage",req.user)
    let walletBalance = 0;
    const wallet = await mySqlQury(`SELECT total_amount FROM tbl_wallet WHERE user_id = ?`, [clientid]);
    walletBalance = (wallet.length > 0) ? wallet[0].total_amount : 0;
    res.render('pages/ecom/package', {
      title: 'Client Package Manager',
      bodyClass: 'profile-page',
      activePage: 'client-package',
      role: req.user.role,
      level: req.user.level,
 
      walletBalance: walletBalance
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading packages');
  }
});
const getPlanName = (volumeId) => {
  const map = {
    1: 'basic',
    2: 'basic-lite',
    3: 'lite-pro',
    4: 'premium',
    5: 'advance',
    6: 'advance-pro',
    7: 'enterprise'
  };
  return map[volumeId] || 'basic';
};

const getPlanNameEcom = (packetShipmentId) => {
  const map = {
    1: '0 - 500 Shipment',
    2: '500 - 1000 Shipment',
    3: '1000 - 1500 Shipment',
    4: '1500 - 2000 Shipment',
    5: '2000 - 2500 Shipment',
    6: '2500 - 3000 Shipment',
    7: '3000 - 3500 Shipment',
    8: '3500 - 4000 Shipment',
    9: '4000 Above'
  };
  return map[packetShipmentId] || '0 - 500 Shipment';
};
// GET /package/client/:id?   (id optional; only used by Super Admin)
// route.get('/package/client/:_ignored?', auth, async (req, res) => {
//   try {
//     const targetClientId = Number(req.user?.selectedClientId);

//     if (!Number.isInteger(targetClientId) || targetClientId <= 0) {
//       return res.status(400).json({ error: 'Invalid selected client id.' });
//     }

//     const sql = `
//     SELECT 
//       lp.id AS aggrigator_id,
//       lp.name AS courier_name,
//       lp.aggrigator_type,
//       lp.status,
//       lp.business_volume,
//       clp.status AS assigned_status,
//       clp.recommended,
//       c.tagged_api,
//       c.delhivery_api_variant
//     FROM tbl_client_lp clp
//     JOIN tbl_logistics_partner lp 
//       ON lp.id = clp.logictics_partner_id
//     JOIN tbl_courier_details c 
//       ON lp.courier_id = c.id 
//      AND c.courier_type = 'express'
//     WHERE clp.client_id = ?
//   `;
  

  

//     const result = await mySqlQury(sql, [targetClientId]);
//     console.log("result",result)

//     const onePackages = [];
//     const customPackages = [];
//     const courierData = {};

//     for (const row of result) {
//       const isOnePackage = row.aggrigator_type === 1;
//       const planName = isOnePackage ? getPlanName(row.business_volume) : 'custom';

//       if (!courierData[planName]) courierData[planName] = [];
//       courierData[planName].push({
//         name: row.courier_name,
//         active: row.assigned_status == 1,
//         client_id: targetClientId,
//         aggrigator_id: row.aggrigator_id,
//         recommended: row.recommended == 1,
//         tagged_api: row.tagged_api,
//         delhivery_api_variant: row.delhivery_api_variant
//       });

//       if (isOnePackage) {
//         if (!onePackages.includes(planName)) onePackages.push(planName);
//       } else {
//         if (!customPackages.includes(planName)) customPackages.push(planName);
//       }
//     }

//     return res.json({ onePackages, customPackages, courierData });
//   } catch (err) {
//     console.error('Error loading client package data:', err);
//     return res.status(500).json({ error: 'Error loading client package data' });
//   }
// });

// Ecom package route for packet shipments
// route.get('/ecom/package/client/:_ignored?', auth, async (req, res) => {
//   try {
//     const targetClientId = Number(req.user?.selectedClientId);
//     console.log("targetClientId",targetClientId)

//     if (!Number.isInteger(targetClientId) || targetClientId <= 0) {
//       return res.status(400).json({ error: 'Invalid selected client id.' });
//     }

//     const sql = `
//     SELECT 
//       lp.id AS aggrigator_id,
//       lp.name AS courier_name,
//       lp.aggrigator_type,
//       lp.status,
//       lp.packet_shipment,
//       clp.status AS assigned_status,
//       clp.recommended,
//       c.tagged_api,
//       c.delhivery_api_variant
//     FROM tbl_client_lp clp
//     JOIN tbl_logistics_partner lp 
//       ON lp.id = clp.logictics_partner_id
//     JOIN tbl_courier_details c 
//       ON lp.courier_id = c.id 
//      AND c.courier_type = 'ecom'
//     WHERE clp.client_id = ?
//   `;
  
  

//     const result = await mySqlQury(sql, [targetClientId]);
//     console.log("result",result)

//     const onePackages = [];
//     const customPackages = [];
//     const courierData = {};

//     for (const row of result) {
//       const isOnePackage = row.aggrigator_type === 1;
//       const planName = isOnePackage ? getPlanNameEcom(row.packet_shipment) : 'custom';

//       if (!courierData[planName]) courierData[planName] = [];
//       courierData[planName].push({
//         name: row.courier_name,
//         active: row.assigned_status == 1,
//         client_id: targetClientId,
//         aggrigator_id: row.aggrigator_id,
//         recommended: row.recommended == 1,
//         tagged_api: row.tagged_api,
//         delhivery_api_variant: row.delhivery_api_variant
//       });

//       if (isOnePackage) {
//         if (!onePackages.includes(planName)) onePackages.push(planName);
//       } else {
//         if (!customPackages.includes(planName)) customPackages.push(planName);
//       }
//     }

//     return res.json({ onePackages, customPackages, courierData });
//   } catch (err) {
//     console.error('Error loading ecom package data:', err);
//     return res.status(500).json({ error: 'Error loading ecom package data' });
//   }
// });

// EDIT 
route.post('/api/courier/toggle', auth,accessControlMiddleware, async (req, res) => {
  try {
    const { client_id, aggrigator_id, active } = req.body;
    await mySqlQury(
      `UPDATE tbl_client_lp 
       SET status = ?, disable_by_superadmin = ? 
       WHERE client_id = ? AND logictics_partner_id = ?`,
      [active ? 1 : 0, active ? 0 : 1, client_id, aggrigator_id]
      // If active is 1, disable_by_superadmin is 0; if active is 0, disable_by_superadmin is 1
    );
    res.json({ success: true, message: 'Status and disable_by_superadmin updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});
// Dashboard

// Status mapping for tbl_exp_lr
const statusMap = {
  0: "Cancelled",
  1: "RTD",
  2: "Picked Up",
  3: "In Transit",
  4: "Delivered",
  5: "RTO",
  7: "NDR",
  8: "Out for Delivery",
};

//logiitics partner this is the logistics which has package data

//express aggrigator/logistics/partner-rate-list
route.get('/api/express-lp-rate-list/:clientid/:logisticsId', async (req, res) => {
  try {
    const logisticsId = req.params.logisticsId;
    const clientId = req.params.clientid
    console.log("shabbar raza ansari",logisticsId,clientId);
    // console.log("jsdhjsdhsjd",dsjdjsd)
    // const courierId = 35;

    const [courierDetails] = await mySqlQury(
  `SELECT
     c.id AS courierId,
     lp.volumetric_factor,
     lp.parent_lp_id
   FROM tbl_logistics_partner lp
   LEFT JOIN tbl_courier_details c 
     ON lp.courier_id = c.id
   WHERE lp.id = ?
     AND c.courier_type = 'express'`,
  [logisticsId]
);

    console.log("skdhsjkdhs",courierDetails)
    const volumetric_factor = courierDetails ? courierDetails.volumetric_factor : null;

    // 1. Get all weight slabs for this courier
    const slabs = await mySqlQury(`
      SELECT slab_id, min_weight, max_weight, unit
      FROM tbl_exp_weightslabs
      WHERE courier_id = ?
    `, [courierDetails.courierId]);

    const formattedSlabs = [];
    console.log("slabs id",slabs)

    for (const slab of slabs) {
      const { slab_id: slabId, min_weight, max_weight, unit } = slab;

      // 2. Get zone rates for this weight slab
      const zoneRates = await mySqlQury(`
        SELECT zone_name, zone_value
        FROM tbl_exp_lp_zones_rates
        WHERE lp_id = ?
      `, [logisticsId]);

      const zones = {};
      zoneRates.forEach(rate => {
        zones[rate.zone_name] = parseFloat(rate.zone_value);
      });

   

     // Use the helper
  const slab_additional_charges = await getSlabAdditionalCharges({
    lpId: logisticsId,
    courierId: courierDetails.courierId,
    slabId
  });

      // 4. Push formatted slab
      formattedSlabs.push({
        min_weight,
        max_weight,
        unit,
        zones,
        slab_additional_charges
      });
    }

    // 5. Get global express additional charges
    const expressAdditionalCharges = await mySqlQury(`
      SELECT charge_id, charge_name, calculation_based_on_min, calculation_based_on_max, min_value, max_value, condition_based, chargable_value_type
      FROM tbl_exp_lp_additional_charges
      WHERE lp_id = ?
    `, [logisticsId]);

    res.json({
      slabs: formattedSlabs,
      express_additional_charges: expressAdditionalCharges,
      volumetric_factor

    });

  } catch (error) {
    console.error('Error fetching express rate list:', error);
    res.status(500).json({ error: 'Failed to fetch express rate list' });
  }
});
// Create/Update Express LP Rate List (POST for create, PUT for update)
route.post('/api/copy/express-lp-rate-list/:logisticsId/:clientId', auth, async (req, res) => {
  try {
    const { logisticsId, clientId } = req.params;
    console.log("req body",req.body)

    const {
      global_additional_charges = [],
      slab_inputs = {},
      volumetric_factor,
      business_volume,
    } = req.body;
    // console.log("jdgsjhdgshd",dsgdhsgdh)


    const nestedSlabs = unflattenSlabInputs(slab_inputs);
    const zoneRateAndslabAdd = nestedSlabs;
    console.log("zoneRateAnd slab",zoneRateAndslabAdd.slabs)

    // Start MySQL transaction
    await mySqlQury('START TRANSACTION');

    // 1. Get courier name and tagged_api from tbl_courier_details
    const [courierRows] = await mySqlQury(
      'SELECT * FROM tbl_logistics_partner WHERE id = ?',
      [logisticsId]
    );
    console.log("courier details",courierRows)
    if (!courierRows || courierRows.length === 0) {
      await mySqlQury('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Invalid courier_id' });
    }

    const lp_name = courierRows.name;
    const tagged_api = courierRows.tagged_api;
    const courier_id = courierRows.courier_id;
    // console.log("ghsaghgdhga",hdghsd)

    // 2. Insert new logistics partner (aggregator)
    const result = await mySqlQury(
      `INSERT INTO tbl_logistics_partner
        (tagged_api, courier_id, volumetric_factor, name, aggrigator_type,created_at, updated_at,parent_lp_id)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(),?)`,
      [tagged_api, courier_id, volumetric_factor, lp_name,0,logisticsId]
    );
    const lp_id = result.insertId;

    // 3. Insert into tbl_client_lp
    await mySqlQury(
      `INSERT INTO tbl_client_lp (client_id, logictics_partner_id, status, disable_by_superadmin, recommended)
       VALUES (?, ?, 1, 0, 0)`,
      [clientId, lp_id]
    );

    // 4. Insert global_additional_charges
    if (Array.isArray(global_additional_charges)) {
      for (const charge of global_additional_charges) {
        const {
          charge_name,
          calculation_based_on_min,
          min_value,
          calculation_based_on_max,
          max_value,
          condition_based,
          chargable_value_type
        } = charge;

        await mySqlQury(
          `INSERT INTO tbl_exp_lp_additional_charges
            (lp_id, charge_name, calculation_based_on_min, calculation_based_on_max, min_value, max_value, condition_based, chargable_value_type, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            lp_id,
            charge_name || null,
            calculation_based_on_min || null,
            calculation_based_on_max || null,
            min_value || null,
            max_value || null,
            condition_based || null,
            chargable_value_type || null
          ]
        );
      }
    }

    // 5. Insert zones_input
    if (zoneRateAndslabAdd && Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        if (slab && slab.zones_input) {
          for (const [zone_name, zone_value] of Object.entries(slab.zones_input)) {
            await mySqlQury(
              `INSERT INTO tbl_exp_lp_zones_rates (lp_id, zone_name, zone_value, created_at, updated_at)
               VALUES (?, ?, ?, NOW(), NOW())`,
              [lp_id, zone_name, zone_value]
            );
          }
        }
      }
    }

    // 6. Insert slab_additional
    if (zoneRateAndslabAdd && Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        if (slab && Array.isArray(slab.slab_additional)) {
          for (const addObj of slab.slab_additional) {
            if (addObj && addObj.input) {
              for (const [zone_name, amount] of Object.entries(addObj.input)) {
                await mySqlQury(
                  `INSERT INTO tbl_exp_lp_slab_add_charges (lp_id, zone_name, amount, created_at, updated_at)
                   VALUES (?, ?, ?, NOW(), NOW())`,
                  [lp_id, zone_name, amount]
                );
              }
            }
          }
        }
      }
    }

    // In the POST route handler, after inserting into tbl_client_lp, add the update query:
await mySqlQury(
  `UPDATE tbl_client_lp
   SET status = 0, disable_by_superadmin = 1, duplicate = 1
   WHERE logictics_partner_id = ? AND client_id = ?`,
  [logisticsId, clientId]
);



    // Commit transaction
    await mySqlQury('COMMIT');
    res.json({ success: true, message: 'Express LP Rate List saved successfully.', new_lp_id: lp_id });
  } catch (err) {
    console.error('Error saving express LP rate list:', err);
    await mySqlQury('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to save express LP rate list.' });
  }
});

//this i used for the update of the existing duplicate value
route.put('/api/update/express-lp-rate-list/:logisticsId/:clientId', auth, async (req, res) => {
  try {
    const { logisticsId: lp_id, clientId } = req.params;
    const {
      global_additional_charges = [],
      slab_inputs = {},
      volumetric_factor
    } = req.body;

    const nestedSlabs = unflattenSlabInputs(slab_inputs);
    const zoneRateAndslabAdd = nestedSlabs;

    await mySqlQury('START TRANSACTION');

    // 1. Delete existing additional charges for this LP
    await mySqlQury(`DELETE FROM tbl_exp_lp_additional_charges WHERE lp_id = ?`, [lp_id]);

    // 2. Delete existing zone rates
    await mySqlQury(`DELETE FROM tbl_exp_lp_zones_rates WHERE lp_id = ?`, [lp_id]);

    // 3. Delete existing slab additional charges
    await mySqlQury(`DELETE FROM tbl_exp_lp_slab_add_charges WHERE lp_id = ?`, [lp_id]);

    // 4. Re-insert global additional charges
    for (const charge of global_additional_charges) {
      const {
        charge_name,
        calculation_based_on_min,
        min_value,
        calculation_based_on_max,
        max_value,
        condition_based,
        chargable_value_type
      } = charge;

      await mySqlQury(
        `INSERT INTO tbl_exp_lp_additional_charges
         (lp_id, charge_name, calculation_based_on_min, calculation_based_on_max, min_value, max_value, condition_based, chargable_value_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          lp_id,
          charge_name || null,
          calculation_based_on_min || null,
          calculation_based_on_max || null,
          min_value || null,
          max_value || null,
          condition_based || null,
          chargable_value_type || null
        ]
      );
    }

    // 5. Re-insert zone rates
    if (Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        const zones = slab.zones_input || {};
        for (const [zone_name, zone_value] of Object.entries(zones)) {
          await mySqlQury(
            `INSERT INTO tbl_exp_lp_zones_rates (lp_id, zone_name, zone_value, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW())`,
            [lp_id, zone_name, zone_value]
          );
        }
      }
    }

    // 6. Insert slab_additional
    if (Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        if (Array.isArray(slab.slab_additional)) {
          for (const addObj of slab.slab_additional) {
            if (addObj && addObj.input) {
              for (const [zone_name, amount] of Object.entries(addObj.input)) {
                await mySqlQury(
                  `INSERT INTO tbl_exp_lp_slab_add_charges (lp_id, zone_name, amount, created_at, updated_at)
                   VALUES (?, ?, ?, NOW(), NOW())`,
                  [lp_id, zone_name, amount]
                );
              }
            }
          }
        }
      }
    }

    // 7. Conditionally update volumetric factor
    if (volumetric_factor) {
      await mySqlQury(
        `UPDATE tbl_logistics_partner SET volumetric_factor = ?, updated_at = NOW() WHERE id = ?`,
        [volumetric_factor, lp_id]
      );
    }

    await mySqlQury('COMMIT');
    res.json({ success: true, message: 'Express LP Rate List updated successfully.' });

  } catch (err) {
    await mySqlQury('ROLLBACK');
    console.error('Error updating express LP rate list:', err);
    res.status(500).json({ success: false, message: 'Failed to update express LP rate list.' });
  }
});
//ecom package rate list which shows on the ui of the ecom package
route.get('/api/ecom-lp-rate-list/:clientid/:logisticsId', async (req, res) => {
  try {
    const logisticsId = req.params.logisticsId;
    const clientId = req.params.clientid
    console.log("shabbar raza ansari",logisticsId,clientId);
    // console.log("jsdhjsdhsjd",dsjdjsd)
    // const courierId = 35;

    const [courierDetails] = await mySqlQury(
      `SELECT
     c.id AS courierId,
      lp.volumetric_factor,lp.parent_lp_id
    FROM tbl_logistics_partner lp
    LEFT JOIN tbl_courier_details c ON lp.courier_id = c.id
    WHERE lp.id = ?`,
    [logisticsId]
    );
    console.log("skdhsjkdhs",courierDetails)
    const volumetric_factor = courierDetails ? courierDetails.volumetric_factor : null;

    // 1. Get all weight slabs for this courier
    const slabs = await mySqlQury(`
      SELECT slab_id, min_weight, max_weight, unit
      FROM tbl_ecom_weightslabs
      WHERE courier_id = ?
    `, [courierDetails.courierId]);

    const formattedSlabs = [];
    console.log("slabs id",slabs)

    for (const slab of slabs) {
      const { slab_id: slabId, min_weight, max_weight, unit } = slab;

      // 2. Get zone rates for this weight slab
      const zoneRates = await mySqlQury(`
        SELECT zone_name, zone_value
        FROM tbl_ecom_lp_zones_rates
        WHERE lp_id = ?
      `, [logisticsId]);

      const zones = {};
      zoneRates.forEach(rate => {
        zones[rate.zone_name] = parseFloat(rate.zone_value);
      });

   

     // Use the helper
  const slab_additional_charges = await getSlabAdditionalChargesEcom({
    lpId: logisticsId,
    courierId: courierDetails.courierId,
    slabId
  });

      // 4. Push formatted slab
      formattedSlabs.push({
        min_weight,
        max_weight,
        unit,
        zones,
        slab_additional_charges
      });
    }

    // 5. Get global express additional charges
    const expressAdditionalCharges = await mySqlQury(`
      SELECT charge_id, charge_name, calculation_based_on_min, calculation_based_on_max, min_value, max_value, condition_based, chargable_value_type
      FROM tbl_ecom_lp_additional_charges
      WHERE lp_id = ?
    `, [logisticsId]);

    res.json({
      slabs: formattedSlabs,
      express_additional_charges: expressAdditionalCharges,
      volumetric_factor

    });

  } catch (error) {
    console.error('Error fetching express rate list:', error);
    res.status(500).json({ error: 'Failed to fetch express rate list' });
  }
});

// copy the ecom package rate list
route.post('/api/copy/ecom-lp-rate-list/:logisticsId/:clientId', auth, async (req, res) => {
  try {
    const { logisticsId, clientId } = req.params;
    console.log("req body",req.body)

    const {
      global_additional_charges = [],
      slab_inputs = {},
      volumetric_factor,
      business_volume,
    } = req.body;
    // console.log("jdgsjhdgshd",dsgdhsgdh)


    const nestedSlabs = unflattenSlabInputs(slab_inputs);
    const zoneRateAndslabAdd = nestedSlabs;
    console.log("zoneRateAnd slab",zoneRateAndslabAdd.slabs)

    // Start MySQL transaction
    await mySqlQury('START TRANSACTION');

    // 1. Get courier name and tagged_api from tbl_courier_details
    const [courierRows] = await mySqlQury(
      'SELECT * FROM tbl_logistics_partner WHERE id = ?',
      [logisticsId]
    );
    console.log("courier details",courierRows)
    if (!courierRows || courierRows.length === 0) {
      await mySqlQury('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Invalid courier_id' });
    }

    const lp_name = courierRows.name;
    const tagged_api = courierRows.tagged_api;
    const courier_id = courierRows.courier_id;
    // console.log("ghsaghgdhga",hdghsd)

    // 2. Insert new logistics partner (aggregator)
    const result = await mySqlQury(
      `INSERT INTO tbl_logistics_partner
        (tagged_api, courier_id, volumetric_factor, name, aggrigator_type,created_at, updated_at,parent_lp_id)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(),?)`,
      [tagged_api, courier_id, volumetric_factor, lp_name,0,logisticsId]
    );
    const lp_id = result.insertId;

    // 3. Insert into tbl_client_lp
    await mySqlQury(
      `INSERT INTO tbl_client_lp (client_id, logictics_partner_id, status, disable_by_superadmin, recommended)
       VALUES (?, ?, 1, 0, 0)`,
      [clientId, lp_id]
    );

    // 4. Insert global_additional_charges
    if (Array.isArray(global_additional_charges)) {
      for (const charge of global_additional_charges) {
        const {
          charge_name,
          calculation_based_on_min,
          min_value,
          calculation_based_on_max,
          max_value,
          condition_based,
          chargable_value_type
        } = charge;

        await mySqlQury(
          `INSERT INTO tbl_ecom_lp_additional_charges
            (lp_id, charge_name, calculation_based_on_min, calculation_based_on_max, min_value, max_value, condition_based, chargable_value_type, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            lp_id,
            charge_name || null,
            calculation_based_on_min || null,
            calculation_based_on_max || null,
            min_value || null,
            max_value || null,
            condition_based || null,
            chargable_value_type || null
          ]
        );
      }
    }

    // 5. Insert zones_input
    if (zoneRateAndslabAdd && Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        if (slab && slab.zones_input) {
          for (const [zone_name, zone_value] of Object.entries(slab.zones_input)) {
            await mySqlQury(
              `INSERT INTO tbl_ecom_lp_zones_rates (lp_id, zone_name, zone_value, created_at, updated_at)
               VALUES (?, ?, ?, NOW(), NOW())`,
              [lp_id, zone_name, zone_value]
            );
          }
        }
      }
    }

    // 6. Insert slab_additional
    if (zoneRateAndslabAdd && Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        if (slab && Array.isArray(slab.slab_additional)) {
          for (const addObj of slab.slab_additional) {
            if (addObj && addObj.input) {
              for (const [zone_name, amount] of Object.entries(addObj.input)) {
                await mySqlQury(
                  `INSERT INTO tbl_ecom_lp_slab_add_charges (lp_id, zone_name, amount, created_at, updated_at)
                   VALUES (?, ?, ?, NOW(), NOW())`,
                  [lp_id, zone_name, amount]
                );
              }
            }
          }
        }
      }
    }

    // In the POST route handler, after inserting into tbl_client_lp, add the update query:
await mySqlQury(
  `UPDATE tbl_client_lp
   SET status = 0, disable_by_superadmin = 1, duplicate = 1
   WHERE logictics_partner_id = ? AND client_id = ?`,
  [logisticsId, clientId]
);



    // Commit transaction
    await mySqlQury('COMMIT');
    res.json({ success: true, message: 'Express LP Rate List saved successfully.', new_lp_id: lp_id });
  } catch (err) {
    console.error('Error saving express LP rate list:', err);
    await mySqlQury('ROLLBACK');
    res.status(500).json({ success: false, message: 'Failed to save express LP rate list.' });
  }
});

//this i used for the update of the existing duplicate value of the ecom package rate list
route.put('/api/update/ecom-lp-rate-list/:logisticsId/:clientId', auth, async (req, res) => {
  try {
    const { logisticsId: lp_id, clientId } = req.params;
    const {
      global_additional_charges = [],
      slab_inputs = {},
      volumetric_factor
    } = req.body;

    const nestedSlabs = unflattenSlabInputs(slab_inputs);
    const zoneRateAndslabAdd = nestedSlabs;

    await mySqlQury('START TRANSACTION');

    // 1. Delete existing additional charges for this LP
    await mySqlQury(`DELETE FROM tbl_ecom_lp_additional_charges WHERE lp_id = ?`, [lp_id]);

    // 2. Delete existing zone rates
    await mySqlQury(`DELETE FROM tbl_ecom_lp_zones_rates WHERE lp_id = ?`, [lp_id]);

    // 3. Delete existing slab additional charges
    await mySqlQury(`DELETE FROM tbl_ecom_lp_slab_add_charges WHERE lp_id = ?`, [lp_id]);

    // 4. Re-insert global additional charges
    for (const charge of global_additional_charges) {
      const {
        charge_name,
        calculation_based_on_min,
        min_value,
        calculation_based_on_max,
        max_value,
        condition_based,
        chargable_value_type
      } = charge;

      await mySqlQury(
        `INSERT INTO tbl_ecom_lp_additional_charges
         (lp_id, charge_name, calculation_based_on_min, calculation_based_on_max, min_value, max_value, condition_based, chargable_value_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          lp_id,
          charge_name || null,
          calculation_based_on_min || null,
          calculation_based_on_max || null,
          min_value || null,
          max_value || null,
          condition_based || null,
          chargable_value_type || null
        ]
      );
    }

    // 5. Re-insert zone rates
    if (Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        const zones = slab.zones_input || {};
        for (const [zone_name, zone_value] of Object.entries(zones)) {
          await mySqlQury(
            `INSERT INTO tbl_ecom_lp_zones_rates (lp_id, zone_name, zone_value, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW())`,
            [lp_id, zone_name, zone_value]
          );
        }
      }
    }

    // 6. Insert slab_additional
    if (Array.isArray(zoneRateAndslabAdd.slabs)) {
      for (const slab of zoneRateAndslabAdd.slabs) {
        if (Array.isArray(slab.slab_additional)) {
          for (const addObj of slab.slab_additional) {
            if (addObj && addObj.input) {
              for (const [zone_name, amount] of Object.entries(addObj.input)) {
                await mySqlQury(
                  `INSERT INTO tbl_ecom_lp_slab_add_charges (lp_id, zone_name, amount, created_at, updated_at)
                   VALUES (?, ?, ?, NOW(), NOW())`,
                  [lp_id, zone_name, amount]
                );
              }
            }
          }
        }
      }
    }

    // 7. Conditionally update volumetric factor
    if (volumetric_factor) {
      await mySqlQury(
        `UPDATE tbl_logistics_partner SET volumetric_factor = ?, updated_at = NOW() WHERE id = ?`,
        [volumetric_factor, lp_id]
      );
    }

    await mySqlQury('COMMIT');
    res.json({ success: true, message: 'Express LP Rate List updated successfully.' });

  } catch (err) {
    await mySqlQury('ROLLBACK');
    console.error('Error updating express LP rate list:', err);
    res.status(500).json({ success: false, message: 'Failed to update express LP rate list.' });
  }
});
async function getSlabAdditionalChargesEcom({ lpId = null, courierId = null, slabId = null}) {
  let slab_additional_charges = [];

 
    // Get description, weight, unit from courier table
    const slabAdditionalChargesRaw = await mySqlQury(`
      SELECT charge_id, description, weight, unit
      FROM tbl_ecom_slab_additional_charges
      WHERE courier_id = ? AND weight_slab_id = ?
    `, [courierId, slabId]);

    for (const charge of slabAdditionalChargesRaw) {
      // Get amounts from LP table
      const amountsRaw = await mySqlQury(`
        SELECT zone_name, amount
        FROM tbl_ecom_lp_slab_add_charges
        WHERE lp_id = ?
      `, [lpId]);

      const amounts = {};
      amountsRaw.forEach(item => {
        amounts[item.zone_name] = parseFloat(item.amount);
      });

      slab_additional_charges.push({
        desc: charge.description,
        weight: charge.weight,
        unit: charge.unit,
        amounts
      });
    }
 

  return slab_additional_charges;
}


// update here the the using the put

// Helper to get slab additional charges for a given LP or courier
async function getSlabAdditionalCharges({ lpId = null, courierId = null, slabId = null}) {
  let slab_additional_charges = [];

 
    // Get description, weight, unit from courier table
    const slabAdditionalChargesRaw = await mySqlQury(`
      SELECT charge_id, description, weight, unit
      FROM tbl_exp_slab_additional_charges
      WHERE courier_id = ? AND weight_slab_id = ?
    `, [courierId, slabId]);

    for (const charge of slabAdditionalChargesRaw) {
      // Get amounts from LP table
      const amountsRaw = await mySqlQury(`
        SELECT zone_name, amount
        FROM tbl_exp_lp_slab_add_charges
        WHERE lp_id = ?
      `, [lpId]);

      const amounts = {};
      amountsRaw.forEach(item => {
        amounts[item.zone_name] = parseFloat(item.amount);
      });

      slab_additional_charges.push({
        desc: charge.description,
        weight: charge.weight,
        unit: charge.unit,
        amounts
      });
    }
 

  return slab_additional_charges;
}
// update the express rate list package forwarder
route.put('/api/package/express-rate-list/:courierId', async (req, res) => {
  try {
    const courierId = req.params.courierId;
    const { slabs } = req.body;
    mySqlQury('START TRANSACTION');

    // 1. Delete existing data for this courier
    await mySqlQury('DELETE FROM tbl_exp_slab_additionalamounts WHERE additional_charge_id IN (SELECT charge_id FROM tbl_exp_slab_additional_charges WHERE courier_id = ?)', [courierId]);
    await mySqlQury('DELETE FROM tbl_exp_slab_additional_charges WHERE courier_id = ?', [courierId]);
    await mySqlQury('DELETE FROM tbl_exp_zones_rates WHERE courier_id = ?', [courierId]);
    await mySqlQury('DELETE FROM tbl_exp_weightslabs WHERE courier_id = ?', [courierId]);

    // 2. Insert new slabs and related data
    for (const slab of slabs) {
      const { weightSlab, zones, additionalCharges } = slab;
      // Insert into tbl_exp_weightslabs
      const result = await mySqlQury(
        'INSERT INTO tbl_exp_weightslabs (courier_id, min_weight, max_weight, unit) VALUES (?, ?, ?, ?)',
        [courierId, weightSlab.min, weightSlab.max, weightSlab.unit]
      );
      const slabId = result.insertId;

      // Insert zones for this slab
      for (const [zoneName, zoneValue] of Object.entries(zones)) {
        await mySqlQury(
          'INSERT INTO tbl_exp_zones_rates (courier_id, weight_slab_id, zone_name, zone_value) VALUES (?, ?, ?, ?)',
          [courierId, slabId, zoneName, zoneValue]
        );
      }

      // Insert additional charges for this slab
      if (additionalCharges && additionalCharges.length > 0) {
        for (const charge of additionalCharges) {
          const { desc, weight, unit, amounts } = charge;
          // Insert into tbl_exp_slab_additional_charges
          const addChargeResult = await mySqlQury(
            'INSERT INTO tbl_exp_slab_additional_charges (courier_id, weight_slab_id, description, weight, unit) VALUES (?, ?, ?, ?, ?)',
            [courierId, slabId, desc, weight, unit]
          );
          const chargeId = addChargeResult.insertId;

          // Insert zone-wise amounts for this charge
          for (const [zoneName, amount] of Object.entries(amounts)) {
            await mySqlQury(
              'INSERT INTO tbl_exp_slab_additionalamounts (additional_charge_id, zone_name, amount) VALUES (?, ?, ?)',
              [chargeId, zoneName, amount]
            );
          }
        }
      }
    }
    mySqlQury('COMMIT');

    res.json({ success: true, message: 'Express rate list updated.' });
  } catch (error) {
    await mySqlQury('ROLLBACK');
    console.error('Error updating express rate list:', error);
    res.status(500).json({ error: 'Failed to update express rate list' });
  }
});

// update the express rate list package forwarder
route.put('/api/lp/package/express-rate-list/:logisticsId', async (req, res) => {
  try {
    const lp_id = req.params.logisticsId;
    const { slabs } = req.body;
    mySqlQury('START TRANSACTION');
    console.log("rew body",req.body)
    console.log("slabs ",slabs)
    // console.log("djsgdhshsydfy",dgshdgshdg)

        // 2. Delete existing zone rates
    await mySqlQury(`DELETE FROM tbl_exp_lp_zones_rates WHERE lp_id = ?`, [lp_id]);

    // 3. Delete existing slab additional charges
    await mySqlQury(`DELETE FROM tbl_exp_lp_slab_add_charges WHERE lp_id = ?`, [lp_id]);

    // 2. Insert new slabs and related data
    for (const slab of slabs) {
      const { weightSlab, zones, additionalCharges } = slab;
      // Insert into tbl_exp_weightslabs
     
      // Insert zones for this slab
      for (const [zoneName, zoneValue] of Object.entries(zones)) {
        await mySqlQury(
          'INSERT INTO tbl_exp_lp_zones_rates (lp_id, zone_name, zone_value, created_at, updated_at) VALUES (?, ?, ?, now(), now())',
          [lp_id, zoneName, zoneValue]
        );
      }

      // Insert additional charges for this slab
      if (additionalCharges && additionalCharges.length > 0) {
        for (const charge of additionalCharges) {
          const { desc, weight, unit, amounts } = charge;
         

          // Insert zone-wise amounts for this charge
          for (const [zoneName, amount] of Object.entries(amounts)) {
            await mySqlQury(
              'INSERT INTO tbl_exp_lp_slab_add_charges (lp_id, zone_name, amount, created_at, updated_at) VALUES (?,?,?,now(),now())',
              [lp_id, zoneName, amount]
            );
          }
        }
      }
    }
    mySqlQury('COMMIT');

    res.json({ success: true, message: 'Express rate list updated.' });
  } catch (error) {
    await mySqlQury('ROLLBACK');
    console.error('Error updating express rate list:', error);
    res.status(500).json({ error: 'Failed to update express rate list' });
  }
});
 
// route.get("/api/dashboard", async (req, res) => {
//   const clientId = req.query.client_id || null; // optional client filter
//   const today = new Date().toISOString().slice(0, 10);

//   try {
//     // Prepare queries
//     const queries = [
//       // 1. Today's Orders & Order Value
//       mySqlQury(
//         `SELECT 
//         -- Current month
//         (SELECT COUNT(*) / DAY(CURDATE())
//         FROM tbl_exp_orders
//         WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
//           AND DAY(created_at) <= DAY(CURDATE())
//         ) AS current_avg_orders,

//         (SELECT IFNULL(SUM(grand_total) / DAY(CURDATE()), 0)
//         FROM tbl_exp_orders
//         WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
//           AND DAY(created_at) <= DAY(CURDATE())
//         ) AS current_avg_order_value,

//         -- Previous month same range
//         (SELECT COUNT(*) / DAY(CURDATE())
//         FROM tbl_exp_orders
//         WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m')
//           AND DAY(created_at) <= DAY(CURDATE())
//         ) AS prev_avg_orders,

//         (SELECT IFNULL(SUM(grand_total) / DAY(CURDATE()), 0)
//         FROM tbl_exp_orders
//         WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m')
//           AND DAY(created_at) <= DAY(CURDATE())
//         ) AS prev_avg_order_value;
//       `,
//         clientId ? [today, clientId] : [today]
//       ),
//       // 3. Order Split by Payment Mode
//       mySqlQury(
//         `SELECT payment_mode, COUNT(*) as total
//          FROM tbl_exp_orders
//          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
//          ${clientId ? "AND client_id=?" : ""}
//          GROUP BY payment_mode`,
//         clientId ? [clientId] : []
//       ),

//      await mySqlQury(`
//       SELECT 
//     CASE
//         WHEN LOWER(c.productType) LIKE '%air%' THEN 'Air'
//         WHEN LOWER(c.productType) LIKE '%surface%' THEN 'Surface'
//         ELSE 'Other'
//         END AS shipping_mode,
//         COUNT(*) AS total
//         FROM tbl_exp_lr lr
//         JOIN tbl_courier_details c ON lr.forwarder_id = c.id
//         WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
//           AND LOWER(c.courier_type) = LOWER('express')  -- express / ecom / ltr
//         GROUP BY shipping_mode;
//         `),

//       // 5. Shipment Split by Courier
//            mySqlQury(`
//       SELECT c.courier_name, COUNT(*) AS total
//       FROM tbl_exp_lr lr
//       JOIN tbl_courier_details c ON lr.forwarder_id = c.id
//       WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
//         AND LOWER(c.courier_type) = LOWER('express')  -- express / ecom / ltr
//       GROUP BY c.id, c.courier_name
//       ORDER BY total DESC;
//       `),

//           // current period orders vs previous orders
//     mySqlQury(`SELECT
//     -- Today vs Yesterday
//     SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS today_orders,
//     SUM(CASE WHEN DATE(created_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE 0 END) AS yesterday_orders,

//     -- This week vs Last week
//     SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) AS this_week_orders,
//     SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) - 1 THEN 1 ELSE 0 END) AS last_week_orders,

//     -- This month vs Last month
//     SUM(CASE WHEN YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE()) THEN 1 ELSE 0 END) AS this_month_orders,
//     SUM(CASE WHEN YEAR(created_at)=YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(created_at)=MONTH(CURDATE() - INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS last_month_orders,

//     -- This quarter vs Last quarter
//     SUM(CASE WHEN QUARTER(created_at) = QUARTER(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE()) THEN 1 ELSE 0 END) AS this_quarter_orders,
//     SUM(CASE WHEN QUARTER(created_at) = QUARTER(CURDATE() - INTERVAL 3 MONTH) AND YEAR(created_at)=YEAR(CURDATE() - INTERVAL 3 MONTH) THEN 1 ELSE 0 END) AS last_quarter_orders
//     FROM tbl_exp_orders;
//     `),

//     await mySqlQury(`
//       SELECT
//           -- Today vs Yesterday
//           SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_lr_charges ELSE 0 END) AS today_value,
//           SUM(CASE WHEN DATE(created_at) = CURDATE() - INTERVAL 1 DAY THEN total_lr_charges ELSE 0 END) AS yesterday_value,

//           -- This week vs Last week
//           SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) THEN total_lr_charges ELSE 0 END) AS this_week_value,
//           SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) - 1 THEN total_lr_charges ELSE 0 END) AS last_week_value,

//           -- This month vs Last month
//           SUM(CASE WHEN YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE()) THEN total_lr_charges ELSE 0 END) AS this_month_value,
//           SUM(CASE WHEN YEAR(created_at)=YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(created_at)=MONTH(CURDATE() - INTERVAL 1 MONTH) THEN total_lr_charges ELSE 0 END) AS last_month_value,

//           -- This quarter vs Last quarter
//           SUM(CASE WHEN QUARTER(created_at) = QUARTER(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE()) THEN total_lr_charges ELSE 0 END) AS this_quarter_value,
//           SUM(CASE WHEN QUARTER(created_at) = QUARTER(CURDATE() - INTERVAL 3 MONTH) AND YEAR(created_at)=YEAR(CURDATE() - INTERVAL 3 MONTH) THEN total_lr_charges ELSE 0 END) AS last_quarter_value
//       FROM tbl_exp_lr
//     `),
//     mySqlQury(`
//       SELECT 
//     CASE 
//         WHEN lr.chargable_weight <= 0.5 THEN '0-0.5kg'
//         WHEN lr.chargable_weight <= 1 THEN '0.5-1kg'
//         WHEN lr.chargable_weight <= 2 THEN '1-2kg'
//         WHEN lr.chargable_weight <= 5 THEN '2-5kg'
//         WHEN lr.chargable_weight <= 10 THEN '5-10kg'
//         ELSE '>10kg'
//     END AS weight_bucket,
//     COUNT(*) AS total
//     FROM tbl_exp_lr lr
//     WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
//     GROUP BY weight_bucket
//     ORDER BY 
//     CASE weight_bucket
//         WHEN '0-0.5kg' THEN 1
//         WHEN '0.5-1kg' THEN 2
//         WHEN '1-2kg' THEN 3
//         WHEN '2-5kg' THEN 4
//         WHEN '5-10kg' THEN 5
//         ELSE 6
//           END;
//       `),
//       mySqlQury(`
//         SELECT lr.destination_zone AS state, COUNT(*) AS total_orders
//       FROM tbl_exp_lr lr
//       WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
//         AND lr.destination_zone IS NOT NULL
//       GROUP BY lr.destination_zone
//       ORDER BY total_orders DESC
//       LIMIT 5;
//       `),
//       mySqlQury(`
//         SELECT 
//           SUM(CASE WHEN lr.status = 4 THEN 1 ELSE 0 END) AS on_time,
//           SUM(CASE WHEN lr.status IN (3,7,8) THEN 1 ELSE 0 END) AS delay,
//           SUM(CASE WHEN lr.status = 5 THEN 1 ELSE 0 END) AS rto
//       FROM tbl_exp_lr lr
//       WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
//       `)

//     ];
    


//     // Execute all queries in parallel
//     const [
//       businessInsights,
//       paymentSplit,
//       shippingSplit,
//       courierSplit,
//       totalOrdersInsight,
//       totalValueInsight,
//       ShipmentSplitByWeight,
//       OrderSplitAcrossTopStates,
//       DeliveryPerformance
//     ] = await Promise.all(queries);
//     //Business insights


//     const currentAvgOrders = Number(businessInsights[0].current_avg_orders || 0);
//     const prevAvgOrders = Number(businessInsights[0].prev_avg_orders || 0);
//     const currentAvgValue = Number(businessInsights[0].current_avg_order_value || 0);
//     const prevAvgValue = Number(businessInsights[0].prev_avg_order_value || 0);
//     const orderChangePct = prevAvgOrders > 0 
//         ? ((currentAvgOrders - prevAvgOrders) / prevAvgOrders * 100).toFixed(2)
//         : 0;
//     const valueChangePct = prevAvgValue > 0
//         ? ((currentAvgValue - prevAvgValue) / prevAvgValue * 100).toFixed(2)
//         : 0;
//     let businessInsightObj  ={currentAvgOrders, prevAvgOrders, currentAvgValue, prevAvgValue, orderChangePct, valueChangePct}
//     // Map shipment status to readable labels
//     const shipmentSplitByStatus = shippingSplit.map(row => ({
//       status: row.status,
//       statusLabel: statusMap[row.status] || "Unknown",
//       total: row.total,
//     }));

//       // Helper for percentage calculation
//     const calcPct = (current, previous) => {
//       if (!previous) return 0;
//       return Number((((current - previous) / previous) * 100).toFixed(2));
//     };
    
//     let orderInsight = totalOrdersInsight[0]
//      let valueInsight = totalValueInsight[0]


//     const orderJsonResponse = {
//       todayOrders: {
//         count: orderInsight.today_orders || 0,
//         change: orderInsight.today_orders - orderInsight.yesterday_orders,
//         percentage: calcPct(orderInsight.today_orders, orderInsight.yesterday_orders),
//       },
//       weekOrders: {
//         count: orderInsight.this_week_orders || 0,
//         change: orderInsight.this_week_orders - orderInsight.last_week_orders,
//         percentage: calcPct(orderInsight.this_week_orders, orderInsight.last_week_orders),
//       },
//       monthOrders: {
//         count: orderInsight.this_month_orders || 0,
//         change: orderInsight.this_month_orders - orderInsight.last_month_orders,
//         percentage: calcPct(orderInsight.this_month_orders, orderInsight.last_month_orders),
//       },
//       quarterOrders: {
//         count: orderInsight.this_quarter_orders || 0,
//         change: orderInsight.this_quarter_orders - orderInsight.last_quarter_orders,
//         percentage: calcPct(orderInsight.this_quarter_orders, orderInsight.last_quarter_orders),
//       }
//     };

//     // order value insight
//      const valueJsonResponse = {
//       todayValue: {
//         value: Number(valueInsight.today_value || 0),
//         change: Number(valueInsight.today_value - valueInsight.yesterday_value || 0),
//         percentage: calcPct(valueInsight.today_value, valueInsight.yesterday_value),
//       },
//       weekValue: {
//         value: Number(valueInsight.this_week_value || 0),
//         change: Number(valueInsight.this_week_value - valueInsight.last_week_value || 0),
//         percentage: calcPct(valueInsight.this_week_value, valueInsight.last_week_value),
//       },
//       monthValue: {
//         value: Number(valueInsight.this_month_value || 0),
//         change: Number(valueInsight.this_month_value - valueInsight.last_month_value || 0),
//         percentage: calcPct(valueInsight.this_month_value, valueInsight.last_month_value),
//       },
//       quarterValue: {
//         value: Number(valueInsight.this_quarter_value || 0),
//         change: Number(valueInsight.this_quarter_value - valueInsight.last_quarter_value || 0),
//         percentage: calcPct(valueInsight.this_quarter_value, valueInsight.last_quarter_value),
//       }
//     };


//     res.json({
//      businessInsightObj,
//       orderSplitByPaymentMode: paymentSplit,
//       shipmentSplitByStatus: shipmentSplitByStatus,
//       shipmentSplitByCourier: courierSplit,
//       orderJsonResponse,
//       valueJsonResponse,
//       ShipmentSplitByWeight,  
//       OrderSplitAcrossTopStates,
//       DeliveryPerformance     
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server Error" });
//   }
// });
route.post('/shopify-credential', async (req, res, next) => {
  try {
    const { shopyfy_url, accessToken } = req.body;
    // const roleData = req.user;

 const clientId = 59;
    // Save or update Shopify integration
    // const integrationQuery = `
    //   INSERT INTO tbl_shopify_integration (clientId, shopyfy_url, accessToken)
    //   VALUES (?, ?, ?)
    //   ON DUPLICATE KEY UPDATE accessToken = VALUES(accessToken)
    // `;
    // await mySqlQury(integrationQuery, [clientId, shopyfy_url, accessToken]);

    // Fetch orders
    const orderResponse = await axios.get(`https://${shopyfy_url}/admin/api/2023-10/orders.json`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });

    // Fetch locations
    const locationResponse = await axios.get(`https://${shopyfy_url}/admin/api/2025-07/locations.json`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });

    const locations = locationResponse.data.locations || [];
    const orders = orderResponse.data.orders || [];

    const values = [];
    const productValues = [];
    const boxValues = [];

    for (const order of orders) {
      const order_id = String(order.id);
      const po_no = await generateCustomPONumber();

      // Extract origin details from locations
      let origin_pincode = '', origin_state = '', origin_city = '';
      const locationData = locations.find(loc => loc.id == order.location_id);
      if (locationData) {
        origin_pincode = locationData.zip || '';
        origin_state = locationData.province || '';
        origin_city = locationData.city || '';
      }

      for (const lineItem of order.line_items || []) {
        let height, width, length;

        // Fetch metafields
        const metaResponse = await axios.get(
          `https://${shopyfy_url}/admin/api/2025-07/orders/${order_id}/metafields.json`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': accessToken,
            }
          }
        );

        const metafields = metaResponse.data.metafields || [];
        metafields.forEach((field) => {
          if (field.namespace === 'shipping') {
            try {
              const parsed = JSON.parse(field.value);
              if (field.key === 'height') height = Number(parsed.value);
              if (field.key === 'width') width = Number(parsed.value);
              if (field.key === 'length') length = Number(parsed.value);
            } catch (err) {
              console.warn(`Could not parse metafield: ${field.key}`);
            }
          }
        });

        const dimensionValue = (height && width && length)
          ? length * height * width
          : null;

        // Insert into tbl_unprocessed_order
        values.push([
          clientId,
          order_id,
          po_no,
          Number(order.current_subtotal_price),
          order.shipping_address?.city || '',
          order.shipping_address?.province || '',
          order.shipping_address?.zip || '',
          order.shipping_address?.phone || '',
          `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim(),
          origin_city,
          origin_state,
          origin_pincode,
          String(order?.payment_terms || ''),
          Number(lineItem?.quantity || 0),
          String(lineItem?.sku || ''),
          1,
          "e-commerce",
          Number(order.current_subtotal_price),
          String(order.id),
          String(order.confirmation_number),
          order.created_at,
        ]);

        // Insert into tbl_products
        productValues.push([
          String(lineItem.name),
          Number(lineItem?.quantity || 0),
          Number(order.id),
          po_no,
        ]);

        // Insert into tbl_boxes_dimension
        if (dimensionValue) {
          boxValues.push([
            po_no,
            Number(lineItem?.quantity || 0),
            String(dimensionValue),
            1,
            "cm",
          ]);
        }
      }
    }

    // Final bulk insert queries
    const insertOrders = `
      INSERT INTO tbl_unprocessed_order (
        client_id, order_id, po_no, Invoice_amount, destination_city,
        destination_state, destination_pincode, consignee_phone, consignee_name,
        origin_city, origin_state, origin_pincode, payment_type, quantity, sku,
        is_unprocessesd, order_type, Amount, order_value, invoice_no, order_date
      ) VALUES ?
      ON DUPLICATE KEY UPDATE order_id = VALUES(order_id)
    `;

    const insertProducts = `
      INSERT INTO tbl_products (
        product_name, quantity, order_value, po_no
      ) VALUES ?
      ON DUPLICATE KEY UPDATE po_no = po_no
    `;

    const insertBoxes = `
      INSERT INTO tbl_boxes_dimension (
        po_no, boxes, DIMENSION, is_unprocessesd, unit
      ) VALUES ?
      ON DUPLICATE KEY UPDATE po_no = po_no
    `;

    if (values.length) await mySqlQury(insertOrders, [values]);
    if (productValues.length) await mySqlQury(insertProducts, [productValues]);
    if (boxValues.length) await mySqlQury(insertBoxes, [boxValues]);

    res.status(200).json({ data: orders });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      details: error.message
    });
  }
});
route.post('/api/shopify-credential', async (req, res) => {
  try {
    const { clientId, shopyfy_url, accessToken } = req.body;
    let origin_pincode = '', origin_state = '', origin_city = '';

    const orderResponse = await axios.get(`https://${shopyfy_url}/admin/api/2023-10/orders.json`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });

    const locationResponse = await axios.get(`https://${shopyfy_url}/admin/api/2025-07/locations.json`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });

    const locations = locationResponse.data.locations || [];
    const orders = orderResponse.data.orders || [];

    const values = [];
    const productValues = [];
    const boxValues = [];
    const orderValue = [];

    for (const order of orders) {
      const order_id = String(order.id);
      const locationData = locations.find(loc => loc.id == order.location_id);

      if (locationData) {
        origin_pincode = locationData.zip || '';
        origin_state = locationData.province || '';
        origin_city = locationData.city || '';
      }

      let title = '';
      for (const tax_lines of order.tax_lines || []) {
        title = tax_lines.title || '';
      }

      for (const lineItem of order.line_items || []) {
        let height, width, length, unit = 'cm';

        // Fetch metafields
        const metaResponse = await axios.get(
          `https://${shopyfy_url}/admin/api/2025-07/orders/${order_id}/metafields.json`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': accessToken,
            }
          }
        );

        const metafields = metaResponse.data.metafields || [];
        metafields.forEach((field) => {
          if (field.namespace === 'shipping') {
            try {
              const parsed = JSON.parse(field.value);
              if (field.key === 'height') height = Number(parsed.value);
              if (field.key === 'width') width = Number(parsed.value);
              if (field.key === 'length') length = Number(parsed.value);
            } catch (err) {
              console.warn(`Could not parse metafield: ${field.key}`);
            }
          }
        });

        let dimensionOutput = null;
        if (height && width && length) {
          dimensionOutput = {
            key: 'dimension',
            length,
            height,
            width,
            formula: `${length}*${height}*${width}`,
            value: length * height * width,
            unit
          };
        }

        const existingWareHouseId = await mySqlQury(
          'SELECT warehouse_id FROM tbl_add_warehouse WHERE client_id = ?;',
          [clientId]
        );

        // Check for existing records in all relevant tables
        const existingProduct = await mySqlQury(
          'SELECT * FROM tbl_ecom_product_details WHERE order_id = ?;',
          [order_id]
        );

        const existingBox = await mySqlQury(
          'SELECT * FROM tbl_ecom_boxes_details WHERE order_id = ?;',
          [order_id]
        );

        const existingOrder = await mySqlQury(
          'SELECT * FROM tbl_ecom_consignee_details WHERE order_id = ?;',
          [order_id]
        );

        const existingOrderInOrders = await mySqlQury(
          'SELECT * FROM tbl_ecom_orders WHERE orderid = ?;',
          [order_id]
        );

        // Only insert if the order_id does not exist in any of the tables
        if (existingProduct.length === 0 && existingBox.length === 0 && existingOrder.length === 0 && existingOrderInOrders.length === 0) {
          values.push([
            Number(order_id),
            "asd",
            `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim(),
            Number(order.current_subtotal_price),
            String(lineItem?.sku || ''),
            Number(lineItem?.quantity || 0),
            2.5,
            "Percent",
            'CGST'
          ]);

          productValues.push([
            order_id,
            "asd",
            Number(length || 0),
            Number(width || 0),
            Number(height || 0),
            String(unit || ''),
            Number(lineItem?.grams || 0),
            "gram",
          ]);

          boxValues.push([
            "asd",
            String(order.reference || ''),
            String(order_id),
            String(order_id),
            Number(clientId),
            String(order?.payment_terms || ''),
            8.9,
            String(existingWareHouseId[0]?.warehouse_id || ''),
            Number(lineItem?.grams || 0),
            "gram",
            Number(order.current_total_price || 0),
            Number(lineItem?.quantity || 0),
            123,
            Number(order.current_total_tax || 0),
            Number(order.total_discounts || 0),
            0
          ]);

          orderValue.push([
            Number(order_id),
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
            (order.billing_address?.phone || '').trim(),
            (order.billing_address?.phone || '').trim(),
            order.billing_address?.address1 || '',
            order.billing_address?.address2 || '',
            order.billing_address?.address1 || '',
            order.billing_address?.country || '',
            order.billing_address?.province || '',
            order.billing_address?.city || '',
            order.billing_address?.zip || ''
          ]);
        }
      }
    }

    // Insert queries
    if (values.length)
      await mySqlQury(`INSERT INTO tbl_ecom_product_details (
        order_id, category, name, price, sku, quantity, discount_value, discount_type, tax_type
      ) VALUES ?`, [values]);

    if (productValues.length)
      await mySqlQury(`INSERT INTO tbl_ecom_boxes_details (
        order_id, package_type, length, breadth, height, dimension_unit, weight, weight_unit
      ) VALUES ?`, [productValues]);

    if (boxValues.length)
      await mySqlQury(`INSERT INTO tbl_ecom_orders (
        channel, ref_number, orderid, invoice_no, client_id, payment_mode, collectable_amount, warehouse_id, 
        total_weight, weight_unit, grand_total, total_qty, box_qty, total_tax, total_discount, is_unprocessed
      ) VALUES ?`, [boxValues]);

    if (orderValue.length)
      await mySqlQury(`INSERT INTO tbl_ecom_consignee_details (
        order_id, first_name, last_name, email, phone, alternate_phone, address_line1, address_line2, landmark,
        country, state, city, pincode, billing_same_as_shipping, billing_first_name, billing_last_name, billing_email,
        billing_phone, billing_alternate_phone, billing_address_line1, billing_address_line2, billing_landmark,
        billing_country, billing_state, billing_city, billing_pincode
      ) VALUES ?`, [orderValue]);

    res.status(200).json({ data: "All Data is Saved" });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      details: error.message
    });
  }
});






// 🔹 Main sync function




function generateCustomPONumber() {
  const prefix = "PO";
  const middleFixed = "J4A";

  const part1 = String(Math.floor(10000 + Math.random() * 90000)); // 5-digit
  const part2 = String(Math.floor(1000 + Math.random() * 9000));   // 4-digit

  return `${prefix}-${part1}-${middleFixed}-${part2}`;
}





route.get('/ecom/all-data', auth,accessControlMiddleware, userController.ecomAllData); 
route.get('/express/all-data', auth,accessControlMiddleware, userController.expressAllData);

 
route.get("/api/dashboard", auth, async (req, res) => {
  const clientId = req.user.selectedClientId ?? null; 
  const courierTypeParam = (req.query.courier_type || "").toLowerCase(); // "express" | "ecom" | "ltr"?
  if (clientId == null) {
    return res.status(500).json({ error: "client id not selected" });
  }

  try {
    // === 1) Dynamic table map by domain (express=ecommerce) ===
    // Extend if you later add "ltr" tables.
    const TABLES = {
      express: {
        orders: "tbl_exp_orders",
        lr: "tbl_exp_lr",
        consignee: "tbl_exp_consignee_details",
      },
      ecom: {
        orders: "tbl_ecom_orders",
        lr: "tbl_ecom_lr",
        // If your eCom consignee table differs, update here:
        consignee: "tbl_ecom_consignee_details",
      },
    };

    // Decide which table set to use:
    const domain = courierTypeParam === "ecom" ? "ecom" : "express";
    const T = TABLES[domain];

    // === 2) Filters & params ===
    const applyClientFilter = clientId != 1; // 1 => Super Admin, no filter
    const courierConditionSql = courierTypeParam
      ? `AND LOWER(c.courier_type) = LOWER(?)`
      : "";
    const clientConditionSql = applyClientFilter ? `AND o.client_id = ?` : "";

    // Single block of params for ONE occurrence of the conditions, in order:
    // first courier_type (if any), then clientId (if any)
    const oneBlockParams = [
      ...(courierTypeParam ? [courierTypeParam] : []),
      ...(applyClientFilter ? [clientId] : []),
    ];
    // Helper to repeat that param block N times (for queries with multiple subselects)
    const repeat = (n) => Array.from({ length: n }).flatMap(() => oneBlockParams);
 
    // === 3) Queries ===
    const queries = [
      // 1️⃣ Business Insights (4 subselects -> repeat params 4x)
      mySqlQury(
        `
        SELECT 
          -- Current month
          (
            SELECT COUNT(*) / DAY(CURDATE())
            FROM ${T.orders} o
            JOIN ${T.lr} lr ON lr.order_id = o.id
            JOIN tbl_courier_details c ON lr.forwarder_id = c.id
            WHERE DATE_FORMAT(o.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
              AND DAY(o.created_at) <= DAY(CURDATE())
              ${courierConditionSql} ${clientConditionSql}
          ) AS current_avg_orders,

          (
            SELECT IFNULL(SUM(o.grand_total) / DAY(CURDATE()), 0)
            FROM ${T.orders} o
            JOIN ${T.lr} lr ON lr.order_id = o.id
            JOIN tbl_courier_details c ON lr.forwarder_id = c.id
            WHERE DATE_FORMAT(o.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
              AND DAY(o.created_at) <= DAY(CURDATE())
              ${courierConditionSql} ${clientConditionSql}
          ) AS current_avg_order_value,

          -- Previous month (same day-of-month range)
          (
            SELECT COUNT(*) / DAY(CURDATE())
            FROM ${T.orders} o
            JOIN ${T.lr} lr ON lr.order_id = o.id
            JOIN tbl_courier_details c ON lr.forwarder_id = c.id
            WHERE DATE_FORMAT(o.created_at, '%Y-%m') = DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m')
              AND DAY(o.created_at) <= DAY(CURDATE())
              ${courierConditionSql} ${clientConditionSql}
          ) AS prev_avg_orders,

          (
            SELECT IFNULL(SUM(o.grand_total) / DAY(CURDATE()), 0)
            FROM ${T.orders} o
            JOIN ${T.lr} lr ON lr.order_id = o.id
            JOIN tbl_courier_details c ON lr.forwarder_id = c.id
            WHERE DATE_FORMAT(o.created_at, '%Y-%m') = DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m')
              AND DAY(o.created_at) <= DAY(CURDATE())
              ${courierConditionSql} ${clientConditionSql}
          ) AS prev_avg_order_value
        `,
        repeat(4)
      ),

      // 2️⃣ Order Split by Payment Mode (last 30 days)
      mySqlQury(
        `
        SELECT o.payment_mode, COUNT(*) AS total
        FROM ${T.orders} o
        JOIN ${T.lr} lr ON lr.order_id = o.id
        JOIN tbl_courier_details c ON lr.forwarder_id = c.id
        WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          ${courierConditionSql} ${clientConditionSql}
        GROUP BY o.payment_mode
        `,
        oneBlockParams
      ),

      // 3️⃣ Shipment Split by Shipping Mode (needs orders join if client filter is applied)
      mySqlQury(
        `
        SELECT 
          CASE
            WHEN LOWER(c.productType) LIKE '%air%' THEN 'Air'
            WHEN LOWER(c.productType) LIKE '%surface%' THEN 'Surface'
            ELSE 'Other'
          END AS shipping_mode,
          COUNT(*) AS total
        FROM ${T.lr} lr
        JOIN tbl_courier_details c ON lr.forwarder_id = c.id
        ${applyClientFilter ? `JOIN ${T.orders} o ON o.id = lr.order_id` : `LEFT JOIN ${T.orders} o ON o.id = lr.order_id`}
        WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          ${courierConditionSql} ${clientConditionSql}
        GROUP BY shipping_mode
        `,
        oneBlockParams
      ),

      // 4️⃣ Shipment Split by Courier (last 30 days)
      mySqlQury(
        `
        SELECT c.courier_name, COUNT(*) AS total
        FROM ${T.lr} lr
        JOIN tbl_courier_details c ON lr.forwarder_id = c.id
        ${applyClientFilter ? `JOIN ${T.orders} o ON o.id = lr.order_id` : `LEFT JOIN ${T.orders} o ON o.id = lr.order_id`}
        WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          ${courierConditionSql} ${clientConditionSql}
        GROUP BY c.courier_name
        ORDER BY total DESC
        `,
        oneBlockParams
      ),

      // 5️⃣ Orders Insight (today / yesterday / week / month / quarter)
      mySqlQury(
        `
        SELECT
          SUM(CASE WHEN DATE(o.created_at) = CURDATE() THEN 1 ELSE 0 END) AS today_orders,
          SUM(CASE WHEN DATE(o.created_at) = CURDATE() - INTERVAL 1 DAY THEN 1 ELSE 0 END) AS yesterday_orders,
          SUM(CASE WHEN YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) AS this_week_orders,
          SUM(CASE WHEN YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1) - 1 THEN 1 ELSE 0 END) AS last_week_orders,
          SUM(CASE WHEN YEAR(o.created_at)=YEAR(CURDATE()) AND MONTH(o.created_at)=MONTH(CURDATE()) THEN 1 ELSE 0 END) AS this_month_orders,
          SUM(CASE WHEN YEAR(o.created_at)=YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(o.created_at)=MONTH(CURDATE() - INTERVAL 1 MONTH) THEN 1 ELSE 0 END) AS last_month_orders,
          SUM(CASE WHEN QUARTER(o.created_at)=QUARTER(CURDATE()) AND YEAR(o.created_at)=YEAR(CURDATE()) THEN 1 ELSE 0 END) AS this_quarter_orders,
          SUM(CASE WHEN QUARTER(o.created_at)=QUARTER(CURDATE() - INTERVAL 3 MONTH) AND YEAR(o.created_at)=YEAR(CURDATE() - INTERVAL 3 MONTH) THEN 1 ELSE 0 END) AS last_quarter_orders
        FROM ${T.orders} o
        JOIN ${T.lr} lr ON lr.order_id = o.id
        JOIN tbl_courier_details c ON lr.forwarder_id = c.id
        WHERE 1=1
          ${courierConditionSql} ${clientConditionSql}
        `,
        oneBlockParams
      ),

      // 6️⃣ Order Value Insight (from lr.total_lr_charges)
          mySqlQury(
          `
          SELECT
            SUM(CASE WHEN DATE(o.created_at) = CURDATE() THEN o.grand_total ELSE 0 END) AS today_value,
            SUM(CASE WHEN DATE(o.created_at) = CURDATE() - INTERVAL 1 DAY THEN o.grand_total ELSE 0 END) AS yesterday_value,
            SUM(CASE WHEN YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1) THEN o.grand_total ELSE 0 END) AS this_week_value,
            SUM(CASE WHEN YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1) - 1 THEN o.grand_total ELSE 0 END) AS last_week_value,
            SUM(CASE WHEN YEAR(o.created_at)=YEAR(CURDATE()) AND MONTH(o.created_at)=MONTH(CURDATE()) THEN o.grand_total ELSE 0 END) AS this_month_value,
            SUM(CASE WHEN YEAR(o.created_at)=YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(o.created_at)=MONTH(CURDATE() - INTERVAL 1 MONTH) THEN o.grand_total ELSE 0 END) AS last_month_value,
            SUM(CASE WHEN QUARTER(o.created_at)=QUARTER(CURDATE()) AND YEAR(o.created_at)=YEAR(CURDATE()) THEN o.grand_total ELSE 0 END) AS this_quarter_value,
            SUM(CASE WHEN QUARTER(o.created_at)=QUARTER(CURDATE() - INTERVAL 3 MONTH) AND YEAR(o.created_at)=YEAR(CURDATE() - INTERVAL 3 MONTH) THEN o.grand_total ELSE 0 END) AS last_quarter_value
          FROM ${T.lr} lr
          JOIN tbl_courier_details c ON lr.forwarder_id = c.id
          ${applyClientFilter ? `JOIN ${T.orders} o ON o.id = lr.order_id` : `LEFT JOIN ${T.orders} o ON o.id = lr.order_id`}
          WHERE 1=1
            ${courierConditionSql} ${clientConditionSql}
          `,
          oneBlockParams
        ),

      // 7️⃣ Shipment Split by Weight (last 30 days)
      mySqlQury(
        `
        SELECT 
          CASE 
            WHEN lr.chargable_weight <= 0.5 THEN '0-0.5kg'
            WHEN lr.chargable_weight <= 1   THEN '0.5-1kg'
            WHEN lr.chargable_weight <= 2   THEN '1-2kg'
            WHEN lr.chargable_weight <= 5   THEN '2-5kg'
            WHEN lr.chargable_weight <= 10  THEN '5-10kg'
            ELSE '>10kg'
          END AS weight_bucket,
          COUNT(*) AS total
        FROM ${T.lr} lr
        JOIN tbl_courier_details c ON lr.forwarder_id = c.id
        ${applyClientFilter ? `JOIN ${T.orders} o ON o.id = lr.order_id` : `LEFT JOIN ${T.orders} o ON o.id = lr.order_id`}
        WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          ${courierConditionSql} ${clientConditionSql}
        GROUP BY weight_bucket
        ORDER BY 
          CASE weight_bucket
            WHEN '0-0.5kg' THEN 1
            WHEN '0.5-1kg' THEN 2
            WHEN '1-2kg'   THEN 3
            WHEN '2-5kg'   THEN 4
            WHEN '5-10kg'  THEN 5
            ELSE 6
          END
        `,
        oneBlockParams
      ),

      // 8️⃣ Top 5 States (last 30 days)
      mySqlQury(
        `
        SELECT 
          tec.state AS state, 
          COUNT(*) AS total_orders
        FROM ${T.lr} lr
        JOIN ${T.orders} o  ON lr.order_id = o.id
        JOIN ${T.consignee} tec ON tec.order_id = o.id
        JOIN tbl_courier_details c ON lr.forwarder_id = c.id
        WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          AND tec.state IS NOT NULL
          ${courierConditionSql} ${clientConditionSql}
        GROUP BY tec.state
        ORDER BY total_orders DESC
        LIMIT 5
        `,
        oneBlockParams
      ),

      // 9️⃣ Delivery Performance (last 30 days)
      mySqlQury(
        `
        SELECT 
          SUM(CASE WHEN lr.status = 4 THEN 1 ELSE 0 END) AS on_time,
          SUM(CASE WHEN lr.status IN (3,7,8) THEN 1 ELSE 0 END) AS delay,
          SUM(CASE WHEN lr.status = 5 THEN 1 ELSE 0 END) AS rto
        FROM ${T.lr} lr
        JOIN tbl_courier_details c ON lr.forwarder_id = c.id
        ${applyClientFilter ? `JOIN ${T.orders} o ON o.id = lr.order_id` : `LEFT JOIN ${T.orders} o ON o.id = lr.order_id`}
        WHERE lr.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          ${courierConditionSql} ${clientConditionSql}
        `,
        oneBlockParams
      ),
    ];

    // === 4) Execute in parallel ===
    const [
      businessInsights,
      paymentSplit,
      shippingSplit,
      courierSplit,
      totalOrdersInsight,
      totalValueInsight,
      ShipmentSplitByWeight,
      OrderSplitAcrossTopStates,
      DeliveryPerformance,
    ] = await Promise.all(queries);

    // === 5) Post-process ===
    const toNum = (v) => Number(v || 0);
    const calcPct = (curr, prev) => (!toNum(prev) ? 0 : Number((((toNum(curr) - toNum(prev)) / toNum(prev)) * 100).toFixed(2)));

    const bi = businessInsights[0] || {};
    const businessInsightObj = {
      currentAvgOrders: toNum(bi.current_avg_orders),
      prevAvgOrders: toNum(bi.prev_avg_orders),
      currentAvgValue: toNum(bi.current_avg_order_value),
      prevAvgValue: toNum(bi.prev_avg_order_value),
      orderChangePct: calcPct(bi.current_avg_orders, bi.prev_avg_orders),
      valueChangePct: calcPct(bi.current_avg_order_value, bi.prev_avg_order_value),
    };

    const oi = totalOrdersInsight[0] || {};
    const orderJsonResponse = {
      todayOrders: {
        count: toNum(oi.today_orders),
        change: toNum(oi.today_orders) - toNum(oi.yesterday_orders),
        percentage: calcPct(oi.today_orders, oi.yesterday_orders),
      },
      weekOrders: {
        count: toNum(oi.this_week_orders),
        change: toNum(oi.this_week_orders) - toNum(oi.last_week_orders),
        percentage: calcPct(oi.this_week_orders, oi.last_week_orders),
      },
      monthOrders: {
        count: toNum(oi.this_month_orders),
        change: toNum(oi.this_month_orders) - toNum(oi.last_month_orders),
        percentage: calcPct(oi.this_month_orders, oi.last_month_orders),
      },
      quarterOrders: {
        count: toNum(oi.this_quarter_orders),
        change: toNum(oi.this_quarter_orders) - toNum(oi.last_quarter_orders),
        percentage: calcPct(oi.this_quarter_orders, oi.last_quarter_orders),
      },
    };

    const vi = totalValueInsight[0] || {};
    const valueJsonResponse = {
      todayValue: {
        value: toNum(vi.today_value),
        change: toNum(vi.today_value) - toNum(vi.yesterday_value),
        percentage: calcPct(vi.today_value, vi.yesterday_value),
      },
      weekValue: {
        value: toNum(vi.this_week_value),
        change: toNum(vi.this_week_value) - toNum(vi.last_week_value),
        percentage: calcPct(vi.this_week_value, vi.last_week_value),
      },
      monthValue: {
        value: toNum(vi.this_month_value),
        change: toNum(vi.this_month_value) - toNum(vi.last_month_value),
        percentage: calcPct(vi.this_month_value, vi.last_month_value),
      },
      quarterValue: {
        value: toNum(vi.this_quarter_value),
        change: toNum(vi.this_quarter_value) - toNum(vi.last_quarter_value),
        percentage: calcPct(vi.this_quarter_value, vi.last_quarter_value),
      },
    };

    //add image url for courier logo
    const courierLogos = {
        dtdc: `assets/images/logos/dtdc.png`,
        delhivery: "assets/images/logos/delhivery.png",
        xpressbees: "assets/images/logos/expressbees.png"
      };
      const updatedCourierSplit = courierSplit.map(item => ({
        ...item,
        imageUrl: courierLogos[item.courier_name] || ""
      }));

    // === 6) Respond ===
    res.json({
      tablesUsed: T, // helpful for debugging
      businessInsightObj,
      orderSplitByPaymentMode: paymentSplit,
      shipmentSplitByShippingMode: shippingSplit,
      shipmentSplitByCourier: updatedCourierSplit,
      orderJsonResponse,
      valueJsonResponse,
      ShipmentSplitByWeight,
      OrderSplitAcrossTopStates,
      DeliveryPerformance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// route.get('/api/dashboard/shipments', auth, async (req, res) => {
//   try {
//     const clientId = req.user.selectedClientId ?? null;
//     const courierTypeParam = (req.query.courier_type || "").toLowerCase(); // "express" | "ecom"
//     if (clientId == null) {
//       return res.status(500).json({ error: "client id not selected" });
//     }
 
//     // === Table map for domains ===
//     const TABLES = {
//       express: { orders: "tbl_exp_orders", lr: "tbl_exp_lr" },
//       ecom: { orders: "tbl_ecom_orders", lr: "tbl_ecom_lr" },
//     };

//     // Default to "express" if courier_type not given
//     const domain = courierTypeParam === "ecom" ? "ecom" : "express";
//     const T = TABLES[domain];
 
//     // === Build filters ===
//     const applyClientFilter = clientId != 1; // 1 = Super Admin
//     const courierConditionSql = courierTypeParam ? `AND LOWER(c.courier_type) = LOWER(?)` : "";
//     const clientConditionSql = applyClientFilter ? `AND o.client_id = ?` : "";

//     // Params for the WHERE placeholders
//     const params = [
//       ...(courierTypeParam ? [courierTypeParam] : []),
//       ...(applyClientFilter ? [clientId] : []),
//     ];
 
//     // === Fetch statuses from LR table ===
//     const sql = `
//       SELECT lr.status
//       FROM ${T.lr} lr
//       JOIN ${T.orders} o ON o.id = lr.order_id
//       JOIN tbl_courier_details c ON lr.forwarder_id = c.id
//       WHERE 1=1 ${courierConditionSql} ${clientConditionSql}
//     `;
//     const results = await mySqlQury(sql, params);

//     // === Summarize (renamed keys) ===
//     const summary = {
//       total_orders: results.length,
//       ready_to_dispatch: 0,
//       ready_to_dispatch_post: 0,
//       in_transit: 0,
//       delivered: 0,
//       rto: 0,
//       rto_intransit: 0,
//       out_for_delivery: 0,
//       ndr: 0,
//     };

//     results.forEach((row) => {
//       const status = +row.status;
//       switch (status) {
//         case 1: summary.ready_to_dispatch++; break;
//         case 2: summary.ready_to_dispatch_post++; break;
//         case 3: summary.in_transit++; break;
//         case 4: summary.delivered++; break;
//         case 5: summary.rto++; break;
//         case 7: summary.rto_intransit++; break;
//         case 6:
//         case 8: summary.out_for_delivery++; break;
//         case 9: summary.ndr++; break;
//         default: break; // unknown status -> ignored
//       }
//     });

//     const total = summary.total_orders || 1;
//     const pct = (n) => Number(((n / total) * 100).toFixed(2));

//     // === Response with updated field names ===
//     const response = {
//       totalOrders: summary.total_orders,
//       readyToDispatch: summary.ready_to_dispatch,
//       readyToDispatchPost: summary.ready_to_dispatch_post,
//       inTransit: summary.in_transit,
//       delivered: summary.delivered,
//       rto: summary.rto,
//       rtoInTransit: summary.rto_intransit,
//       outForDelivery: summary.out_for_delivery,
//       ndr: summary.ndr,
//       percent: {
//         readyToDispatch: pct(summary.ready_to_dispatch),
//         readyToDispatchPost: pct(summary.ready_to_dispatch_post),
//         inTransit: pct(summary.in_transit),
//         delivered: pct(summary.delivered),
//         rto: pct(summary.rto),
//         rtoInTransit: pct(summary.rto_intransit),
//         outForDelivery: pct(summary.out_for_delivery),
//         ndr: pct(summary.ndr),
//       },
//     };

//     res.json(response);
//   } catch (err) {
//     console.error("Error fetching shipment summary:", err);
//     res.status(500).json({ error: "Failed to fetch shipment summary" });
//   }
// });

// shipment tracking page

route.post('/api/dashboard/shipments', auth, async (req, res) => {
  try {
    const clientId = req.user.selectedClientId ?? null;
    const courierTypeParam = (req.body.courier_type || "").toLowerCase(); // "express" | "ecom"
    if (clientId == null) {
      return res.status(500).json({ error: "client id not selected" });
    }

    // === Table map for domains ===
    const TABLES = {
      express: { orders: "tbl_exp_orders", lr: "tbl_exp_lr" },
      ecom:    { orders: "tbl_ecom_orders", lr: "tbl_ecom_lr" },
    };

    // Default to "express" if courier_type not given
    const domain = courierTypeParam === "ecom" ? "ecom" : "express";
    const T = TABLES[domain];

    // === FILTER INPUTS (body) ===
    const {
      fromDate,
      toDate,
      quickRange,
      payment_mode = "",
      destination_zone = "",
      tagged_api = "",
    } = (req.body || {});

    // ---- Helper: compute date range if quickRange provided
    function getDateRangeFromQuickRange(qr) {
      if (!qr) return null;
      // All calculations in Asia/Kolkata (+05:30) local semantics
      const now = new Date(); // server time; we normalize to local day strings below
      const toISODate = (d) => {
        // format YYYY-MM-DD using local time
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      // get start of local day
      const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

      let start = startOfDay(now);
      let end = endOfDay(now);

      switch (qr) {
        case 'today':
          // already set
          break;
        case 'yesterday': {
          const y = new Date(start);
          y.setDate(y.getDate() - 1);
          start = y;
          end = y;
          break;
        }
        case 'last7days': {
          const s = new Date(start);
          s.setDate(s.getDate() - 6);
          start = s;
          break;
        }
        case 'last30days': {
          const s = new Date(start);
          s.setDate(s.getDate() - 29);
          start = s;
          break;
        }
        case 'thisMonth': {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        }
        case 'lastMonth': {
          const m = now.getMonth();
          const y = now.getFullYear();
          const first = new Date(y, m - 1, 1);
          const last = new Date(y, m, 0); // day 0 = last day of previous month
          start = first;
          end = last;
          break;
        }
        default:
          return null;
      }
      return { from: toISODate(start), to: toISODate(end) };
    }

    // ---- Resolve date filter (inclusive)
    let resolvedFrom = null;
    let resolvedTo = null;
    if (quickRange) {
      const r = getDateRangeFromQuickRange(quickRange);
      if (r) {
        resolvedFrom = r.from;
        resolvedTo = r.to;
      }
    } else if (fromDate && toDate) {
      resolvedFrom = fromDate;
      resolvedTo = toDate;
    }
 
    // === Build WHERE clauses & params ===
    const applyClientFilter = clientId != 1; // 1 = Super Admin
    const where = [];
    const params = [];

    // courier_type (from query) via courier details table
    if (courierTypeParam) {
      where.push(`LOWER(c.courier_type) = LOWER(?)`);
      params.push(courierTypeParam);
    }

    // client filter on orders
    if (applyClientFilter) {
      where.push(`o.client_id = ?`);
      params.push(clientId);
    }

    // date filter on orders.created_at (inclusive by DATE())
    if (resolvedFrom && resolvedTo) {
      where.push(`DATE(o.created_at) BETWEEN ? AND ?`);
      params.push(resolvedFrom, resolvedTo);
    }

    // payment_mode on orders
    if (payment_mode && payment_mode.trim() !== "") {
      where.push(`LOWER(o.payment_mode) = LOWER(?)`);
      params.push(payment_mode.trim());
    }

    // destination_zone on LR
    const DEST_ZONE_COL = 'destination_zone'; // <-- change to 'destination_zon' if that's your column
    if (destination_zone && destination_zone.trim() !== "") {
      where.push(`LOWER(lr.${DEST_ZONE_COL}) = LOWER(?)`);
      params.push(destination_zone.trim());
    }

    // tagged_api on LR
    if (tagged_api && tagged_api.trim() !== "") {
      where.push(`LOWER(lr.tagged_api) = LOWER(?)`);
      params.push(tagged_api.trim());
    }

    const whereSql = where.length ? `AND ${where.join(' AND ')}` : '';

    // === Fetch statuses from LR table ===
    const sql = `
      SELECT lr.status
      FROM ${T.lr} lr
      JOIN ${T.orders} o ON o.id = lr.order_id
      JOIN tbl_courier_details c ON lr.forwarder_id = c.id
      WHERE 1=1
      ${whereSql}
    `;

    const results = await mySqlQury(sql, params);

    // === Summarize ===
    const summary = {
      total_orders: results.length,
      ready_to_dispatch: 0,
      ready_to_dispatch_post: 0,
      in_transit: 0,
      delivered: 0,
      rto: 0,
      rto_intransit: 0,
      out_for_delivery: 0,
      ndr: 0,
    };

    results.forEach((row) => {
      const status = +row.status;
      switch (status) {
        case 1: summary.ready_to_dispatch++; break;
        case 2: summary.ready_to_dispatch_post++; break;
        case 3: summary.in_transit++; break;
        case 4: summary.delivered++; break;
        case 5: summary.rto++; break;
        case 7: summary.rto_intransit++; break;
        case 6:
        case 8: summary.out_for_delivery++; break;
        case 9: summary.ndr++; break;
        default: break;
      }
    });

    const total = summary.total_orders || 1;
    const pct = (n) => Number(((n / total) * 100).toFixed(2));

    // === Response (camelCase keys) ===
    const response = {
      totalOrders: summary.total_orders,
      readyToDispatch: summary.ready_to_dispatch,
      readyToDispatchPost: summary.ready_to_dispatch_post,
      inTransit: summary.in_transit,
      delivered: summary.delivered,
      rto: summary.rto,
      rtoInTransit: summary.rto_intransit,
      outForDelivery: summary.out_for_delivery,
      ndr: summary.ndr,
      percent: {
        readyToDispatch: pct(summary.ready_to_dispatch),
        readyToDispatchPost: pct(summary.ready_to_dispatch_post),
        inTransit: pct(summary.in_transit),
        delivered: pct(summary.delivered),
        rto: pct(summary.rto),
        rtoInTransit: pct(summary.rto_intransit),
        outForDelivery: pct(summary.out_for_delivery),
        ndr: pct(summary.ndr),
      },
      // Echo back resolved filters (useful for debugging/UI)
      appliedFilters: {
        domain,
        courier_type: courierTypeParam || null,
        date: resolvedFrom && resolvedTo ? { from: resolvedFrom, to: resolvedTo } : null,
        payment_mode: payment_mode || null,
        destination_zone: destination_zone || null,
        tagged_api: tagged_api || null,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching shipment summary:", err);
    res.status(500).json({ error: "Failed to fetch shipment summary" });
  }
});
route.get('/shipment-tracking', (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  const role = req.user?.role || req.session?.role || null;

  res.render('pages/shipment-tracking', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
    role: role
  });
});
route.get('/ecom/shipment-tracking', (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  const role = req.user?.role || req.session?.role || null;

  res.render('pages/ecom/shipment-tracking', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
    role: role
  });
});
route.get('/express/shipment-tracking', (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  const role = req.user?.role || req.session?.role || null;

  res.render('pages/express/shipment-tracking', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
    role: role
  });
});
// ndr route
route.get('/ndr-manager',auth, accessControlMiddleware, (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  const role = req.user?.role || req.session?.role || null;

  res.render('pages/ndr-manager', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
    role: role
  });
});
// shipping label
route.get('/shipping-label',auth, async (req, res) => {
  try {
    const user_id = req.user?.selectedClientId;

    if (!user_id) {
      return res.status(400).render('error', {
        message: 'User ID not found',
        error: { status: 400 }
      });
    }

    // Fetch user preferences from database
    let userPreferences = null;
    try {
      const [existingPrefs] = await mySqlQury(
        'SELECT * FROM tbl_user_shipping_label_preferences WHERE user_id = ?',
        [user_id]
      );

      if (existingPrefs) {
        userPreferences = existingPrefs;
      }
    } catch (dbError) {
      console.error('Error fetching user preferences:', dbError);
      // Continue without preferences if database error
    }

    // Default preferences if none exist in database
    const defaultPreferences = {
      show_order_id: 1,
      show_invoice_number: 0,
      show_order_date: 1,
      show_invoice_date: 0,
      show_order_barcode: 1,
      show_invoice_barcode: 1,
      show_rto_routing: 1,
      show_declared_value: 1,
      show_shipper_phone: 1,
      show_gstin: 1,
      show_shipper_address: 1,
      show_brand_name: 1,
      show_brand_logo: 1,
      show_item_name: 1,
      show_product_cost: 1,
      show_product_quantity: 1,
      show_sku_code: 1,
      show_dimension: 1,
      show_dead_weight: 1,
      show_other_charges: 1,
      limit_item_name_length: 1,
      hide_buyer_sensitive_details: 1,
      default_label_size: 'A4'
    };

    // Use user preferences if available, otherwise use defaults
    const preferences = userPreferences || defaultPreferences;

    res.render('pages/shipping-label', {
      bodyClass: 'profile-page',
      activePage: 'profile',
      title: 'Shipping Label Settings',
      preferences: preferences,
      user_id: user_id
    });

  } catch (error) {
    console.error('Error loading shipping label page:', error);
    res.status(500).render('error', {
      message: 'Error loading shipping label page',
      error: { status: 500 }
    });
  }
});
// universal-tracking
route.get('/universal-tracking', (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  // const role = req.user?.role || req.session?.role || null;

  res.render('pages/universal-tracking', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
 
  });
});

route.use('/', express.static(path.join(__dirname, './')))

// Layout
route.get('/horizontal', (req, res, next) => {
  res.render('layouts/horizontal', { title: 'Metrica', layout: 'partials/layout-horizontal' })
})
route.get('/horizontal-topbar-dark', (req, res, next) => {
  res.render('layouts/horizontal-topbar-dark', { title: 'Metrica', layout: 'partials/layout-horizontal' })
})
route.get('/vertical-dark', (req, res, next) => {
  res.render('layouts/vertical-dark', { title: 'Metrica', layout: 'partials/layout-vertical' })
})
route.get('/horizontal-dark', (req, res, next) => {
  res.render('layouts/horizontal-dark', { title: 'Metrica', layout: 'partials/layout-horizontal' })
})
route.get('/vertical-dark2', (req, res, next) => {
  res.render('layouts/vertical-dark2', { title: 'Metrica', layout: 'partials/layout-vertical2' })
})
route.get('/vertical-rtl', (req, res, next) => {
  res.render('layouts/vertical-rtl', { title: 'Metrica', layout: 'partials/layout-rtl' })
})
route.get('/rtl-layout2', (req, res, next) => {
  res.render('layouts/rtl-layout2', { title: 'Metrica', layout: 'partials/layout-vertical2' })
})
route.get('/rtl-horizontal', (req, res, next) => {
  res.render('layouts/rtl-horizontal', { title: 'Metrica', layout: 'partials/layout-horizontal' })
})
route.get('/rtl-dark', (req, res, next) => {
  res.render('layouts/vertical-rtl-dark', { title: 'Metrica', layout: 'partials/layout-rtl' })
})
route.get('/dark-sidebar', (req, res, next) => {
  res.render('layouts/dark-sidebar', { title: 'Metrica', layout: 'partials/layout-vertical2' })
})
route.get('/material', (req, res, next) => {
  res.render('layouts/material', { title: 'Metrica', layout: 'partials/layout-vertical2' })
})
route.get('/dark-topbar', (req, res, next) => {
  res.render('layouts/dark-topbar', { title: 'Metrica', layout: 'partials/layout-vertical2' })
})

// API endpoint for shipping rates calculator
route.get('/api/shipping-rates', async (req, res) => {
  try {
    // Get the selected client ID from the request
    const selectedClientId = req.query.clientId || req.user?.selectedClientId;
    
    if (!selectedClientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Fetch shipping rates from the database
    const ratesQuery = `
      SELECT 
        af.Aggrigator_id,
        af.Forwarder_id,
        af.Tagged_api,
        af.service_type,
        a.first_name,
        a.last_name,
        a.Aggrigator_company_name,
        a.logo_path,
        vd.name as forwarder_name,
        vd.logo_path as forwarder_logo,
        vd.volumetric_divisor,
        vd.service_type as forwarder_service_type,
        cr.rate,
        cr.weight_slab_id,
        ws.min_weight,
        ws.max_weight
      FROM tbl_aggrigator_forwarder af
      LEFT JOIN tbl_aggrigator a ON af.Aggrigator_id = a.id
      LEFT JOIN tbl_vendor_details vd ON af.Forwarder_id = vd.id
      LEFT JOIN tbl_client_rates cr ON af.Aggrigator_id = cr.aggrigator_id AND cr.client_id = ?
      LEFT JOIN tbl_weight_slabs ws ON cr.weight_slab_id = ws.id
      WHERE af.Aggrigator_id IN (
        SELECT DISTINCT aggrigator_id 
        FROM tbl_client_rates 
        WHERE client_id = ?
      )
      ORDER BY af.Aggrigator_id, af.Forwarder_id, ws.min_weight
    `;
    
    const rates = await mySqlQury(ratesQuery, [selectedClientId, selectedClientId]);
    
    if (!rates || rates.length === 0) {
      return res.status(404).json({ 
        error: 'No shipping rates found for this client',
        message: 'Please contact your administrator to set up shipping rates'
      });
    }
    
    // Transform the data to match the expected format
    const transformedRates = rates.map(rate => {
      // Use actual rate data from database
      const baseRate = rate.rate || 200;
      const addlPerKg = Math.round(baseRate * 0.1); // 10% of base rate for additional kg
      
      // Create weight slab based on actual data
      const weightSlab = {
        label: `${rate.service_type} (${rate.Tagged_api})`,
        baseUpToKg: rate.max_weight || 10,
        baseRate: baseRate,
        addlPerKg: addlPerKg
      };
      
      // Add COD charges based on service type
      const codCharges = {
        type: 'flat',
        flat: rate.service_type?.toLowerCase().includes('air') ? 100 : 75,
        max: rate.service_type?.toLowerCase().includes('air') ? 300 : 150
      };
      
      return {
        id: `${rate.Tagged_api?.toLowerCase()}_${rate.service_type?.toLowerCase()}`,
        name: rate.Aggrigator_company_name || `${rate.first_name} ${rate.last_name}`,
        logo: rate.logo_path || rate.forwarder_logo || '',
        mode: rate.service_type?.toLowerCase().includes('air') ? 'air' : 'surface',
        volumetricDivisor: rate.volumetric_divisor || (rate.service_type?.toLowerCase().includes('air') ? 5000 : 6000),
        rateOptions: [{
          ...weightSlab,
          cod: codCharges
        }]
      };
    });

    res.json({ rates: transformedRates });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    res.status(500).json({ error: 'Failed to fetch shipping rates' });
  }
});

// ----------------------------------------------------------------------------------------------------------------
// route.get('/auth-404', auth, (req, res, next) => {
//     res.render('auth/error-404', { title: 'Error 404',layout: 'partials/layout-auth',  user: req.session.user })
// })
// route.get('/auth-404-alt', auth, (req, res, next) => {
//     res.render('auth/error-404-alt', { title: 'Error 404',layout: 'partials/layout-auth',  user: req.session.user })
// })
// route.get('/auth-500', auth, (req, res, next) => {
//     res.render('auth/error-500', { title: 'Error 500',layout: 'partials/layout-auth',  user: req.session.user })
// })
// route.get('/auth-500-alt', auth, (req, res, next) => {
//     res.render('auth/error-500-alt', { title: 'Error 500',layout: 'partials/layout-auth',  user: req.session.user })
// })



// deepanshu route here paste 



// require("dotenv").config({ path: "./config.env" });

route.post("/api/ndr-ecom/call", userController.ecomCall);


route.post("/api/ndr-exp/call", userController.expCall);


route.post(
  "/api/automation/customer-not-available",
  auth, // if you want authentication
  userController.saveCustomerNotAvailable
);

route.get(
  "/api/automation/customer-not-available",
  auth, // optional
  userController.getCustomerNotAvailable
);


route.post('/api/customer/update-address', userController.postCustomerUpdate);







// ✅ Hardcoded mail config
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "onboarding@dispatch.co.in",
    pass: "Shabi@4020",
  },
});

// 👉 Step 1: Send Initial Mail
route.post("/send-initial", async (req, res) => {
  try {
    const { customerEmail, customerName, brandName, courier, awb } = req.body;

    const mailOptions = {
      from: "onboarding@dispatch.co.in",
      to: customerEmail,
      subject: `Delivery Attempt Failed - ${brandName}`,
      html: `
        Dear ${customerName},<br><br>
        Your order from ${brandName} with ${courier} AWB# ${awb} is undelivered since you weren’t available.<br>
        If it is not true, please 
        <a href="${BASE_URL}/response?status=false&awb=${awb}&to=${customerEmail}">click False</a>,<br>
        else 
        <a href="${BASE_URL}/response?status=true&awb=${awb}&to=${customerEmail}">click True</a>.
        <br><br>
        Thanks,<br>
        Team ${brandName}
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ status: "sent", message: "Initial email sent" });
  } catch (err) {
    console.error("Error sending initial mail:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// 👉 Step 2: Handle Response (Chat UI)
route.get("/response", async (req, res) => {
  const { status, awb, to } = req.query;

  let chatMessages = [
    { from: "system", text: `Your order with AWB #${awb} could not be delivered.` },
  ];

  try {
    if (status === "false") {
      chatMessages.push({ from: "customer", text: "❌ No, I was available" });
      chatMessages.push({ from: "system", text: "Sorry for the inconvenience, we’ll reattempt delivery soon." });

      await transporter.sendMail({
        from: "onboarding@dispatch.co.in",
        to,
        subject: "Delivery Feedback Received",
        html: `Dear Customer,<br>Your order ${awb} will be delivered soon.<br><br>Team Brand`,
      });
    }

    if (status === "true") {
      chatMessages.push({ from: "customer", text: "✅ Yes, I was not available" });
      chatMessages.push({ from: "system", text: "When should we redeliver?" });
      chatMessages.push({
        from: "options",
        text: `
          <a href="${BASE_URL}/reschedule?time=24&awb=${awb}&to=${to}">📦 Within 24 Hrs</a><br>
          <a href="${BASE_URL}/reschedule?time=48&awb=${awb}&to=${to}">⏳ Within 48 Hrs</a><br>
          <a href="${BASE_URL}/reschedule?time=72&awb=${awb}&to=${to}">📅 Within 72 Hrs</a>
        `,
      });

      await transporter.sendMail({
        from: "onboarding@dispatch.co.in",
        to,
        subject: "Reschedule Delivery",
        html: `Dear Customer,<br>Please confirm when we can redeliver your order ${awb}.<br><br>Team Brand`,
      });
    }

    res.send(renderChat(chatMessages));
  } catch (err) {
    console.error("Error handling response:", err);
    res.status(500).send("Error processing response");
  }
});

// 👉 Step 3: Handle Reschedule (Chat UI)
route.get("/reschedule", async (req, res) => {
  const { time, awb, to } = req.query;

  let chatMessages = [
    { from: "system", text: `Reschedule request for AWB #${awb}` },
    { from: "customer", text: `I choose delivery within ${time} hrs` },
    { from: "system", text: `✅ Great! Your order will be delivered within ${time} hrs.` },
  ];

  try {
    await transporter.sendMail({
      from: "onboarding@dispatch.co.in",
      to,
      subject: "Delivery Rescheduled",
      html: `Dear Customer,<br>Your order ${awb} is rescheduled (${time} hrs).<br><br>Team Brand`,
    });

    res.send(renderChat(chatMessages));
  } catch (err) {
    console.error("Error sending reschedule confirmation:", err);
    res.status(500).send("Error sending reschedule confirmation");
  }
});

// helper to render chat UI
function renderChat(messages) {
  let bubbles = messages.map((m) => {
    if (m.from === "customer")
      return `<div class="bubble customer">${m.text}</div>`;
    if (m.from === "options")
      return `<div class="bubble system options">${m.text}</div>`;
    return `<div class="bubble system">${m.text}</div>`;
  });

  return `
    <html>
    <head>
      <title>Dispatch Chat</title>
      <link rel="stylesheet" href="/chat.css">
    </head>
    <body>
      <div class="chat-box">
        ${bubbles.join("")}
      </div>
    </body>
    </html>
  `;
}


const uploadIbr = require('../middleware/uploadIbr');



route.post("/api/ibr", uploadIbr.fields([
    { name: "screenshot", maxCount: 1 },
    { name: "voice", maxCount: 1 },
  ]),
  userController.createIbr
);



route.post('/api/customer/update-address', userController.postCustomerUpdate);
route.post('/api/customer/update-address/ecom', userController.postCustomerUpdateEcom);


route.get('/api/customer/update-address', userController.getCustomerUpdates);
route.get('/api/customer/update-address/ecom', userController.getCustomerUpdates);

route.post("/api/send-whatsapp", userController.sendWhatsAppVerification);






route.post("/update-undel-reason", userController.addNdrReason);
route.get("/ndr-history/exp", userController.getNdrHistoryexp);
route.get("/ndr-history", userController.getNdrHistory);





route.get("/ndr-history/ecom", userController.getNdrHistoryecom);









///======================NDR ROUTES==================================///
// route.post('/delivery-reattempt', userController.createReattempt);
route.get("/ndr-actions", userController.getNdrActions);
route.get("/ndr-actions/ecom", userController.getNdrActionsecom);

route.post('/delivery-reattempt', userController.createReattempt);
route.post('/delivery-reattempt/ecom', userController.createReattemptecom);


route.post('/rto-request', userController.createRto);
route.post('/rto-request/ecom', userController.createRtoecom);


route.post('/escalation', userController.createEscalation);




route.get('/api/get-order-details', userController.getAllOrderDetails);
route.get('/api/get-order-details/ecom', userController.getAllOrderDetailsecom);









// ======================
// HELPDESK ROUTES
// ======================

// List admins for a given client_id

// Update ticket status by ticketId and new status
route.put('/api/support/tickets/:ticketId/status/:status', userController.updateSupportTicketStatus);

// route.get('/api/support/overview', userController.getSupportTicketsWithAdmins);
route.get('/api/clients/:clientId/admins', userController.getAdminsByClientId);

route.get('/api/clients/:clientId/lr-nos', userController.getClientLRNumbers);
route.get('/support/categories', userController.getSupportCategories);
route.post('/api/support/tickets', userController.createTicket);

route.get('/api/support/overview', userController.getSupportTicketsWithAdmins);









 

route.get('/helpdesk', (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  const role = req.user?.role || req.session?.role || null;

  res.render('pages/helpdesk', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
    role: role
  });
});

route.get('/view-support-tickets', (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  const role = req.user?.role || req.session?.role || null;

  res.render('pages/view-support-tickets', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
    role: role
  });
});

route.get('/ndr-management-express', (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  const role = req.user?.role || req.session?.role || null;

  res.render('pages/ndr-management-express', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
    role: role
  });
});
route.get('/ndr-managerment-ecom', (req, res) => {
  // Assuming req.user.role or req.session.role contains the user's role
  // Adjust as per your authentication/session implementation
  const role = req.user?.role || req.session?.role || null;

  res.render('pages/ndr-management-ecom', {
    bodyClass: 'profile-page',
    activePage: 'profile',
    title: 'Client List',
    role: role
  });
});



route.get('/update-address-details-express', auth, async (req, res) => {
  try {
    const role = req.user?.role || req.session?.role || null;
    res.render('pages/update-address-details-express', {
      title: 'Client Package Manager',
      bodyClass: 'profile-page',
      activePage: 'client-package',
 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading packages');
  }
});



route.get('/update-address-details-ecom', auth, async (req, res) => {
  try {
    const role = req.user?.role || req.session?.role || null;
    res.render('pages/update-address-details-ecom', {
      title: 'Client Package Manager',
      bodyClass: 'profile-page',
      activePage: 'client-package',
 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading packages');
  }
});



route.get('/customer-not-available', auth, async (req, res) => {
  try {
    const role = req.user?.role || req.session?.role || null;
    res.render('pages/customer-not-available', {
      title: 'Client Package Manager',
      bodyClass: 'profile-page',
      activePage: 'client-package',
 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading packages');
  }
});




route.get('/customer-not-available-exp', auth, async (req, res) => {
  try {
    const role = req.user?.role || req.session?.role || null;
    res.render('pages/customer-not-available-exp', {
      title: 'Client Package Manager',
      bodyClass: 'profile-page',
      activePage: 'client-package',
 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading packages');
  }
});

route.get('/terms-and-conditions', async (req, res) => {
  try {
    const role = req.user?.role || req.session?.role || null;
    res.render('pages/terms-and-conditions', {
      title: 'Terms & Conditions',
      bodyClass: 'terms-page',
      activePage: 'terms-conditions',
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading terms and conditions');
  }
});

// Temporarily remove auth for testing
route.get('/privacy-policy', async (req, res) => {
  try {
    const role = req.user?.role || req.session?.role || null;
    res.render('pages/privacy-policy', {
      title: 'Privacy Policy',
      bodyClass: 'privacy-page',
      activePage: 'privacy-policy',
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading privacy policy');
  }
});

route.get('/contact-us', auth, async (req, res) => {
  try {
    const role = req.user?.role || req.session?.role || null;
    res.render('pages/contact-us', {
      title: 'Contact Us',
      bodyClass: 'contact-page',
      activePage: 'contact-us',
      user: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading contact page');
  }
});

module.exports = route;   