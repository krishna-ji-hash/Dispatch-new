// models/AddressVerificationLog.js
module.exports = (sequelize, DataTypes) => {
  const AddressVerificationLog = sequelize.define("AddressVerificationLog", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullPhoneNumber: { type: DataTypes.STRING, allowNull: false },
    customer_name: { type: DataTypes.STRING },
    order_id: { type: DataTypes.STRING },
    store_name: { type: DataTypes.STRING },
    courier_name: { type: DataTypes.STRING },
    awb: { type: DataTypes.STRING },
    address_line1: { type: DataTypes.STRING },
    address_line2: { type: DataTypes.STRING },
    landmark: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    pincode: { type: DataTypes.STRING },
    action_taken: {
      type: DataTypes.ENUM("CONFIRM_ADDRESS", "UPDATE_ADDRESS"),
      allowNull: true,
    },
    updated_address_line1: { type: DataTypes.STRING },
    updated_address_line2: { type: DataTypes.STRING },
    updated_landmark: { type: DataTypes.STRING },
    updated_country: { type: DataTypes.STRING },
    updated_state: { type: DataTypes.STRING },
    updated_city: { type: DataTypes.STRING },
    updated_pincode: { type: DataTypes.STRING },
  }, {
    tableName: "tbl_address_verification_log",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });

  return AddressVerificationLog;
};
