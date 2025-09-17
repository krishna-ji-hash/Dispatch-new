module.exports = (sequelize, DataTypes) => {
  const TblBankRecovSpoid = sequelize.define(
    "TblBankRecovSpoid",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      utr_number: {
        type: DataTypes.STRING
      },
      client_name: {
        type: DataTypes.STRING
      },
      qty: {
        type: DataTypes.INTEGER
      },
      lr_awb: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.STRING
      },
      remitted_amount: {
        type: DataTypes.DECIMAL(10, 2)
      },
      forwarder: {
        type: DataTypes.STRING
      },
      bank_name: {
        type: DataTypes.STRING
      },
      cod_amount: {
        type: DataTypes.DECIMAL(10, 2)
      },
      client_code: {
        type: DataTypes.STRING
      },
      consignee_name: {
        type: DataTypes.STRING
      },
      origin: {
        type: DataTypes.STRING
      },
      destination: {
        type: DataTypes.STRING
      },
      dispatch_mode: {
        type: DataTypes.STRING
      },
      vendor_name: {
        type: DataTypes.STRING
      },
      remark: {
        type: DataTypes.TEXT
      },
      acc: {
        type: DataTypes.STRING
      },
      booking_date: {
        type: DataTypes.DATE
      },
      order_type: {
        type: DataTypes.STRING
      }
    },
    {
      tableName: "tbl_bankrecovspoid",
      timestamps: false
    }
  );

  return TblBankRecovSpoid;
};
