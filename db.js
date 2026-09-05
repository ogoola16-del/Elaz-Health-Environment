const mysql = require("mysql");


require('dotenv').config({ path: './password.env' });
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "ecg_db"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed");
        return;
    }

    console.log("Connected to MySQL");
});

module.exports = db;