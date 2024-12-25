const mysql = require("mysql2");

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Chandrika98*",
  database: "Employee_Management_system",
});
module.exports = connection.promise();
