module.exports = (sequelize, DataTypes) => {
  const TblBankRemitence = sequelize.define(
    "TblBankRemitence",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      utr_deposited_on: {
        type: DataTypes.DATE
      },
      utr_number: {
        type: DataTypes.STRING
      },
      remitted_amount: {
        type: DataTypes.DECIMAL(10, 2)
      },
      file_uploaded_on: {
        type: DataTypes.DATE
      },
      download_utr_data: {
        type: DataTypes.STRING
      },
      bank_name: {
        type: DataTypes.STRING
      },
      shipment_mode: {
        type: DataTypes.STRING
      },
      Amt_Bank_Recv_Forwarder: {
        type: DataTypes.DECIMAL(10, 2)
      }
    },
    {
      tableName: "tbl_bank_remitence",
      timestamps: false
    }
  );

  return TblBankRemitence;
};
