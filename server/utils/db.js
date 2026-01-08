const mysql = require("mysql2");
const pool = mysql.createPool({
  host: "localhost",
  user: "D2_92865_om",
  password: "manager",
  database: "rating_db",
});

module.exports = pool;
