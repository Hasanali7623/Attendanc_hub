-- Check for student count discrepancy
-- Run this in MySQL Workbench to see why counts don't match

USE smart_attendance_system;

-- Show all students in database
SELECT 
    id,
    name,
    email,
    role,
    student_id,
    is_active,
    created_at
FROM users 
WHERE role = 'STUDENT'
ORDER BY created_at DESC;

-- Count total students
SELECT 'Total Students' as Description, COUNT(*) as Count
FROM users WHERE role = 'STUDENT'
UNION ALL
-- Count active students
SELECT 'Active Students', COUNT(*) 
FROM users WHERE role = 'STUDENT' AND is_active = true
UNION ALL
-- Count inactive students  
SELECT 'Inactive Students', COUNT(*)
FROM users WHERE role = 'STUDENT' AND (is_active = false OR is_active IS NULL);

-- Show test users that might not have been deleted
SELECT 
    id,
    name,
    email,
    student_id,
    is_active
FROM users 
WHERE email IN ('student@example.com', 'admin@example.com')
   OR student_id IN ('STU001', 'R24CS001');
