-- ================================================
-- Clean Database Script
-- Smart Attendance System
-- ================================================
-- This script removes all test/dummy data from the database
-- Run this in MySQL Workbench to clean your database

USE smart_attendance_system;

-- ================================================
-- WARNING: This will delete ALL data in the database
-- Make sure you want to do this before running!
-- ================================================

-- Delete test users (admin@example.com and student@example.com)
DELETE FROM users WHERE email IN ('admin@example.com', 'student@example.com');

-- Optional: Delete ALL users (uncomment if you want a completely fresh start)
-- DELETE FROM users;

-- Optional: Delete ALL attendance records (uncomment if needed)
-- DELETE FROM attendance;

-- Optional: Delete ALL leave requests (uncomment if needed)  
-- DELETE FROM leave_requests;

-- Optional: Delete ALL chat history (uncomment if needed)
-- DELETE FROM chat_history;

-- Optional: Delete ALL subjects (uncomment if needed)
-- DELETE FROM subjects;

-- Show remaining users
SELECT id, name, email, role, student_id, department, semester, is_active 
FROM users 
ORDER BY created_at DESC;

-- ================================================
-- After cleaning, create a new admin user via API:
-- ================================================
-- POST http://localhost:8080/api/auth/register
-- {
--   "name": "Your Admin Name",
--   "email": "youradmin@email.com",
--   "password": "your_secure_password",
--   "role": "ADMIN",
--   "phoneNumber": "1234567890",
--   "department": "Administration",
--   "assignedSemester": "1,2,3,4,5,6,7,8"
-- }
