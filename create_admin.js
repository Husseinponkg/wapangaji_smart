const bcrypt = require('bcrypt');
const db = require('./config/db');

// Admin credentials
const adminUsername = 'admin';
const adminPassword = 'admin234';

async function createAdminUser() {
  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    // Insert admin user into database
    const sql = `INSERT INTO admin (username, password) VALUES (?, ?)`;
    const [result] = await db.execute(sql, [adminUsername, hashedPassword]);
    
    console.log('Admin user created successfully');
    console.log('Username:', adminUsername);
    console.log('Password:', adminPassword);
    console.log('Admin ID:', result.insertId);
    
    // Close the database connection
    await db.end();
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
}

createAdminUser();