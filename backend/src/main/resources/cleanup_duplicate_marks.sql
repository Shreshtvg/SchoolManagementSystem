-- ============================================
-- Script to Remove Duplicate Marks from Database
-- ============================================
-- This script removes duplicate marks, keeping only the latest mark record 
-- for each student-subject combination (the one with the highest ID).
-- 
-- INSTRUCTIONS:
-- 1. Connect to your MySQL database: school_db
-- 2. Run this script in your MySQL client or command line
-- 3. This will permanently delete duplicate records
-- ============================================

-- Step 1: View duplicates before deletion (for reference)
-- Uncomment the line below to see which records will be affected:
-- SELECT student_id, subject_id, COUNT(*) as duplicate_count, GROUP_CONCAT(id ORDER BY id) as mark_ids
-- FROM marks
-- GROUP BY student_id, subject_id
-- HAVING COUNT(*) > 1
-- ORDER BY student_id, subject_id;

-- Step 2: Delete duplicate marks, keeping only the one with the highest ID (most recent)
-- This query keeps the mark with the highest ID for each student-subject combination
-- and deletes all older duplicates
DELETE m1 FROM marks m1
INNER JOIN marks m2 
WHERE m1.student_id = m2.student_id 
  AND m1.subject_id = m2.subject_id
  AND m1.id < m2.id;

-- Step 3: Verify no duplicates remain
-- Uncomment to verify:
-- SELECT student_id, subject_id, COUNT(*) as count
-- FROM marks
-- GROUP BY student_id, subject_id
-- HAVING COUNT(*) > 1;
-- This should return no rows if cleanup was successful

-- ============================================
-- Note: After running this script, restart your Spring Boot application
-- The backend now prevents new duplicates from being created
-- ============================================

