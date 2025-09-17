// config/sequelize.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const sequelize = new Sequelize(
  process.env.DB_NAME || "dsnew20",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false, // SQL logs off
  }
);

module.exports = sequelize;
