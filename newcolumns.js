const mysql = require("mysql2");
require('dotenv').config({ path: './password.env' });

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "ecg_db"
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        console.log('💡 Make sure MySQL is running');
        return;
    }
    console.log('✅ Connected to MySQL');

    // Add column
    connection.query("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT 0", (err) => {
        if (err && !err.message.includes('Duplicate')) {
            console.error('❌ Failed to add column:', err.message);
        } else {
            console.log('✅ is_verified column added/verified');
        }
    });

    // Create table
    connection.query(`CREATE TABLE IF NOT EXISTS email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_code (code)
    )`, (err) => {
        if (err) {
            console.error('❌ Failed to create table:', err.message);
        } else {
            console.log('✅ email_verifications table created/verified');
        }
        console.log('✅ Migration completed!');
        connection.end();
    });
});