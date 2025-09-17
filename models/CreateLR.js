module.exports = (sequelize, DataTypes) => {
  const CreateLR = sequelize.define("CreateLR", {
    lr_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: DataTypes.STRING,
    po_id: DataTypes.STRING,
    lr_No: DataTypes.STRING,
    order_date: DataTypes.DATE,
    Tagged_api: DataTypes.STRING,
    aggrigator_id: DataTypes.INTEGER,
    aggrigator_type: DataTypes.STRING,
    client_id: DataTypes.INTEGER,
    lr_Type: DataTypes.STRING,
    consignee_Name: DataTypes.STRING,
    insurance_Type: DataTypes.STRING,
    pickup_Pincode: DataTypes.STRING,
    destination_Pincode: DataTypes.STRING,
    pickup_Add: DataTypes.STRING,
    destination_Add: DataTypes.STRING,
    total_Weight: DataTypes.FLOAT,
    total_Box: DataTypes.INTEGER,
    mode_Of_Payment: DataTypes.STRING,
    invoice_Value: DataTypes.FLOAT,
    invoice_No: DataTypes.STRING,
    eway_bill: DataTypes.STRING,
    shipper_Gst: DataTypes.STRING,
    consignee_Gst: DataTypes.STRING,
    volumetric_weight: DataTypes.FLOAT,
    chargable_weight: DataTypes.FLOAT,
    status: DataTypes.STRING,
    eta: DataTypes.DATE,
    weight_unit: DataTypes.STRING,
    billing_status: DataTypes.STRING
  }, {
    tableName: "tbl_create_lr",
    timestamps: false
  });

  return CreateLR;
};
