const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "lms",
 
};

const pool = mysql.createPool(dbConfig);



module.exports =  pool ;

