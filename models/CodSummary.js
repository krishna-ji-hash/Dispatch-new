// dispatchmain\models\CodSummary.js
module.exports = (sequelize, DataTypes) => {
  const TblCodSummary = sequelize.define("TblCodSummary", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: DataTypes.STRING,
    client_id: DataTypes.INTEGER,
    client_name: DataTypes.STRING,
    company_name: DataTypes.STRING,
    lr_no: DataTypes.STRING,
    total_box: DataTypes.INTEGER,
    tagged_api: DataTypes.STRING,
    dispatch_mode: DataTypes.STRING,
    delivery_date: DataTypes.DATE,
    status: DataTypes.STRING,
    payment_mode: DataTypes.STRING,
    cod_amount: DataTypes.FLOAT
  }, {
    tableName: "tbl_cod_summary",
    timestamps: false
  });
  return TblCodSummary;
};
