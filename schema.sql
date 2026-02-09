-- SQL Schema for Koyra-Paikgacha User Registration
-- This table stores all citizen information with security and performance constraints

CREATE TABLE users (
    -- Unique Member ID (Primary Key) 
    -- Format: Custom logic based on DOB and Mobile (e.g., 24501309212980)
    member_id VARCHAR(20) PRIMARY KEY, 
    
    -- User's full name (Mandatory)
    full_name VARCHAR(100) NOT NULL,
    
    -- Unique Mobile Number (Mandatory, prevents duplicate accounts)
    mobile_number VARCHAR(11) UNIQUE NOT NULL,
    
    -- Optional Email address
    email VARCHAR(100),
    
    -- Date of Birth (Mandatory)
    dob DATE NOT NULL,
    
    -- Village/Address (Mandatory)
    village VARCHAR(100) NOT NULL,
    
    -- National ID Number (Optional)
    nid VARCHAR(20),
    
    -- Encrypted Password (Mandatory)
    -- Store only hashed values using algorithms like BCrypt
    password VARCHAR(255) NOT NULL,
    
    -- System generated registration timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Account status for administrative control
    status VARCHAR(15) DEFAULT 'active'
);

-- Index for faster profile lookups via mobile number
CREATE INDEX idx_users_mobile ON users(mobile_number);