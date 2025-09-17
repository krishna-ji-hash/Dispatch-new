// models/index.js
const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// ---- Import Models ----
const Category                  = require('./Category')(sequelize, DataTypes);
const SubCategory               = require('./SubCategory')(sequelize, DataTypes);
const SubCategoryAddField       = require('./SubCategoryAddField')(sequelize, DataTypes);
const SubCategoryMandatoryField = require('./SubCategoryMandatoryField')(sequelize, DataTypes);
const Ticket                    = require('./Ticket')(sequelize, DataTypes);

const ExpOrders                 = require('./TblExpOrders')(sequelize, DataTypes);
const ExpLR                     = require('./tbl_exp_lr')(sequelize, DataTypes);
const ExpProductDetails         = require('./TblExpProductDetails')(sequelize, DataTypes);
const ConsigneeDetails          = require('./ExpConsigneeDetails')(sequelize, DataTypes);

const EcomOrders                = require('./TblEcomOrders')(sequelize, DataTypes);
const EcomLR                    = require('./tbl_ecom_lr')(sequelize, DataTypes);
const EcomProductDetails        = require('./TblEcomProductDetails')(sequelize, DataTypes);
const EcomConsigneeDetails      = require('./TblEcomConsigneeDetails')(sequelize, DataTypes);

const Admin                     = require('./Admin')(sequelize, DataTypes);
const SupportTicket             = require('./SupportTicket')(sequelize, DataTypes);
const TblDeliveryReattempts   = require('./TblDeliveryReattempts')(sequelize, DataTypes);
const TblDeliveryReattemptsEcom   = require('./TblDeliveryReattemptsecom')(sequelize, DataTypes);
const TblRtoRequests   = require('./TblRtoRequests')(sequelize, DataTypes);
const TblRtoRequestsecom   = require('./TblRtoRequestsecom')(sequelize, DataTypes);
const TblEscalation   = require('./TblEscalation')(sequelize, DataTypes);
const TblEscalationEcom   = require('./TblEsclationecom')(sequelize, DataTypes);
const ExpNdrReason = require('./ExpNdrReason')(sequelize, DataTypes);
const EcomNdrReason = require('./EcomNdrReason')(sequelize, DataTypes);
const NdrReason = require('./ndrReason')(sequelize, DataTypes);
const UpdatedCustomerDetail = require('./UpdatedCustomerDetail')(sequelize, DataTypes);
const Ibr = require('./ibr')(sequelize, DataTypes);
const AutomationFlow = require('./automationFlow')(sequelize, DataTypes);
const Callecom = require('./Callecom')(sequelize, DataTypes);
const Callexp = require('./Callexp')(sequelize, DataTypes);
const AddressVerificationLog = require('./AddressVerificationLog')(sequelize, DataTypes);
const CodSummary = require('./CodSummary')(sequelize, DataTypes);
const CreateLR = require('./CreateLR')(sequelize, DataTypes);
const TblBankRecovSpoid = require('./TblBankRecovSpoid')(sequelize, DataTypes);
const TblBankRemitence = require('./TblBankRemitence')(sequelize, DataTypes);
const TblCodSummary = require('./CodSummary')(sequelize, DataTypes);


// ---- Associations ----
Category.associate?.({ SubCategory, SubCategoryAddField, SubCategoryMandatoryField });
SubCategory.associate?.({ Category, SubCategoryAddField, SubCategoryMandatoryField });
SubCategoryAddField.associate?.({ SubCategory });
SubCategoryMandatoryField.associate?.({ SubCategory });


/**
 * ======================
 * EXPRESS ORDER ECOSYSTEM
 * ======================
 */


// CodSummary.hasMany(EcomLR, { foreignKey: "lr_no", sourceKey: "lr_no" });
// EcomLR.belongsTo(CodSummary, { foreignKey: "lr_no", targetKey: "lr_no" });

// ExpOrders ↔ ExpLR
ExpOrders.hasMany(ExpLR, {
  foreignKey: 'order_id',   // tbl_exp_lr.order_id INT
  sourceKey: 'id',
  as: 'exp_lrs'
});
ExpLR.belongsTo(ExpOrders, {
  foreignKey: 'order_id',
  targetKey: 'id',
  as: 'exp_order'
});

// ExpOrders ↔ ExpProductDetails
ExpOrders.hasMany(ExpProductDetails, {
  foreignKey: 'order_id',   // tbl_exp_product_details.order_id INT
  sourceKey: 'id',
  as: 'products'
});
ExpProductDetails.belongsTo(ExpOrders, {
  foreignKey: 'order_id',
  targetKey: 'id',
  as: 'exp_order'
});

// ExpOrders ↔ ConsigneeDetails
ExpOrders.hasOne(ConsigneeDetails, {
  foreignKey: 'order_id',   // tbl_exp_consignee_details.order_id INT
  sourceKey: 'id',
  as: 'consignee'
});
ConsigneeDetails.belongsTo(ExpOrders, {
  foreignKey: 'order_id',
  targetKey: 'id',
  as: 'exp_order'
});

// ExpOrders ↔ Admin
ExpOrders.belongsTo(Admin, {
  foreignKey: 'client_id',
  targetKey: 'id',
  as: 'client'
});
Admin.hasMany(ExpOrders, {
  foreignKey: 'client_id',
  sourceKey: 'id',
  as: 'exp_orders'
});

/**
 * ======================
 * ECOM ORDER ECOSYSTEM
 * ======================
 */

// EcomOrders ↔ EcomLR
EcomOrders.hasMany(EcomLR, {
  foreignKey: 'order_id',   // tbl_ecom_lr.order_id INT
  sourceKey: 'id',
  as: 'ecom_lrs'
});
EcomLR.belongsTo(EcomOrders, {
  foreignKey: 'order_id',
  targetKey: 'id',
  as: 'ecom_order'
});

// EcomOrders ↔ EcomProductDetails
EcomOrders.hasMany(EcomProductDetails, {
  foreignKey: 'order_id',   // tbl_ecom_product_details.order_id INT
  sourceKey: 'id',
  as: 'products'
});
EcomProductDetails.belongsTo(EcomOrders, {
  foreignKey: 'order_id',
  targetKey: 'id',
  as: 'ecom_order'
});

// EcomOrders ↔ EcomConsigneeDetails
EcomOrders.hasOne(EcomConsigneeDetails, {
  foreignKey: 'order_id',   // tbl_ecom_consignee_details.order_id INT
  sourceKey: 'id',
  as: 'consignee'
});
EcomConsigneeDetails.belongsTo(EcomOrders, {
  foreignKey: 'order_id',
  targetKey: 'id',
  as: 'ecom_order'
});

// EcomOrders ↔ Admin
EcomOrders.belongsTo(Admin, {
  foreignKey: 'client_id',
  targetKey: 'id',
  as: 'client'
});
Admin.hasMany(EcomOrders, {
  foreignKey: 'client_id',
  sourceKey: 'id',
  as: 'ecom_orders'
});

EcomNdrReason.associate = (models) => {
  EcomNdrReason.belongsTo(models.EcomOrder, { foreignKey: "order_id", as: "order" });
};


EcomNdrReason.belongsTo(EcomOrders, {
  foreignKey: "order_id",
  targetKey: "id",
  as: "order"
});
EcomOrders.hasMany(EcomNdrReason, {
  foreignKey: "order_id",
  sourceKey: "id",
  as: "ndr_reasons"
});




ExpNdrReason.associate = (models) => {
  ExpNdrReason.belongsTo(models.ExpOrders, { foreignKey: "order_id", as: "order" });
};

ExpNdrReason.belongsTo(ExpOrders, {
  foreignKey: "order_id",
  targetKey: "id",
  as: "order"
});

ExpOrders.hasMany(ExpNdrReason, {
  foreignKey: "order_id",
  sourceKey: "id",
  as: "ndr_reasons"
});


// // EcomOrders ↔ EcomLR
EcomOrders.hasMany(EcomLR, { foreignKey: "order_id", sourceKey: "id", as: "lrs" });
EcomLR.belongsTo(EcomOrders, { foreignKey: "order_id", targetKey: "id", as: "order" });

// EcomOrders ↔ Admin
// EcomOrders.belongsTo(Admin, { foreignKey: "client_id", targetKey: "id", as: "client" });
// Admin.hasMany(EcomOrders, { foreignKey: "client_id", sourceKey: "id", as: "orders" });


EcomOrders.belongsTo(Admin, { 
  foreignKey: "client_id", 
  targetKey: "id", 
  as: "orderClient"  // Changed from "client" to "orderClient"
});

Admin.hasMany(EcomOrders, { 
  foreignKey: "client_id", 
  sourceKey: "id", 
  as: "clientOrders"  // Changed from "orders" to "clientOrders"
});



/**
 * ======================
 * EXPORT MODELS
 * ======================
 */
module.exports = {
  sequelize,
  Category, SubCategory, SubCategoryAddField, SubCategoryMandatoryField,
  Ticket, SupportTicket,
  ExpOrders, ExpLR, ExpProductDetails, ConsigneeDetails,
  EcomOrders, EcomLR, EcomProductDetails, EcomConsigneeDetails,
  Admin, TblDeliveryReattempts, TblRtoRequests, TblEscalation, ExpNdrReason,
  EcomNdrReason, NdrReason, UpdatedCustomerDetail, TblEscalationEcom, 
  TblRtoRequestsecom, TblDeliveryReattemptsEcom, Ibr, AutomationFlow, Callecom, 
  Callexp, AddressVerificationLog, CodSummary, CreateLR, TblBankRecovSpoid, TblBankRemitence, TblCodSummary
};
