CREATE DATABASE IF NOT EXISTS lms;

USE lms;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  admin_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
);


CREATE TABLE IF NOT EXISTS leads 
( id INT AUTO_INCREMENT PRIMARY KEY, Lead_Name VARCHAR(100) NOT NULL, 
Lead_Phone_Number VARCHAR(20), Lead_Wp_Number VARCHAR(20), Lead_Email_Id VARCHAR(100),
 Lead_Address VARCHAR(255), Lead_Country VARCHAR(50), Lead_City VARCHAR(50), Lead_State VARCHAR(50),
  Lead_pincode VARCHAR(20), Company_Name VARCHAR(100), Lead_Title VARCHAR(100), Lead_Source VARCHAR(50), 
  Lead_Priority VARCHAR(50), Lead_Description VARCHAR(255), Staff_Name VARCHAR(100), staffId INT NULL,
   Referrence_Person_Name VARCHAR(100), Referrence_Person_Phone_Number VARCHAR(20), Estimate_Amount DECIMAL(10,2), 
   Follow_Up_Date DATE, Follow_Up_Time TIME, Lead_Status VARCHAR(50),
    userId INT NOT NULL, 
    created_by VARCHAR(100), 
   created_by_email VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE )