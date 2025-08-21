CREATE DATABASE wapangaji;
USE wapangaji;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    f_name VARCHAR(100),
    l_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    profile_pic VARCHAR(255),
    role ENUM('mpangaji','dalali','mwenyenyumba'),
    payment_method ENUM('airtel_money','mpesa','halopesa','mixx_by_yas'),
    password VARCHAR(255),
    suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add suspended column to users table (for existing databases)
-- ALTER TABLE users ADD COLUMN suspended BOOLEAN DEFAULT FALSE;

-- Admin table
CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    username VARCHAR(100),
    password VARCHAR(255),
    profile_pic VARCHAR(255),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Services table
CREATE TABLE services (
    nyumba_id INT PRIMARY KEY AUTO_INCREMENT,
    uploaded_house VARCHAR(255),
    userId INT,
    house_type ENUM('master','single','double'),
    location VARCHAR(255),
    contact VARCHAR(20),
    price DECIMAL(10, 2),
    image_url VARCHAR(255),
    status ENUM('available', 'sold_out') DEFAULT 'available',
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
