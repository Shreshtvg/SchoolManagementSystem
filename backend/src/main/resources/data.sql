-- This script will run on startup and populate the database with initial data.

-- Insert the three required roles into the 'roles' table.
INSERT INTO roles(id, name) VALUES(1, 'ROLE_ADMIN') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles(id, name) VALUES(2, 'ROLE_TEACHER') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO roles(id, name) VALUES(3, 'ROLE_PARENT') ON DUPLICATE KEY UPDATE name=name;

-- Password hash for 'password' (BCrypt): $2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m
-- All users will use this password: password

-- ============================================
-- ADMIN USER (1 user)
-- ============================================
INSERT INTO users(id, username, email, password) VALUES(1, 'admin', 'admin@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m') ON DUPLICATE KEY UPDATE username=username;
INSERT INTO user_roles(user_id, role_id) VALUES(1, 1) ON DUPLICATE KEY UPDATE user_id=user_id;

-- ============================================
-- TEACHERS (10 teachers with 10 user accounts)
-- ============================================
-- Teacher Users (IDs 2-11)
INSERT INTO users(id, username, email, password) VALUES
(2, 'sarah.johnson', 'sarah.johnson@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(3, 'michael.chen', 'michael.chen@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(4, 'emily.davis', 'emily.davis@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(5, 'david.wilson', 'david.wilson@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(6, 'jessica.martinez', 'jessica.martinez@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(7, 'james.anderson', 'james.anderson@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(8, 'lisa.thompson', 'lisa.thompson@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(9, 'robert.taylor', 'robert.taylor@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(10, 'amanda.brown', 'amanda.brown@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(11, 'christopher.lee', 'christopher.lee@school.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m')
ON DUPLICATE KEY UPDATE username=username;

-- Teacher Roles
INSERT INTO user_roles(user_id, role_id) VALUES
(2, 2), (3, 2), (4, 2), (5, 2), (6, 2), (7, 2), (8, 2), (9, 2), (10, 2), (11, 2)
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Teacher Profiles
INSERT INTO teachers(id, name, email, subject, user_id) VALUES
(1, 'Sarah Johnson', 'sarah.johnson@school.com', 'Mathematics', 2),
(2, 'Michael Chen', 'michael.chen@school.com', 'Science', 3),
(3, 'Emily Davis', 'emily.davis@school.com', 'English', 4),
(4, 'David Wilson', 'david.wilson@school.com', 'Mathematics', 5),
(5, 'Jessica Martinez', 'jessica.martinez@school.com', 'Science', 6),
(6, 'James Anderson', 'james.anderson@school.com', 'English', 7),
(7, 'Lisa Thompson', 'lisa.thompson@school.com', 'Mathematics', 8),
(8, 'Robert Taylor', 'robert.taylor@school.com', 'Science', 9),
(9, 'Amanda Brown', 'amanda.brown@school.com', 'English', 10),
(10, 'Christopher Lee', 'christopher.lee@school.com', 'Mathematics', 11)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- PARENTS (20 parents with 20 user accounts)
-- ============================================
-- Parent Users (IDs 12-31)
INSERT INTO users(id, username, email, password) VALUES
(12, 'john.smith', 'john.smith@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(13, 'maria.garcia', 'maria.garcia@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(14, 'william.jones', 'william.jones@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(15, 'patricia.miller', 'patricia.miller@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(16, 'richard.moore', 'richard.moore@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(17, 'jennifer.jackson', 'jennifer.jackson@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(18, 'joseph.white', 'joseph.white@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(19, 'linda.harris', 'linda.harris@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(20, 'thomas.martin', 'thomas.martin@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(21, 'barbara.thompson', 'barbara.thompson@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(22, 'charles.garcia', 'charles.garcia@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(23, 'elizabeth.martinez', 'elizabeth.martinez@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(24, 'daniel.robinson', 'daniel.robinson@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(25, 'susan.clark', 'susan.clark@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(26, 'matthew.rodriguez', 'matthew.rodriguez@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(27, 'karen.lewis', 'karen.lewis@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(28, 'anthony.walker', 'anthony.walker@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(29, 'nancy.hall', 'nancy.hall@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(30, 'mark.allen', 'mark.allen@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m'),
(31, 'betty.young', 'betty.young@email.com', '$2a$10$Ea.g./g.1O4j.3tG/d.g.e83v1.w7A5f.4sWJ8.Yy.5iK/C.e.B4m')
ON DUPLICATE KEY UPDATE username=username;

-- Parent Roles
INSERT INTO user_roles(user_id, role_id) VALUES
(12, 3), (13, 3), (14, 3), (15, 3), (16, 3), (17, 3), (18, 3), (19, 3), (20, 3), (21, 3),
(22, 3), (23, 3), (24, 3), (25, 3), (26, 3), (27, 3), (28, 3), (29, 3), (30, 3), (31, 3)
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Parent Profiles
INSERT INTO parents(id, name, email, phone, user_id) VALUES
(1, 'John Smith', 'john.smith@email.com', '555-0101', 12),
(2, 'Maria Garcia', 'maria.garcia@email.com', '555-0102', 13),
(3, 'William Jones', 'william.jones@email.com', '555-0103', 14),
(4, 'Patricia Miller', 'patricia.miller@email.com', '555-0104', 15),
(5, 'Richard Moore', 'richard.moore@email.com', '555-0105', 16),
(6, 'Jennifer Jackson', 'jennifer.jackson@email.com', '555-0106', 17),
(7, 'Joseph White', 'joseph.white@email.com', '555-0107', 18),
(8, 'Linda Harris', 'linda.harris@email.com', '555-0108', 19),
(9, 'Thomas Martin', 'thomas.martin@email.com', '555-0109', 20),
(10, 'Barbara Thompson', 'barbara.thompson@email.com', '555-0110', 21),
(11, 'Charles Garcia', 'charles.garcia@email.com', '555-0111', 22),
(12, 'Elizabeth Martinez', 'elizabeth.martinez@email.com', '555-0112', 23),
(13, 'Daniel Robinson', 'daniel.robinson@email.com', '555-0113', 24),
(14, 'Susan Clark', 'susan.clark@email.com', '555-0114', 25),
(15, 'Matthew Rodriguez', 'matthew.rodriguez@email.com', '555-0115', 26),
(16, 'Karen Lewis', 'karen.lewis@email.com', '555-0116', 27),
(17, 'Anthony Walker', 'anthony.walker@email.com', '555-0117', 28),
(18, 'Nancy Hall', 'nancy.hall@email.com', '555-0118', 29),
(19, 'Mark Allen', 'mark.allen@email.com', '555-0119', 30),
(20, 'Betty Young', 'betty.young@email.com', '555-0120', 31)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- SUBJECTS (3 subjects)
-- ============================================
INSERT INTO subjects(id, name, code) VALUES
(1, 'Science', 'SCI'),
(2, 'Maths', 'MATH'),
(3, 'English', 'ENG')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- CLASSES (10 classes, each with a class teacher)
-- ============================================
INSERT INTO class_details(id, class_name, section, teacher_id) VALUES
(1, '1', 'A', 1),
(2, '2', 'A', 2),
(3, '3', 'A', 3),
(4, '4', 'A', 4),
(5, '5', 'A', 5),
(6, '6', 'A', 6),
(7, '7', 'A', 7),
(8, '8', 'A', 8),
(9, '9', 'A', 9),
(10, '10', 'A', 10)
ON DUPLICATE KEY UPDATE class_name=class_name;

-- ============================================
-- STUDENTS (20 students, 2 per class)
-- ============================================
INSERT INTO students(id, first_name, last_name, dob, gender, parent_id, class_id) VALUES
(1, 'Emma', 'Smith', '2015-03-15', 'Female', 1, 1),
(2, 'Liam', 'Garcia', '2015-07-22', 'Male', 2, 1),
(3, 'Olivia', 'Jones', '2014-05-10', 'Female', 3, 2),
(4, 'Noah', 'Miller', '2014-09-18', 'Male', 4, 2),
(5, 'Ava', 'Moore', '2013-02-25', 'Female', 5, 3),
(6, 'Ethan', 'Jackson', '2013-11-08', 'Male', 6, 3),
(7, 'Sophia', 'White', '2012-06-14', 'Female', 7, 4),
(8, 'Mason', 'Harris', '2012-12-30', 'Male', 8, 4),
(9, 'Isabella', 'Martin', '2011-04-05', 'Female', 9, 5),
(10, 'James', 'Thompson', '2011-08-20', 'Male', 10, 5),
(11, 'Mia', 'Garcia', '2010-01-12', 'Female', 11, 6),
(12, 'Benjamin', 'Martinez', '2010-10-28', 'Male', 12, 6),
(13, 'Charlotte', 'Robinson', '2009-03-17', 'Female', 13, 7),
(14, 'Lucas', 'Clark', '2009-07-03', 'Male', 14, 7),
(15, 'Amelia', 'Rodriguez', '2008-05-19', 'Female', 15, 8),
(16, 'Henry', 'Lewis', '2008-09-25', 'Male', 16, 8),
(17, 'Harper', 'Walker', '2007-02-11', 'Female', 17, 9),
(18, 'Alexander', 'Hall', '2007-11-07', 'Male', 18, 9),
(19, 'Evelyn', 'Allen', '2006-06-23', 'Female', 19, 10),
(20, 'Daniel', 'Young', '2006-12-15', 'Male', 20, 10)
ON DUPLICATE KEY UPDATE first_name=first_name;

-- ============================================
-- MARKS (All 20 students × 3 subjects = 60 marks records)
-- ============================================
-- Class 1 Students (Emma, Liam)
INSERT INTO marks(id, student_id, subject_id, marks_obtained, grade) VALUES
(1, 1, 1, 85, 'A'), (2, 1, 2, 92, 'A+'), (3, 1, 3, 78, 'B+'),
(4, 2, 1, 88, 'A'), (5, 2, 2, 90, 'A'), (6, 2, 3, 82, 'A'),
-- Class 2 Students (Olivia, Noah)
(7, 3, 1, 75, 'B+'), (8, 3, 2, 80, 'A'), (9, 3, 3, 85, 'A'),
(10, 4, 1, 90, 'A'), (11, 4, 2, 95, 'A+'), (12, 4, 3, 88, 'A'),
-- Class 3 Students (Ava, Ethan)
(13, 5, 1, 82, 'A'), (14, 5, 2, 78, 'B+'), (15, 5, 3, 80, 'A'),
(16, 6, 1, 88, 'A'), (17, 6, 2, 85, 'A'), (18, 6, 3, 90, 'A'),
-- Class 4 Students (Sophia, Mason)
(19, 7, 1, 92, 'A+'), (20, 7, 2, 88, 'A'), (21, 7, 3, 85, 'A'),
(22, 8, 1, 80, 'A'), (23, 8, 2, 82, 'A'), (24, 8, 3, 78, 'B+'),
-- Class 5 Students (Isabella, James)
(25, 9, 1, 85, 'A'), (26, 9, 2, 90, 'A'), (27, 9, 3, 88, 'A'),
(28, 10, 1, 78, 'B+'), (29, 10, 2, 85, 'A'), (30, 10, 3, 82, 'A'),
-- Class 6 Students (Mia, Benjamin)
(31, 11, 1, 90, 'A'), (32, 11, 2, 92, 'A+'), (33, 11, 3, 88, 'A'),
(34, 12, 1, 82, 'A'), (35, 12, 2, 80, 'A'), (36, 12, 3, 85, 'A'),
-- Class 7 Students (Charlotte, Lucas)
(37, 13, 1, 88, 'A'), (38, 13, 2, 85, 'A'), (39, 13, 3, 90, 'A'),
(40, 14, 1, 75, 'B+'), (41, 14, 2, 78, 'B+'), (42, 14, 3, 80, 'A'),
-- Class 8 Students (Amelia, Henry)
(43, 15, 1, 92, 'A+'), (44, 15, 2, 90, 'A'), (45, 15, 3, 95, 'A+'),
(46, 16, 1, 80, 'A'), (47, 16, 2, 82, 'A'), (48, 16, 3, 78, 'B+'),
-- Class 9 Students (Harper, Alexander)
(49, 17, 1, 85, 'A'), (50, 17, 2, 88, 'A'), (51, 17, 3, 82, 'A'),
(52, 18, 1, 90, 'A'), (53, 18, 2, 85, 'A'), (54, 18, 3, 88, 'A'),
-- Class 10 Students (Evelyn, Daniel)
(55, 19, 1, 88, 'A'), (56, 19, 2, 92, 'A+'), (57, 19, 3, 90, 'A'),
(58, 20, 1, 82, 'A'), (59, 20, 2, 80, 'A'), (60, 20, 3, 85, 'A')
ON DUPLICATE KEY UPDATE marks_obtained=marks_obtained;

-- ============================================
-- ATTENDANCE (June and July for all 20 students = 40 records)
-- ============================================
-- June Attendance (20 records)
INSERT INTO attendance(id, student_id, month, no_of_days_attended, total_working_days, percentage, status) VALUES
(1, 1, 'June', 22, 25, 88.0, 'GOOD'),
(2, 2, 'June', 24, 25, 96.0, 'GOOD'),
(3, 3, 'June', 20, 25, 80.0, 'GOOD'),
(4, 4, 'June', 23, 25, 92.0, 'GOOD'),
(5, 5, 'June', 21, 25, 84.0, 'GOOD'),
(6, 6, 'June', 19, 25, 76.0, 'POOR'),
(7, 7, 'June', 24, 25, 96.0, 'GOOD'),
(8, 8, 'June', 22, 25, 88.0, 'GOOD'),
(9, 9, 'June', 23, 25, 92.0, 'GOOD'),
(10, 10, 'June', 20, 25, 80.0, 'GOOD'),
(11, 11, 'June', 25, 25, 100.0, 'GOOD'),
(12, 12, 'June', 21, 25, 84.0, 'GOOD'),
(13, 13, 'June', 22, 25, 88.0, 'GOOD'),
(14, 14, 'June', 18, 25, 72.0, 'POOR'),
(15, 15, 'June', 24, 25, 96.0, 'GOOD'),
(16, 16, 'June', 20, 25, 80.0, 'GOOD'),
(17, 17, 'June', 23, 25, 92.0, 'GOOD'),
(18, 18, 'June', 22, 25, 88.0, 'GOOD'),
(19, 19, 'June', 24, 25, 96.0, 'GOOD'),
(20, 20, 'June', 21, 25, 84.0, 'GOOD'),
-- July Attendance (20 records)
(21, 1, 'July', 23, 26, 88.5, 'GOOD'),
(22, 2, 'July', 25, 26, 96.2, 'GOOD'),
(23, 3, 'July', 21, 26, 80.8, 'GOOD'),
(24, 4, 'July', 24, 26, 92.3, 'GOOD'),
(25, 5, 'July', 22, 26, 84.6, 'GOOD'),
(26, 6, 'July', 20, 26, 76.9, 'POOR'),
(27, 7, 'July', 25, 26, 96.2, 'GOOD'),
(28, 8, 'July', 23, 26, 88.5, 'GOOD'),
(29, 9, 'July', 24, 26, 92.3, 'GOOD'),
(30, 10, 'July', 21, 26, 80.8, 'GOOD'),
(31, 11, 'July', 26, 26, 100.0, 'GOOD'),
(32, 12, 'July', 22, 26, 84.6, 'GOOD'),
(33, 13, 'July', 23, 26, 88.5, 'GOOD'),
(34, 14, 'July', 19, 26, 73.1, 'POOR'),
(35, 15, 'July', 25, 26, 96.2, 'GOOD'),
(36, 16, 'July', 21, 26, 80.8, 'GOOD'),
(37, 17, 'July', 24, 26, 92.3, 'GOOD'),
(38, 18, 'July', 23, 26, 88.5, 'GOOD'),
(39, 19, 'July', 25, 26, 96.2, 'GOOD'),
(40, 20, 'July', 22, 26, 84.6, 'GOOD')
ON DUPLICATE KEY UPDATE no_of_days_attended=no_of_days_attended;

-- ============================================
-- FEES (20 fees records, one for each student)
-- ============================================
INSERT INTO fees(id, student_id, total_amount, amount_paid, balance_amount, due_date, status) VALUES
-- Class 1 Students (Emma, Liam) - Some paid, some pending
(1, 1, 5000.00, 5000.00, 0.00, '2024-09-15', 'PAID'),
(2, 2, 5000.00, 3000.00, 2000.00, '2024-09-15', 'PARTIAL'),
-- Class 2 Students (Olivia, Noah)
(3, 3, 5500.00, 5500.00, 0.00, '2024-09-15', 'PAID'),
(4, 4, 5500.00, 0.00, 5500.00, '2024-09-15', 'PENDING'),
-- Class 3 Students (Ava, Ethan)
(5, 5, 6000.00, 4000.00, 2000.00, '2024-09-15', 'PARTIAL'),
(6, 6, 6000.00, 6000.00, 0.00, '2024-09-15', 'PAID'),
-- Class 4 Students (Sophia, Mason)
(7, 7, 6500.00, 6500.00, 0.00, '2024-09-15', 'PAID'),
(8, 8, 6500.00, 0.00, 6500.00, '2024-09-15', 'PENDING'),
-- Class 5 Students (Isabella, James)
(9, 9, 7000.00, 5000.00, 2000.00, '2024-09-15', 'PARTIAL'),
(10, 10, 7000.00, 7000.00, 0.00, '2024-09-15', 'PAID'),
-- Class 6 Students (Mia, Benjamin)
(11, 11, 7500.00, 7500.00, 0.00, '2024-09-15', 'PAID'),
(12, 12, 7500.00, 3000.00, 4500.00, '2024-09-15', 'PARTIAL'),
-- Class 7 Students (Charlotte, Lucas)
(13, 13, 8000.00, 0.00, 8000.00, '2024-09-15', 'PENDING'),
(14, 14, 8000.00, 8000.00, 0.00, '2024-09-15', 'PAID'),
-- Class 8 Students (Amelia, Henry)
(15, 15, 8500.00, 8500.00, 0.00, '2024-09-15', 'PAID'),
(16, 16, 8500.00, 4000.00, 4500.00, '2024-09-15', 'PARTIAL'),
-- Class 9 Students (Harper, Alexander)
(17, 17, 9000.00, 6000.00, 3000.00, '2024-09-15', 'PARTIAL'),
(18, 18, 9000.00, 9000.00, 0.00, '2024-09-15', 'PAID'),
-- Class 10 Students (Evelyn, Daniel)
(19, 19, 9500.00, 9500.00, 0.00, '2024-09-15', 'PAID'),
(20, 20, 9500.00, 0.00, 9500.00, '2024-09-15', 'PENDING')
ON DUPLICATE KEY UPDATE total_amount=total_amount;
